import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import Login from "./pages/Login.tsx";
import PractitionerDetail from "./pages/PractitionerDetail.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import ClientDashboard from "./pages/ClientDashboard.tsx";
import {  useEffect, useState } from "react";
import Register from "./pages/Register.tsx";
import auth from "./api/user/auth.ts";
import { toast } from "react-toastify";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("yasho"));
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<{ role: string } | null>(null);

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem("yasho");
      setLoading(false);
      if (!token) return;

      try {
        const userData = await auth.getMe();
        if (userData.status_code !== 0) {
          toast.error(userData.error);
          return;
        }
        if (userData?.data?.profile?.entity_type) {
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              isAuthenticated && user?.data?.profile?.entity_type ? (
                <Navigate to={`/${user?.data?.profile?.entity_type}`} replace />
              ) : (
                <Login
                  setIsAuthenticated={setIsAuthenticated}
                  setLoading={setLoading}
                  setUser={setUser}
                  loading={loading}
                />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated && user && user?.data?.profile?.entity_type ? (
                <Navigate
                  to={`/${user && user?.data?.profile?.entity_type}`}
                  replace
                />
              ) : (
                <Register />
              )
            }
          />
          <Route
            path="/client"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                loading={loading}
                allowedRoles={["client"]}
              >
                <ClientDashboard
                  user={user}
                  setIsAuthenticated={setIsAuthenticated}
                  setUser={setUser}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pract"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                loading={loading}
                allowedRoles={["practitioner"]}
              >
                <PractitionerDetail
                  setIsAuthenticated={setIsAuthenticated}
                  setUser={setUser}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                loading={loading}
                allowedRoles={["admin"]}
              >
                <AdminDashboard
                  user={user}
                  setIsAuthenticated={setIsAuthenticated}
                  setUser={setUser}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
