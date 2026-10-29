import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { userInfo, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-primary text-white px-6 py-4 flex justify-between items-center shadow-md">
      <Link to="/" className="text-xl font-bold">
        EMTBS
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/" className="hover:underline">
          Events
        </Link>
        {userInfo && userInfo.role === "admin" && (
          <Link to="/admin" className="hover:underline">
            Admin Dashboard
          </Link>
        )}
        {userInfo && userInfo.role === "user" && (
          <Link to="/my-bookings" className="hover:underline">
            My Bookings
          </Link>
        )}
        {userInfo ? (
          <>
            <span className="text-sm opacity-90">Hi, {userInfo.name}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-primary px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white text-primary px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
