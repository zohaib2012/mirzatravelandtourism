import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const AgentRoute = ({ children }) => {
  const { isAuthenticated, isAgent } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAgent) return <Navigate to="/admin" replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};
