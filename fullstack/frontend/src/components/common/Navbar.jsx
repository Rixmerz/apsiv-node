import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ScrollLink from './ScrollLink';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gray-100 shadow-md">
      <div className="container-custom py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="bg-blue-600 text-white h-16 w-16 flex items-center justify-center rounded-full">
              <span className="text-2xl font-bold">AP</span>
            </div>
            <span className="text-2xl font-bold ml-2 text-blue-600">APSIV</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-lg font-bold hover:text-blue-600 transition-colors">
              Inicio
            </Link>
            <ScrollLink to="/#about" className="text-lg font-bold hover:text-blue-600 transition-colors">
              Quienes Somos
            </ScrollLink>
            <ScrollLink to="/#services" className="text-lg font-bold hover:text-blue-600 transition-colors">
              Servicios
            </ScrollLink>
            <ScrollLink to="/#contact" className="text-lg font-bold hover:text-blue-600 transition-colors">
              Contáctenos
            </ScrollLink>

            {isAuthenticated ? (
              <>
                {user?.role === 'patient' && (
                  <Link to="/appointment" className="text-lg font-medium hover:text-primary transition-colors">
                    Agendar Hora
                  </Link>
                )}

                {user?.role === 'doctor' && (
                  <>
                    <Link to="/doctor/schedule" className="text-lg font-medium hover:text-primary transition-colors">
                      Mi Calendario
                    </Link>
                    <Link to="/doctor/manage-schedule" className="text-lg font-medium hover:text-primary transition-colors">
                      Gestionar Horarios
                    </Link>
                  </>
                )}

                {user?.role === 'admin' && (
                  <>
                    <Link to="/admin/patients" className="text-lg font-medium hover:text-primary transition-colors">
                      Pacientes
                    </Link>
                    <Link to="/admin/appointments" className="text-lg font-medium hover:text-primary transition-colors">
                      Citas
                    </Link>
                  </>
                )}

                <button
                  onClick={handleLogout}
                  className="text-lg font-medium hover:text-primary transition-colors"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-lg font-medium hover:text-primary transition-colors">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="text-lg font-medium hover:text-primary transition-colors">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-500 focus:outline-none focus:text-gray-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3">
            <Link
              to="/"
              className="block text-xl font-medium hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
            <ScrollLink
              to="/#about"
              className="block text-xl font-medium hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Quienes Somos
            </ScrollLink>
            <ScrollLink
              to="/#services"
              className="block text-xl font-medium hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Servicios
            </ScrollLink>
            <ScrollLink
              to="/#contact"
              className="block text-xl font-medium hover:text-primary transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contáctenos
            </ScrollLink>

            {isAuthenticated ? (
              <>
                {user?.role === 'patient' && (
                  <Link
                    to="/appointment"
                    className="block text-xl font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Agendar Hora
                  </Link>
                )}

                {user?.role === 'doctor' && (
                  <>
                    <Link
                      to="/doctor/schedule"
                      className="block text-xl font-medium hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Mi Calendario
                    </Link>
                    <Link
                      to="/doctor/manage-schedule"
                      className="block text-xl font-medium hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Gestionar Horarios
                    </Link>
                  </>
                )}

                {user?.role === 'admin' && (
                  <>
                    <Link
                      to="/admin/patients"
                      className="block text-xl font-medium hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Pacientes
                    </Link>
                    <Link
                      to="/admin/appointments"
                      className="block text-xl font-medium hover:text-primary transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Citas
                    </Link>
                  </>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left text-xl font-medium hover:text-primary transition-colors py-2"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block text-xl font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="block text-xl font-medium hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;