import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // Cambiado a false para evitar bloqueos
  const [error, setError] = useState(null);

  // Check if user is already logged in (on page load)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          return;
        }

        setLoading(true);

        try {
          // Verificar el token con el backend
          const response = await api.get('/api/users/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (response.data) {
            setUser(response.data);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error('Error en verificación de token:', err);
          localStorage.removeItem('token');
        } finally {
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function - Conecta con el backend real
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);

      console.log('Intentando iniciar sesión con:', credentials);

      // Llamada real a la API
      const response = await api.post('/api/users/login', credentials);

      console.log('Respuesta del servidor:', response.data);

      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      } else {
        console.error('Respuesta sin token:', response.data);
        setError('Respuesta del servidor inválida');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Detalles del error:', err.response?.data);
      setError(err.response?.data?.error || 'Error al iniciar sesión');
      setLoading(false);
      return false;
    }
  };

  // Register function - Conecta con el backend real
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      // Preparar los datos para el formato que espera el backend
      const registerData = {
        email: userData.email,
        password: userData.password,
        name: `${userData.nombre} ${userData.apellido}`,
        role: 'patient',
        patientData: {
          phone: userData.telefono,
          address: userData.direccion || '',
          birthDate: userData.birthDate ? new Date(userData.birthDate).toISOString() : null
        }
      };

      // Llamada real a la API
      const response = await api.post('/api/users/register', registerData);

      if (response.data && response.data.user) {
        setLoading(false);
        return true;
      } else {
        setError('Error al registrar usuario');
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('Register error:', err);
      const errorMessage = err.response?.data?.error || 'Error al registrarse';
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      loading,
      error,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};