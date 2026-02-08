import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import AccessControl "authorization/access-control";
import Text "mo:core/Text";

module {
  type OldUserProfile = {
    profilePicture : ?Text;
    bio : ?Text;
    username : Text;
    email : ?Text;
    phone : ?Text;
  };

  type OldOrder = {
    orderId : Nat;
    owner : Principal;
    price : Nat;
    url : Text;
    package : Text;
    packageId : Nat;
    status : {
      #pending;
      #completed;
      #cancelled;
      #failed;
    };
    createdAt : Int;
  };

  type OldActor = {
    nextOrderId : Nat;
    adminWallet : Nat;
    userBalances : Map.Map<Principal, Nat>;
    userProfiles : Map.Map<Principal, OldUserProfile>;
    orders : Map.Map<Nat, OldOrder>;
    accessControlState : AccessControl.AccessControlState;
    isInitialized : Bool;
  };

  type NewUserProfile = {
    profilePicture : ?Text;
    bio : ?Text;
    username : Text;
    email : ?Text;
    phone : ?Text;
  };

  type NewOrder = {
    orderId : Nat;
    owner : Principal;
    price : Nat;
    url : Text;
    package : Text;
    packageId : Nat;
    status : {
      #pending;
      #completed;
      #cancelled;
      #failed;
    };
    createdAt : Int;
  };

  type NewActor = {
    nextOrderId : Nat;
    adminWallet : Nat;
    userBalances : Map.Map<Principal, Nat>;
    userProfiles : Map.Map<Principal, NewUserProfile>;
    orders : Map.Map<Nat, NewOrder>;
    accessControlState : AccessControl.AccessControlState;
    isInitialized : Bool;
  };

  public func run(old : OldActor) : NewActor {
    {
      nextOrderId = old.nextOrderId;
      adminWallet = old.adminWallet;
      userBalances = old.userBalances;
      userProfiles = old.userProfiles;
      orders = old.orders;
      accessControlState = old.accessControlState;
      isInitialized = old.isInitialized;
    };
  };
};
