// src/components/Register.js
import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const { register } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // ✅ fixed missing variable name

  const handleRegister = () => {
    if (register(username, password)) {
      setMessage("✅ Registration successful! Please log in.");
    } else {
      setMessage("⚠️ Username already exists.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Register</h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full px-4 py-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {message && (
          <p
            className={`mb-4 text-sm ${
              message.includes("successful") ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={handleRegister}
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-200"
        >
          Register
        </button>
      </div>
    </div>
  );
}
