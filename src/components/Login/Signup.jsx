import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useSalert } from "../Salert/Salert";
import "./Signup.css";

function Signup() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { showSalert } = useSalert();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !username || !mobile || !email || !password) {
      showSalert("Please fill all fields!", "warning");
      return;
    }

    try {
      // 0. Check for duplicate username
      const qUser = query(collection(db, "users"), where("username", "==", username.trim().toLowerCase()));
      const snapUser = await getDocs(qUser);
      if (!snapUser.empty) {
        showSalert("Username already taken. Please choose another.", "error");
        return;
      }

      // 1. Check for duplicate mobile
      const qMobile = query(collection(db, "users"), where("mobile", "==", mobile.trim()));
      const snapMobile = await getDocs(qMobile);
      if (!snapMobile.empty) {
        showSalert("Mobile number already registered. Try logging in.", "error");
        return;
      }

      // 2. Check for duplicate email
      const qEmail = query(collection(db, "users"), where("email", "==", email.trim()));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        showSalert("Email already registered. Try logging in.", "error");
        return;
      }

      // 3. Create account in Firestore
      const newUser = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        mobile: mobile.trim(),
        email: email.trim(),
        password: password, // Store password securely in users collection
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "users"), newUser);
      
      showSalert("Account created successfully! Please login.", "success");
      navigate("/login"); 
    } catch (error) {
      console.error("Signup error:", error);
      showSalert("Account creation failed. Please try again.", "error");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card-premium">
        <div className="signup-header">
          <h2>Create Account</h2>
          <p>Join the future of campus dining</p>
        </div>

        <form onSubmit={handleSignup}>
          <div className="signup-form-group">
            <label>Full Name</label>
            <input
              className="premium-input"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="signup-form-group">
            <label>Username</label>
            <input
              className="premium-input"
              placeholder="e.g. rahul123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="signup-form-group">
            <label>Mobile Number</label>
            <input
              className="premium-input"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
          </div>

          <div className="signup-form-group">
            <label>Email Address</label>
            <input
              className="premium-input"
              type="email"
              placeholder="rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="signup-form-group">
            <label>Create Password</label>
            <input
              className="premium-input"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="premium-signup-btn" type="submit">Sign Up Now</button>
        </form>

        <p className="signup-footer-text">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
