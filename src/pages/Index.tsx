import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Welcome from "./Welcome";
import Dashboard from "./Dashboard";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // For demo purposes, we'll show the welcome page first
  // In a real app, you'd check authentication status
  if (!isAuthenticated) {
    return <Welcome />;
  }

  return <Dashboard />;
};

export default Index;
