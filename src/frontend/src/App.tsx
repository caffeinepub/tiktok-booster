import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AppLayout from "./components/AppLayout";
import AdminPage from "./pages/AdminPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import CommunityPage from "./pages/CommunityPage";
import CreditsPage from "./pages/CreditsPage";
import DashboardPage from "./pages/DashboardPage";
import DistributePage from "./pages/DistributePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SignUpPage from "./pages/SignUpPage";
import SimulatorPage from "./pages/SimulatorPage";
import StatusPage from "./pages/StatusPage";

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const creditsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/credits",
  component: CreditsPage,
});

const statusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/status/$id",
  component: StatusPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const adminUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/users",
  component: AdminUsersPage,
});

const adminDistributeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/distribute",
  component: DistributePage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignUpPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

const communityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/community",
  component: CommunityPage,
});

const simulatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/simulator",
  component: SimulatorPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  creditsRoute,
  statusRoute,
  adminRoute,
  adminUsersRoute,
  adminDistributeRoute,
  dashboardRoute,
  profileRoute,
  signUpRoute,
  loginRoute,
  communityRoute,
  simulatorRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
