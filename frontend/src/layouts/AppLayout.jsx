import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Footer from "../components/landing/Footer.jsx";

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="min-h-screen pl-16 lg:pl-64">
        <Outlet />
        <Footer />
      </main>
    </div>
  );
}

export default AppLayout;
