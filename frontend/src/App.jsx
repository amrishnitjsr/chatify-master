import { Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ChatifyLayout from "./components/ChatifyLayout";
import ProfilePage from "./pages/ProfilePage";
import StoryViewer from "./components/StoryViewer";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import PageLoader from "./components/PageLoader";

import { Toaster } from "react-hot-toast";

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/home"} />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/home"} />} />

        {/* Protected Routes */}
        {authUser ? (
          <>
            {/* Main Chatify layout */}
            <Route path="/" element={<ChatifyLayout />} />

            {/* Individual profile pages for direct links */}
            <Route path="/profile/:userId" element={<ProfilePage />} />

            {/* Redirect old routes to main layout */}
            <Route path="/home" element={<Navigate to="/" />} />
            <Route path="/chat" element={<Navigate to="/" />} />
          </>
        ) : (
          /* Redirect to login if not authenticated */
          <Route path="*" element={<Navigate to={"/login"} />} />
        )}
      </Routes>

      {/* Global Story Viewer */}
      <StoryViewer />

      <Toaster />
    </>
  );
}
export default App;
