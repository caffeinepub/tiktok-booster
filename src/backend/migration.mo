import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldOrder = {
    orderId : Nat;
    price : Nat;
    url : Text;
    package : Text;
    packageId : Nat;
    status : { #pending; #completed; #cancelled; #failed };
    createdAt : Int;
  };

  type NewOrder = {
    orderId : Nat;
    owner : Principal;
    price : Nat;
    url : Text;
    package : Text;
    packageId : Nat;
    status : { #pending; #completed; #cancelled; #failed };
    createdAt : Int;
  };

  type OldActor = {
    var adminWallet : Nat;
    var nextOrderId : Nat;
    userBalances : Map.Map<Principal, Nat>;
    userProfiles : Map.Map<Principal, { profilePicture : ?Text; bio : ?Text; username : Text; email : ?Text; phone : ?Text }>;
    orders : Map.Map<Nat, OldOrder>;
  };

  type NewActor = {
    var adminWallet : Nat;
    var nextOrderId : Nat;
    userBalances : Map.Map<Principal, Nat>;
    userProfiles : Map.Map<Principal, { profilePicture : ?Text; bio : ?Text; username : Text; email : ?Text; phone : ?Text }>;
    orders : Map.Map<Nat, NewOrder>;
  };

  public func run(old : OldActor) : NewActor {
    let convertedOrders = old.orders.map<Nat, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        {
          oldOrder with owner = Principal.anonymous();
        };
      }
    );
    {
      var adminWallet = 10_000 : Nat;
      var nextOrderId = old.nextOrderId;
      userBalances = old.userBalances;
      userProfiles = old.userProfiles;
      orders = convertedOrders;
    };
  };
};
