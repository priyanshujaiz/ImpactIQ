
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AppLayout from "./components/layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import Zones from "./pages/Zones";
import Volunteers from "./pages/Volunteers";
import Allocation from './pages/Allocation';
import Reports from './pages/Reports';
import Simulation from './pages/Simulation';


// 🔐 Protected Route
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Layout */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/zones"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Zones />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/volunteers"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Volunteers />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/allocation"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Allocation />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/simulation"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Simulation />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Reports />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/dashboard" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;