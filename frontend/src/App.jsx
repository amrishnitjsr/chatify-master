import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
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
            {/* Routes with AuthenticatedLayout */}
            <Route element={<AuthenticatedLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
            </Route>

            {/* Chat route without layout (has its own styling) */}
            <Route path="/chat" element={<ChatPage />} />

            {/* Default redirect to home */}
            <Route path="/" element={<Navigate to={"/home"} />} />
          </>
        ) : (
          /* Redirect to login if not authenticated */
          <Route path="*" element={<Navigate to={"/login"} />} />
        )}
      </Routes>

      <Toaster />
    </>
  );
}
export default App;
