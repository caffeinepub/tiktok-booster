import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  var adminWallet = 10_000 : Nat;
  var nextOrderId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userBalances = Map.empty<Principal, Nat>();

  public type UserProfile = {
    profilePicture : ?Text;
    bio : ?Text;
    username : Text;
    email : ?Text;
    phone : ?Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

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

  let orders = Map.empty<Nat, Order>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func onboarding() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can receive funds");
    };
    switch (userBalances.get(caller)) {
      case (?_existingBalance) {
        Runtime.trap("User already exists in the database");
      };
      case (null) {
        if (adminWallet < 10) {
          Runtime.trap("Admin balance not enough! Internal admin wallet does not have enough funds to perform this transaction. Please contact a system Administrator!");
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

  public shared ({ caller }) func distributeFunds(toUser : Principal, amount : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admin can distribute funds");
    };
    if (amount > adminWallet) {
      Runtime.trap("Insufficient admin wallet funds");
    };
    let currentBalance = switch (userBalances.get(toUser)) {
      case (?existingBalance) { existingBalance };
      case (null) { 0 };
    };
    adminWallet -= amount;
    userBalances.add(toUser, currentBalance + amount);
  };

  // Add new order - requires user authentication
  public shared ({ caller }) func addOrder(url : Text, price : Nat, package : Text, packageId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };
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

  // Get order by id - owner or admin only
  public query ({ caller }) func getOrderById(orderId : Nat) : async ?Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    let order = orders.get(orderId);
    switch (order) {
      case (?o) {
        if (o.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
      case (null) { null };
    };
  };

  // Update order status - admin only
  public shared ({ caller }) func updateOrderStatus(orderId : Nat, status : OrderStatus) : async () {
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

  // Get all orders. Admin only.
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can access all orders");
    };
    orders.values().toArray();
  };
};
