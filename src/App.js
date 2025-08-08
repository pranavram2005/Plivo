import React, { useContext, useState } from "react";
import { AuthContext, AuthProvider } from "./context/AuthContext";
import Audio from "./components/Audio";
import ImageAnalysis from "./components/ImageAnalysis";
import Summarizer from "./components/Summarizer";
import Login from "./components/Login";
import Register from "./components/Register";

function AppContent() {
  const { user, logout } = useContext(AuthContext);
  const [showRegister, setShowRegister] = useState(false);

  if (!user) {
    return (
      <div>
        {showRegister ? <Register /> : <Login setShowRegister = {setShowRegister}/>}
        <button onClick={() => setShowRegister(!showRegister)}>
          {showRegister ? "Go to Login" : "Go to Register"}
        </button>
      </div>
    );
  }

  return (
    <div className="App">
      <h2>Welcome, {user.username}</h2>
      <button onClick={logout}>Logout</button>
      <Audio />
      <ImageAnalysis />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
