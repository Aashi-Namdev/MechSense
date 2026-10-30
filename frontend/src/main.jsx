import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import AppLayout from "./layouts/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Machines from "./pages/Machines.jsx";
import MachinesDetail from "./pages/MachinesDetail.jsx";
import Predict from "./pages/Predict.jsx";
import ModelPerformance from "./pages/ModelPerformance.jsx";
import Landing from "./pages/Landing.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Landing />} />
      <Route element={<AppLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="machines" element={<Machines />} />
        <Route path="machines/:id" element={<MachinesDetail />} />
        <Route path="predict" element={<Predict />} />
        <Route path="model-performance" element={<ModelPerformance />} />
      </Route>
    </>,
  ),
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
