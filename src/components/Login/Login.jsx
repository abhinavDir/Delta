import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useSalert } from "../Salert/Salert";
import "./Login.css";

function Login({ setUser }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { showSalert } = useSalert();
  const [userState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser"));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (userState) {
      navigate("/");
    }
  }, [userState, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showSalert("Please enter both username and password!", "warning");
      return;
    }

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", username.trim().toLowerCase())
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        showSalert("No account found with this username. Please sign up!", "error");
        return;
      }

      const userData = { uid: snap.docs[0].id, ...snap.docs[0].data() };

      if (userData.password === password) {
        setUser(userData);
        localStorage.removeItem("isAdmin");
        localStorage.setItem("currentUser", JSON.stringify(userData));
        showSalert("Welcome back!", "success");
        navigate("/");
      } else {
        showSalert("Invalid Password! Please try again.", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showSalert("Authentication failed. Please try again.", "error");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card-premium">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to continue your feast</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="login-form-group">
            <label>Username</label>
            <input
              className="premium-input"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="login-form-group">
            <label>Password</label>
            <input
              className="premium-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="premium-login-btn" type="submit">Login Now</button>
        </form>

        <p className="login-footer-text">
          Don't have an account? <Link to="/signup">Join Us</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
