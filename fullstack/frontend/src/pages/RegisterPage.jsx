import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import '../styles/dateInput.css'; // Importar estilos personalizados para el input de fecha

const RegisterPage = () => {
  // Usamos un campo de edad en lugar de fecha de nacimiento para mayor facilidad

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    rut: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    isapre: '',
    edad: '65', // Edad predeterminada para geriatría (mayores de 60 años)
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const { register, loading, error } = useAuth();
  const navigate = useNavigate();

  // No necesitamos efectos especiales para el campo de edad

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for RUT to format it while typing
    if (name === 'rut') {
      const formattedRut = formatRut(value);
      setFormData({ ...formData, [name]: formattedRut });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Format RUT with dots and dash (e.g., 12.345.678-9)
  const formatRut = (rut) => {
    // Remove all non-alphanumeric characters
    let value = rut.replace(/[^0-9kK]/g, '');

    if (value.length > 1) {
      // Extract verification digit (last character)
      const dv = value.slice(-1);
      // Get the main part of the RUT
      let rutWithoutDv = value.slice(0, -1);

      // Add dots
      const formattedRut = rutWithoutDv.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

      // Return formatted RUT with dash and verification digit
      return `${formattedRut}-${dv}`;
    }

    return value;
  };

  // Validate Chilean RUT
  const validateRut = (rut) => {
    if (!rut) return false;

    // Check format using regex
    const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]$/;
    if (!rutRegex.test(rut)) {
      return false;
    }

    // Remove dots and dash for calculation
    const cleanRut = rut.replace(/\./g, '').replace('-', '');
    const body = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();

    // Calculate verification digit
    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body.charAt(i)) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDv = 11 - (sum % 11);
    const calculatedDv = expectedDv === 11 ? '0' : expectedDv === 10 ? 'K' : expectedDv.toString();

    return calculatedDv === dv;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido';
    }

    if (!formData.rut.trim()) {
      newErrors.rut = 'El RUT es requerido';
    } else if (!validateRut(formData.rut)) {
      newErrors.rut = 'El RUT ingresado no es válido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Ingrese un email válido';
      }
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es requerido';
    } else {
      const phoneRegex = /^\+?\d{9}$/;
      if (!phoneRegex.test(formData.telefono.replace(/\s/g, ''))) {
        newErrors.telefono = 'Ingrese un número de teléfono válido (9 dígitos)';
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirme su contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.isapre.trim()) {
      newErrors.isapre = 'Seleccione su ISAPRE o sistema de salud';
    }

    if (!formData.edad.trim()) {
      newErrors.edad = 'La edad es requerida';
    } else {
      const edad = parseInt(formData.edad);

      if (isNaN(edad)) {
        newErrors.edad = 'Ingrese un número válido';
      } else if (edad < 60) {
        newErrors.edad = 'La edad debe ser mayor o igual a 60 años (geriatría)';
      } else if (edad > 120) {
        newErrors.edad = 'La edad no puede ser mayor a 120 años';
      }
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
      const success = await register(formData);

      if (success) {
        setToast({
          message: '¡Registro exitoso! Ahora puede iniciar sesión.',
          type: 'success'
        });

        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        // Verificar si el error es específico sobre email duplicado
        const errorMessage = error && error.includes('email already exists')
          ? 'Este email ya está registrado. Por favor utilice otro email.'
          : 'Hubo un problema al registrarse. Intente nuevamente.';

        setToast({
          message: errorMessage,
          type: 'error'
        });
      }
    } catch (err) {
      setToast({
        message: 'Hubo un problema al registrarse. Intente nuevamente.',
        type: 'error'
      });
    }
  };

  const isapreOptions = [
    { value: '', label: 'Seleccione una opción' },
    { value: 'FONASA', label: 'Fondo Nacional de Salud (FONASA)' },
    { value: 'Banmedica', label: 'Isapre Banmedica' },
    { value: 'Colmena Golden Cross', label: 'Isapre Colmena' },
    { value: 'Consalud', label: 'Isapre Consalud' },
    { value: 'Cruz Blanca', label: 'Isapre Cruz Blanca' },
    { value: 'Cruz del Norte', label: 'Isapre Cruz del Norte' },
    { value: 'Nueva MásVida', label: 'Isapre Nueva MásVida' },
    { value: 'Fundación', label: 'Isapre Fundación' },
    { value: 'Vida Tres', label: 'Isapre Vida Tres' },
    { value: 'Particular', label: 'Particular' }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 bg-gradient-to-br from-primary to-secondary">
        <div className="container-custom">
          <div className="flex justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
              <div className="flex justify-center mb-6">
                <img
                  src="/imagenes/zyro-image-logo.png"
                  alt="APSIV Logo"
                  className="h-16"
                />
              </div>

              <h1 className="text-3xl font-bold text-center mb-8">Registro de Paciente</h1>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre" className="label">
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      className={`input-field ${errors.nombre ? 'border-red-500' : ''}`}
                      placeholder="Su nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                    />
                    {errors.nombre && (
                      <p className="text-red-500 mt-1">{errors.nombre}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="apellido" className="label">
                      Apellido
                    </label>
                    <input
                      type="text"
                      id="apellido"
                      name="apellido"
                      className={`input-field ${errors.apellido ? 'border-red-500' : ''}`}
                      placeholder="Su apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                    />
                    {errors.apellido && (
                      <p className="text-red-500 mt-1">{errors.apellido}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="rut" className="label">
                      RUT
                    </label>
                    <input
                      type="text"
                      id="rut"
                      name="rut"
                      className={`input-field ${errors.rut ? 'border-red-500' : ''}`}
                      placeholder="Ej: 12.345.678-9"
                      value={formData.rut}
                      onChange={handleChange}
                      maxLength={12}
                    />
                    {errors.rut && (
                      <p className="text-red-500 mt-1">{errors.rut}</p>
                    )}
                  </div>

                  <div>
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

                  <div>
                    <label htmlFor="telefono" className="label">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      className={`input-field ${errors.telefono ? 'border-red-500' : ''}`}
                      placeholder="Ej: +56912345678 o 912345678"
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                    {errors.telefono && (
                      <p className="text-red-500 mt-1">{errors.telefono}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="isapre" className="label">
                      ISAPRE o Sistema de Salud
                    </label>
                    <select
                      id="isapre"
                      name="isapre"
                      className={`input-field ${errors.isapre ? 'border-red-500' : ''}`}
                      value={formData.isapre}
                      onChange={handleChange}
                    >
                      {isapreOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.isapre && (
                      <p className="text-red-500 mt-1">{errors.isapre}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="edad" className="label text-xl">
                      Edad
                    </label>
                    <input
                      type="number"
                      id="edad"
                      name="edad"
                      className={`input-field text-xl p-5 h-16 ${errors.edad ? 'border-red-500' : ''}`}
                      value={formData.edad}
                      onChange={handleChange}
                      min="60"
                      max="120"
                      placeholder="Ej: 65"
                      style={{ fontSize: '1.25rem' }}
                    />
                    <p className="text-gray-600 mt-1 text-sm">Ingrese su edad actual (mínimo 60 años para geriatría)</p>
                    {errors.edad && (
                      <p className="text-red-500 mt-1">{errors.edad}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="password" className="label">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Cree una contraseña"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && (
                      <p className="text-red-500 mt-1">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="label">
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Confirme su contraseña"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 mt-1">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? 'Registrando...' : 'Registrarse'}
                  </Button>
                </div>
              </form>

              <p className="text-center mt-6 text-lg">
                ¿Ya tiene una cuenta?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline">
                  Inicie sesión aquí
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

export default RegisterPage;