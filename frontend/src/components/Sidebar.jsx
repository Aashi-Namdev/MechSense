import { Link, NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { FiGrid, FiCpu, FiActivity, FiBarChart2, FiHome } from "react-icons/fi";

import logo from "../assets/MechSenseLogo.png";
import { kpiCards } from "../data/dashboard.js";
import ThemeToggle from "./ThemeToggle.jsx";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: FiGrid },
  { label: "Machines", to: "/machines", icon: FiCpu },
  { label: "Predict", to: "/predict", icon: FiActivity },
  { label: "Model Performance", to: "/model-performance", icon: FiBarChart2 },
];

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col border-r border-border-subtle bg-bg-panel lg:w-64">
      {/* Brand */}
      <header className="flex items-center justify-center gap-3 border-b border-border-subtle px-2 py-4 lg:justify-start lg:px-5">
        <img
          src={logo}
          alt="MechSense logo"
          className="h-15 w-15  shrink-0 object-contain"
        />
        <div className="hidden min-w-0 leading-tight lg:block">
          <p className="text-base font-semibold text-text-main">MechSense</p>
          <p className="text-[11px] uppercase tracking-widest text-text-muted">
            Predictive Maintenance
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex-1 space-y-1  p-2 lg:p-3">
        {navItems.map((item) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `group relative flex items-center justify-center gap-3 rounded-md px-2 py-2.5 text-sm font-medium transition-colors lg:justify-start lg:px-3 ${
                  isActive
                    ? "bg-bg-card text-text-main"
                    : "text-text-muted hover:bg-bg-card hover:text-text-secondary"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <item.icon
                    className={`shrink-0 text-[18px] transition-colors ${
                      isActive
                        ? "text-primary"
                        : "text-text-muted group-hover:text-text-secondary"
                    }`}
                  />
                  <span className="hidden lg:block">{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* System status */}
      <footer className="space-y-1 border-t border-border-subtle p-2 lg:space-y-2 lg:p-4">
        <ThemeToggle
          showLabel
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-bg-card hover:text-text-secondary lg:justify-start lg:px-3"
        />
        <Link
          to="/"
          className="group relative flex items-center justify-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-bg-card hover:text-text-secondary lg:justify-start lg:px-3"
        >
          <FiHome className="shrink-0 text-[18px] text-text-muted transition-colors group-hover:text-text-secondary" />
          <span className="hidden lg:block">Go Back</span>
        </Link>
        <div className="flex items-center justify-center gap-3 rounded-md bg-bg-card px-3 py-2.5 lg:justify-start">
          <span className="h-2 w-2 shrink-0 rounded-full bg-status-success" />
          <div className="hidden min-w-0 lg:block">
            <p className="text-xs font-medium text-text-secondary">
              System online
            </p>
            <p className="truncate text-[11px] text-text-muted">
              Monitoring {kpiCards.totalRecords.toLocaleString()} machine
              records
            </p>
          </div>
        </div>
        <p className="mt-3 hidden text-center text-[10px]  tracking-widest text-text-muted lg:block">
          MECHSENSE &bull; IIoT
        </p>
      </footer>
    </aside>
  );
}

export default Sidebar;
