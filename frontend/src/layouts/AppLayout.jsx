import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="min-h-screen pl-16 lg:pl-64">
        <Outlet />
        <footer className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-text-muted">
            © 2026 MechSense · IIoT Predictive Maintenance
          </p>
        </footer>
      </main>
    </div>
  );
}

export default AppLayout;
