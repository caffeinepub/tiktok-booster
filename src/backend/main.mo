import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Time "mo:core/Time";
import Migration "migration";

(with migration = Migration.run)
actor {
  var nextOrderId = 1;
  var adminWallet : Nat = 10_000;
  var isInitialized = false;

  let userBalances = Map.empty<Principal, Nat>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let orders = Map.empty<Nat, Order>();

  var accessControlState = AccessControl.initState();

  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    profilePicture : ?Text;
    bio : ?Text;
    username : Text;
    email : ?Text;
    phone : ?Text;
  };

  public type OrderStatus = {
    #pending;
    #completed;
    #cancelled;
    #failed;
  };

  public type Order = {
    orderId : Nat;
    owner : Principal;
    price : Nat;
    url : Text;
    package : Text;
    packageId : Nat;
    status : OrderStatus;
    createdAt : Int;
  };

  // Ensure initialization happens on first call by any principal
  // The MixinAuthorization should provide initializeAccessControl which calls AccessControl.initialize
  // This is a safety check to ensure the system is initialized
  private func ensureInitialized(caller : Principal) {
    if (not isInitialized) {
      Runtime.trap("Authorization system not ready, reload and try again");
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    ensureInitialized(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func onboarding() : async () {
    ensureInitialized(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can receive funds");
    };
    switch (userBalances.get(caller)) {
      case (?_existingBalance) {
        Runtime.trap("User already exists in the database");
      };
      case (null) {
        if (adminWallet < 10) {
          Runtime.trap("Not enough funds in admin wallet! Internal admin wallet does not have enough funds to perform this transaction. Please contact a system administrator!");
        };
        adminWallet -= 10;
        userBalances.add(caller, 10);
      };
    };
  };

  public query ({ caller }) func getBalance() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check balance");
    };
    switch (userBalances.get(caller)) {
      case (?balance) { balance };
      case (null) { 0 };
    };
  };

  public query ({ caller }) func getAdminWalletBalance() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can access wallet balance");
    };
    adminWallet;
  };

  public query ({ caller }) func getAdminWalletBalanceLegacy() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can access wallet balance");
    };
    adminWallet;
  };

  public shared ({ caller }) func adminDistributeFunds(toUser : Principal, amount : Nat) : async () {
    ensureInitialized(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can distribute funds");
    };
    let currentBalance = switch (userBalances.get(toUser)) {
      case (?existingBalance) { existingBalance };
      case (null) { 0 };
    };
    if (adminWallet < amount) {
      Runtime.trap("Insufficient balance in admin wallet");
    };
    adminWallet -= amount;
    userBalances.add(toUser, currentBalance + amount);
  };

  public shared ({ caller }) func adminTopUp(amount : Nat) : async () {
    ensureInitialized(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can top up the wallet");
    };
    if (amount == 0) {
      Runtime.trap("Cannot top up with zero amount. Please specify a positive amount.");
    };
    adminWallet += amount;
  };

  public shared ({ caller }) func addOrderWithWallet(url : Text, price : Nat, package : Text, packageId : Nat) : async Nat {
    ensureInitialized(caller);
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    let currentBalance = switch (userBalances.get(caller)) {
      case (?balance) { balance };
      case (null) { 0 };
    };

    if (currentBalance < price) {
      Runtime.trap("Insufficient balance to place order");
    };

    userBalances.add(caller, currentBalance - price);
    adminWallet += price;

    let orderId = nextOrderId;
    let newOrder : Order = {
      orderId;
      owner = caller;
      price;
      url;
      package;
      packageId;
      status = #pending;
      createdAt = Time.now();
    };
    orders.add(orderId, newOrder);
    nextOrderId += 1;
    orderId;
  };

  public query ({ caller }) func getOrderById(orderId : Nat) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    let order = orders.get(orderId);
    switch (order) {
      case (?order) {
        if (order.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        ?order;
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
    ensureInitialized(caller);
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order with id " # orderId.toText() # " does not exist! ") };
      case (?order) { order };
    };
    let updatedOrder = { order with status };
    orders.add(orderId, updatedOrder);
  };

  public query ({ caller }) func getAllUsers() : async [(Principal, Nat)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userBalances.toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getUserBalance(user : Principal) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can access wallet balance");
    };
    switch (userBalances.get(user)) {
      case (?balance) { balance };
      case (null) { 0 };
    };
  };

  public query ({ caller }) func getAdminWalletBalanceForAdminNavBar() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can access wallet balance");
    };
    adminWallet;
  };

  public query ({ caller }) func getBalanceForAdminSidebar() : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can access wallet balance");
    };
    adminWallet;
  };
};
