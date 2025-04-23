import { useState } from 'react';
import axios from 'axios';
import Button from '../common/Button';
import Toast from '../common/Toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    fono: '',
    email: '',
    mensaje: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

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

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!formData.fono.trim()) {
      newErrors.fono = 'El teléfono es requerido';
    } else {
      // Validate phone format
      const phoneRegex = /^\+?\d{9}$/;
      if (!phoneRegex.test(formData.fono)) {
        newErrors.fono = 'Ingrese un número de teléfono válido (9 dígitos)';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Ingrese un email válido';
      }
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'El mensaje es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Update with your backend API endpoint
      const response = await axios.post('/api/contact', formData);

      if (response.data.success) {
        setToast({
          message: '¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.',
          type: 'success'
        });

        // Reset form
        setFormData({
          nombre: '',
          fono: '',
          email: '',
          mensaje: ''
        });
      }
    } catch (error) {
      setToast({
        message: 'Hubo un error al enviar el mensaje. Por favor, intente nuevamente.',
        type: 'error'
      });
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-blue-100">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-600 mb-6">Formulario de Contacto</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
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

              <div className="mb-6">
                <label htmlFor="fono" className="label">
                  Teléfono
                </label>
                <input
                  type="text"
                  id="fono"
                  name="fono"
                  className={`input-field ${errors.fono ? 'border-red-500' : ''}`}
                  placeholder="Ej: +56912345678 o 912345678"
                  value={formData.fono}
                  onChange={handleChange}
                />
                {errors.fono && (
                  <p className="text-red-500 mt-1">{errors.fono}</p>
                )}
              </div>

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

              <div className="mb-6">
                <label htmlFor="mensaje" className="label">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows="5"
                  className={`input-field ${errors.mensaje ? 'border-red-500' : ''}`}
                  placeholder="Escriba su mensaje aquí"
                  value={formData.mensaje}
                  onChange={handleChange}
                ></textarea>
                {errors.mensaje && (
                  <p className="text-red-500 mt-1">{errors.mensaje}</p>
                )}
              </div>

              <div className="text-center">
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
              </div>
            </form>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-blue-600 mb-6">
              Información de Contacto
            </h2>

            <div className="text-gray-800 space-y-6 text-lg">
              <p className="mb-8">
                Corresponde a una consulta Médica Psicogeriátrica, en una modalidad Virtual
                <span className="font-bold block mt-2">(NO SE EFECTÚA EN forma presencial)</span>
              </p>

              <div>
                <h3 className="text-xl font-bold mb-2">Para solicitar una primera consulta o control:</h3>
                <p className="mb-2">
                  <span className="font-bold block">Dr. Friedrich von Mühlenbrock S.</span>
                </p>
                <p className="flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <a
                    href="mailto:atencionpsicogeriatria@apsiv.cl"
                    className="hover:underline"
                  >
                    atencionpsicogeriatria@apsiv.cl
                  </a>
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Modalidad de atención:</h3>
                <div className="flex items-start">
                  <svg className="w-6 h-6 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                  <p>Consulta virtual vía Zoom</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={5000}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  );
};

export default Contact;