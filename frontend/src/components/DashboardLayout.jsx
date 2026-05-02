import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import Sidebar from "./Sidebar";

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-x-hidden" data-testid="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}
