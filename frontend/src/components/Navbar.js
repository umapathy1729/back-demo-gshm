import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav>
      <Link to="/" className="brand">🛒 MERN Shop</Link>
      <div>
        <Link to="/products">Products</Link>
        {user ? (
          <>
            <Link to="/orders">My Orders</Link>
            <span style={{ marginLeft: "1rem", color: "#aaa" }}>
              Hi, {user.name}
            </span>
            <button
              onClick={handleLogout}
              style={{ marginLeft: "1rem", background: "none", border: "1px solid #e94560",
                color: "#e94560", borderRadius: "6px", padding: ".3rem .8rem", cursor: "pointer" }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
