import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CreatorDashboard from "@/pages/CreatorDashboard";
import EditorDashboard from "@/pages/EditorDashboard";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import Projects from "@/pages/Projects";
import ProjectDetails from "@/pages/ProjectDetails";
import CreatorReview from "@/pages/CreatorReview";
import EditorProjects from "@/pages/EditorProjects";
import YouTubeCallback from "@/pages/YouTubeCallback";
import DashboardLayout from "@/layouts/DashboardLayout";

function App() {
  return (
      <BrowserRouter>
        <Toaster richColors position="top-right" />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Creator routes */}
          <Route element={<ProtectedRoute requiredRole="CREATOR" />}>
            <Route element={<DashboardLayout />}>
              <Route path="/creator/dashboard" element={<CreatorDashboard />} />
              <Route path="/dashboard" element={<Navigate to="/creator/dashboard" replace />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:projectId" element={<ProjectDetails />} />
              <Route path="/review" element={<CreatorReview />} />
              {/* Must match spring.security.oauth2.client.registration.google.redirect-uri */}
              <Route path="/youtube/callback" element={<YouTubeCallback />} />
            </Route>
          </Route>

          {/* Editor routes */}
          <Route element={<ProtectedRoute requiredRole="EDITOR" />}>
            <Route element={<DashboardLayout />}>
              <Route path="/editor/dashboard" element={<EditorDashboard />} />
              <Route path="/editor/projects" element={<EditorProjects />} />
              <Route path="/editor/projects/:projectId" element={<ProjectDetails />} />
            </Route>
          </Route>

          <Route path="/unauthorized" element={<h1>Unauthorized</h1>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
