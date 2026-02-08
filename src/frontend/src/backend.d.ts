import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Order {
    url: string;
    status: OrderStatus;
    owner: Principal;
    package: string;
    createdAt: bigint;
    orderId: bigint;
    price: bigint;
    packageId: bigint;
}
export interface UserProfile {
    bio?: string;
    username: string;
    email?: string;
    phone?: string;
    profilePicture?: string;
}
export enum OrderStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    failed = "failed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOrderWithWallet(url: string, price: bigint, package: string, packageId: bigint): Promise<bigint>;
    adminDistributeFunds(toUser: Principal, amount: bigint): Promise<void>;
    adminTopUp(amount: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAdminWalletBalance(): Promise<bigint>;
    getAdminWalletBalanceForAdminNavBar(): Promise<bigint>;
    getAdminWalletBalanceLegacy(): Promise<bigint>;
    getAllOrders(): Promise<Array<Order>>;
    getAllUsers(): Promise<Array<[Principal, bigint]>>;
    getBalance(): Promise<bigint>;
    getBalanceForAdminSidebar(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrderById(orderId: bigint): Promise<Order | null>;
    getUserBalance(user: Principal): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    onboarding(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateOrderStatus(orderId: bigint, status: OrderStatus): Promise<void>;
}
