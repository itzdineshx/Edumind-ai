import { Outlet, useLocation } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";

export function Root() {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  if (isDashboard) {
    return (
      <DashboardLayout>
        <Outlet />
      </DashboardLayout>
    );
  }

  return <Outlet />;
}
