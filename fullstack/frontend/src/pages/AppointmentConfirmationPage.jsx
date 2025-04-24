import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

const AppointmentConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);

  useEffect(() => {
    console.log('Cargando página de confirmación');

    // Intentar obtener los datos de la cita desde localStorage
    const appointmentData = localStorage.getItem('appointmentData');
    console.log('Datos de localStorage:', appointmentData);

    if (appointmentData) {
      try {
        // Parsear los datos y establecer el estado
        const parsedData = JSON.parse(appointmentData);
        setAppointment(parsedData);

        // Opcional: Limpiar los datos después de cargarlos para evitar problemas de seguridad
        // localStorage.removeItem('appointmentData');
      } catch (error) {
        console.error('Error parsing appointment data:', error);
        navigate('/appointment');
      }
    } else if (location.state?.appointment) {
      // Verificar si hay datos de cita en el estado de la ubicación (método anterior)
      setAppointment(location.state.appointment);
    } else {
      console.log('No se encontraron datos de cita. Usando datos de demo.');

      // Crear datos de cita simulados para demostración
      const demoAppointment = {
        id: 1,
        date: new Date().toISOString(),
        status: 'scheduled',
        notes: 'Primera consulta\nPaciente nuevo',
        doctor: {
          id: 1,
          user: {
            name: 'Dr. Juan Pérez',
            email: 'doctor@example.com'
          }
        },
        patient: {
          id: 1,
          user: {
            name: user?.name || 'Paciente Demo',
            email: user?.email || 'paciente@example.com'
          }
        }
      };

      setAppointment(demoAppointment);
    }
  }, [location, navigate]);

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };

  // Extraer el motivo de la consulta de las notas
  const getReasonFromNotes = (notes) => {
    if (!notes) return 'No especificado';
    const lines = notes.split('\n');
    return lines[0] || 'No especificado';
  };

  // Extraer las notas adicionales
  const getAdditionalNotes = (notes) => {
    if (!notes) return '';
    const lines = notes.split('\n');
    return lines.slice(1).join('\n');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 bg-light-dark">
        <div className="container-custom">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
            {appointment ? (
              <>
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-800">¡Cita Confirmada!</h1>
                  <p className="text-gray-600 mt-2">Su cita médica ha sido agendada con éxito</p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Detalles de la Cita</h2>

                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-gray-700">Fecha y Hora:</p>
                      <p className="capitalize text-gray-800">{formatDate(appointment.date)}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-700">Paciente:</p>
                      <p className="text-gray-800">{appointment.patient?.user?.name || user?.name || 'No disponible'}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-700">Doctor:</p>
                      <p className="text-gray-800">{appointment.doctor?.user?.name || 'Dr. Asignado'}</p>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-700">Motivo de la consulta:</p>
                      <p className="text-gray-800">{getReasonFromNotes(appointment.notes)}</p>
                    </div>

                    {getAdditionalNotes(appointment.notes) && (
                      <div>
                        <p className="font-semibold text-gray-700">Notas adicionales:</p>
                        <p className="text-gray-800 whitespace-pre-line">{getAdditionalNotes(appointment.notes)}</p>
                      </div>
                    )}

                    <div>
                      <p className="font-semibold text-gray-700">Estado:</p>
                      <p className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                        {appointment.status === 'scheduled' ? 'Agendada' : appointment.status}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-8 border-l-4 border-blue-500">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        Recibirá un recordatorio por correo electrónico 24 horas antes de su cita.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    size="large"
                    onClick={() => navigate('/')}
                  >
                    Volver al Inicio
                  </Button>

                  <Button
                    variant="primary"
                    size="large"
                    onClick={() => window.print()}
                  >
                    Imprimir Comprobante
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando información de la cita...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AppointmentConfirmationPage;
