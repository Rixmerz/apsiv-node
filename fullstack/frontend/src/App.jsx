import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AppointmentPage from './pages/AppointmentPage';
import AppointmentConfirmationPage from './pages/AppointmentConfirmationPage';
import DoctorSchedulePage from './pages/DoctorSchedulePage';
import DoctorScheduleManagementPage from './pages/DoctorScheduleManagementPage';
import PatientAppointmentBookingPage from './pages/PatientAppointmentBookingPage';
import PatientAppointmentsPage from './pages/PatientAppointmentsPage';
import AdminPatientsPage from './pages/AdminPatientsPage';
import AdminAppointmentsPage from './pages/AdminAppointmentsPage';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false, doctorOnly = false, patientOnly = false }) => {
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

  if (doctorOnly && user?.role !== 'doctor') {
    return <Navigate to="/" replace />;
  }

  if (patientOnly && user?.role !== 'patient') {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {

  return (
    <Routes>
      {/* Public Routes - accessible to everyone */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes - role specific */}
      {/* Patient Routes */}
      <Route path="/appointment" element={
        <ProtectedRoute patientOnly>
          <AppointmentPage />
        </ProtectedRoute>
      } />

      <Route path="/appointment/confirmation" element={
        <ProtectedRoute patientOnly>
          <AppointmentConfirmationPage />
        </ProtectedRoute>
      } />

      <Route path="/patient/book-appointment" element={
        <ProtectedRoute patientOnly>
          <PatientAppointmentBookingPage />
        </ProtectedRoute>
      } />

      <Route path="/patient/appointments" element={
        <ProtectedRoute patientOnly>
          <PatientAppointmentsPage />
        </ProtectedRoute>
      } />

      <Route path="/doctor/schedule" element={
        <ProtectedRoute doctorOnly>
          <DoctorSchedulePage />
        </ProtectedRoute>
      } />

      <Route path="/doctor/manage-schedule" element={
        <ProtectedRoute doctorOnly>
          <DoctorScheduleManagementPage />
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