import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// requiredRole is optional: "admin" restricts to admins only
const ProtectedRoute = ({ children, requiredRole }) => {
  const { userInfo } = useContext(AuthContext);

  if (!userInfo) return <Navigate to="/login" replace />;
  if (requiredRole && userInfo.role !== requiredRole) return <Navigate to="/" replace />;

  return children;
};

export default ProtectedRoute;
