import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

// Persist the balance increase from 1,000 to 10,000 PKR

actor {
  var adminWallet = 10_000 : Nat;

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

  public query ({ caller }) func getUserWalletAddress(_userId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access wallet information");
    };
    Runtime.trap("Not implemented: User wallet addresses are currently managed by the external ICP Wallet system. This method will be used to retrieve user wallet addresses once Starknet egress is available on ICP, enabling developers to manage wallet creation and storage of information directly in the canisters.");
  };
};
