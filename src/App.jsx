import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CreatorDashboard from "@/pages/CreatorDashboard";
import EditorDashboard from "@/pages/EditorDashboard";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Creator routes */}
        <Route element={<ProtectedRoute requiredRole="CREATOR" />}>
          <Route path="/creator/dashboard" element={<CreatorDashboard />} />
        </Route>

        {/* Protected Editor routes */}
        <Route element={<ProtectedRoute requiredRole="EDITOR" />}>
          <Route path="/editor/dashboard" element={<EditorDashboard />} />
        </Route>

        <Route path="/unauthorized" element={<h1>Unauthorized</h1>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
