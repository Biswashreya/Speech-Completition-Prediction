import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Signup, Login, UploadTranscript } from "./pages";
import type React from "react";
import { useAuth } from "./store/auth";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    alert("It is a protected route, login to access");
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/upload-transcript"
          element={
            <PrivateRoute>
              <UploadTranscript />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
