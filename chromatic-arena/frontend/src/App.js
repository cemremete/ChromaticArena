import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./AuthContext";
import { ThemeProvider } from "./ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthCallback } from "./components/AuthCallback";

// Pages
import LandingPage from "./pages/Landingpage";
import LoginPage from "./pages/Loginpage";
import RegisterPage from "./pages/Registerpage";
import DashboardPage from "./pages/Dashboardpage";
import AtelierPage from "./pages/AtelierPage";
import GalleryPage from "./pages/GalleryPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ShopPage from "./pages/ShopPage";
import ProfilePage from "./pages/ProfilePage";
import HistoryPage from "./pages/HistoryPage";

import "./App.css";


function AppRouter() {
  const location = useLocation();
  
  // Check URL hash for Google OAuth callback
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/history" element={<HistoryPage />} />
      
      {/* Protected routes need auth */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/atelier" element={
        <ProtectedRoute>
          <AtelierPage />
        </ProtectedRoute>
      } />
      <Route path="/gallery" element={
        <ProtectedRoute>
          <GalleryPage />
        </ProtectedRoute>
      } />
      <Route path="/leaderboard" element={
        <ProtectedRoute>
          <LeaderboardPage />
        </ProtectedRoute>
      } />
      <Route path="/shop" element={
        <ProtectedRoute>
          <ShopPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;