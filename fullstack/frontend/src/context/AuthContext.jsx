import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

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
          // En fase de desarrollo, simulamos la verificación del token
          // En producción, esto sería una llamada real a la API
          // const response = await axios.get('/api/auth/me', {
          //   headers: {
          //     Authorization: `Bearer ${token}`
          //   }
          // });
          
          // Simulación de respuesta exitosa
          setTimeout(() => {
            const mockUser = {
              id: 1,
              nombre: 'Usuario',
              apellido: 'Prueba',
              rut: '12.345.678-9',
              email: 'usuario@ejemplo.com',
              role: token.includes('admin') ? 'admin' : 'user'
            };
            
            setUser(mockUser);
            setIsAuthenticated(true);
            setLoading(false);
          }, 500);
          
        } catch (err) {
          console.error('Error en verificación de token:', err);
          localStorage.removeItem('token');
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

  // Login function - Modificada para funcionar en desarrollo sin backend
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      // En fase de desarrollo, simulamos la respuesta del servidor
      // En producción, esto sería una llamada real a la API
      // const response = await axios.post('/api/auth/login', credentials);
      
      // Simulación de login exitoso
      return new Promise((resolve) => {
        setTimeout(() => {
          // Verificar credenciales simuladas
          if (
            (credentials.email === 'admin@apsiv.cl' && credentials.password === 'admin123') ||
            (credentials.email === 'usuario@ejemplo.com' && credentials.password === 'usuario123')
          ) {
            const isAdmin = credentials.email === 'admin@apsiv.cl';
            const mockUser = {
              id: isAdmin ? 99 : 1,
              nombre: isAdmin ? 'Admin' : 'Usuario',
              apellido: isAdmin ? 'Sistema' : 'Prueba',
              rut: isAdmin ? '11.111.111-1' : '12.345.678-9',
              email: credentials.email,
              role: isAdmin ? 'admin' : 'user'
            };
            
            const mockToken = isAdmin ? 'mock-admin-token' : 'mock-user-token';
            
            localStorage.setItem('token', mockToken);
            setUser(mockUser);
            setIsAuthenticated(true);
            setLoading(false);
            resolve(true);
          } else {
            setError('Credenciales incorrectas');
            setLoading(false);
            resolve(false);
          }
        }, 800);
      });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      setLoading(false);
      return false;
    }
  };

  // Register function - Modificada para funcionar en desarrollo sin backend
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      // En fase de desarrollo, simulamos la respuesta del servidor
      // En producción, esto sería una llamada real a la API
      // const response = await axios.post('/api/auth/register', userData);
      
      // Simulación de registro exitoso
      return new Promise((resolve) => {
        setTimeout(() => {
          setLoading(false);
          resolve(true);
        }, 1000);
      });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrarse');
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