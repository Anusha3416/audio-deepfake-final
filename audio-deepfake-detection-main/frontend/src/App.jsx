import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NavBar } from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { Hero } from "./components/Hero";
import Login from "./pages/Login";
import SpamHistory from "./pages/SpamHistory";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <SpamHistory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
