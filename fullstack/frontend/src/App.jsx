import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppointmentPage from './pages/AppointmentPage';
import AdminPatientsPage from './pages/AdminPatientsPage';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  // Show loading state if auth is still being checked
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Routes>
      {/* Public Routes - accessible to everyone */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes - only for authenticated users */}
      <Route path="/appointment" element={
        <ProtectedRoute>
          <AppointmentPage />
        </ProtectedRoute>
      } />

      {/* Admin Routes - only for admin users */}
      <Route path="/admin/patients" element={
        <ProtectedRoute adminOnly>
          <AdminPatientsPage />
        </ProtectedRoute>
      } />
      <Route path="/admin/appointments" element={
        <ProtectedRoute adminOnly>
          <AdminAppointmentsPage />
        </ProtectedRoute>
      } />

      {/* Catch-all route for 404 pages */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;