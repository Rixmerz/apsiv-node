import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const success = await login(formData);
      
      if (success) {
        navigate('/');
      } else {
        setToast({
          message: error || 'Credenciales incorrectas. Intente nuevamente.',
          type: 'error'
        });
      }
    } catch (err) {
      setToast({
        message: 'Hubo un problema al iniciar sesión. Intente nuevamente.',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-20 bg-gradient-to-br from-primary to-secondary">
        <div className="container-custom">
          <div className="flex justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
              <div className="flex justify-center mb-6">
                <img 
                  src="/imagenes/zyro-image-logo.png" 
                  alt="APSIV Logo" 
                  className="h-20"
                />
              </div>
              
              <h1 className="text-3xl font-bold text-center mb-8">Iniciar Sesión</h1>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                    placeholder="Su correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <p className="text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div className="mb-8">
                  <label htmlFor="password" className="label">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Su contraseña"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  {errors.password && (
                    <p className="text-red-500 mt-1">{errors.password}</p>
                  )}
                </div>
                
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  className="w-full mb-4"
                  disabled={loading}
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>
              
              <p className="text-center mt-6 text-lg">
                ¿No tiene una cuenta?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline">
                  Regístrese aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={5000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default LoginPage;