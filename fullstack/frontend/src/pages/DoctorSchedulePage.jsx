import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';

const DoctorSchedulePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [toast, setToast] = useState(null);

  // Horarios de consulta (8:00 AM a 6:00 PM)
  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8;
    return `${hour}:00`;
  });

  // Obtener las citas del doctor
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !user.doctorProfile) {
        setToast({
          message: 'No se encontró el perfil de doctor',
          type: 'error'
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Usar datos de demostración en lugar de hacer llamadas a la API
        // que aún no está implementada
        const demoAppointments = generateDemoAppointments();
        setAppointments(demoAppointments);

        setToast({
          message: 'Mostrando datos de demostración',
          type: 'info',
          duration: 3000
        });
      } catch (error) {
        console.error('Error generating demo appointments:', error);
        setToast({
          message: 'Error al cargar las citas. Intente nuevamente.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    // Función para generar citas de demostración
    const generateDemoAppointments = () => {
      const today = new Date();
      const appointments = [];

      // Generar algunas citas para esta semana
      for (let i = 0; i < 5; i++) {
        const day = addDays(today, i % 5); // Distribuir en los próximos 5 días
        const hour = 9 + (i % 8); // Horas entre 9 y 16

        const appointmentDate = new Date(day);
        appointmentDate.setHours(hour, 0, 0, 0);

        appointments.push({
          id: i + 1,
          date: appointmentDate,
          status: 'scheduled',
          reason: ['Consulta inicial', 'Control', 'Revisión de medicamentos', 'Trastorno del sueño', 'Ansiedad'][i % 5],
          notes: i % 2 === 0 ? 'Paciente con antecedentes de hipertensión' : '',
          patient: {
            id: 100 + i,
            phone: `+56 9 ${Math.floor(10000000 + Math.random() * 90000000)}`,
            birthDate: new Date(1950 + i, 0, 1),
            user: {
              id: 200 + i,
              name: ['Juan Pérez', 'María González', 'Pedro Rodríguez', 'Ana Martínez', 'Carlos López'][i % 5],
              email: `paciente${i+1}@example.com`
            }
          }
        });
      }

      return appointments;
    };

    fetchAppointments();
  }, [user]);

  // Generar los días de la semana actual
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(currentWeek, i);
    return {
      date: day,
      dayName: format(day, 'EEEE', { locale: es }),
      dayNumber: format(day, 'd', { locale: es }),
      month: format(day, 'MMMM', { locale: es })
    };
  });

  // Navegar a la semana anterior
  const goToPreviousWeek = () => {
    setCurrentWeek(prevWeek => addDays(prevWeek, -7));
  };

  // Navegar a la semana siguiente
  const goToNextWeek = () => {
    setCurrentWeek(prevWeek => addDays(prevWeek, 7));
  };

  // Navegar a la semana actual
  const goToCurrentWeek = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Verificar si hay una cita en un día y hora específicos
  const getAppointmentForTimeSlot = (day, time) => {
    return appointments.find(app => {
      const appDate = new Date(app.date);
      const appHour = appDate.getHours();
      return isSameDay(appDate, day.date) && `${appHour}:00` === time;
    });
  };

  // Mostrar detalles del paciente al hacer clic en una cita
  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPatientDetails(true);
  };

  // Cerrar el modal de detalles del paciente
  const closePatientDetails = () => {
    setShowPatientDetails(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="container-custom">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">Mi Calendario de Citas</h1>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={goToPreviousWeek}
                  aria-label="Semana anterior"
                >
                  &lt; Anterior
                </Button>

                <Button
                  variant="outline"
                  onClick={goToCurrentWeek}
                  aria-label="Semana actual"
                >
                  Hoy
                </Button>

                <Button
                  variant="outline"
                  onClick={goToNextWeek}
                  aria-label="Semana siguiente"
                >
                  Siguiente &gt;
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-3 border bg-gray-100 w-20"></th>
                      {weekDays.map((day, index) => (
                        <th
                          key={index}
                          className={`p-3 border text-center ${
                            isSameDay(day.date, new Date()) ? 'bg-primary-light/20' : 'bg-gray-100'
                          }`}
                        >
                          <div className="font-bold capitalize">{day.dayName}</div>
                          <div>{day.dayNumber} de {day.month}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time, timeIndex) => (
                      <tr key={timeIndex}>
                        <td className="p-3 border bg-gray-50 font-medium text-center">
                          {time}
                        </td>
                        {weekDays.map((day, dayIndex) => {
                          const appointment = getAppointmentForTimeSlot(day, time);
                          return (
                            <td
                              key={dayIndex}
                              className={`p-2 border relative h-20 ${
                                isSameDay(day.date, new Date()) ? 'bg-primary-light/10' : ''
                              }`}
                            >
                              {appointment ? (
                                <button
                                  onClick={() => handleAppointmentClick(appointment)}
                                  className="w-full h-full p-2 text-left bg-primary-light/30 hover:bg-primary-light/50 rounded transition-colors"
                                >
                                  <div className="font-medium">{appointment.patient?.user?.name || 'Paciente'}</div>
                                  <div className="text-sm truncate">{appointment.reason || 'Consulta médica'}</div>
                                </button>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal para mostrar detalles del paciente */}
      {showPatientDetails && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Ficha del Paciente</h2>
                <button
                  onClick={closePatientDetails}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Cerrar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-600">Nombre del Paciente</h3>
                  <p className="text-lg">{selectedAppointment.patient?.user?.name || 'No disponible'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-600">Fecha de Nacimiento</h3>
                  <p className="text-lg">
                    {selectedAppointment.patient?.birthDate
                      ? format(new Date(selectedAppointment.patient.birthDate), 'dd/MM/yyyy')
                      : 'No disponible'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-600">Teléfono</h3>
                  <p className="text-lg">{selectedAppointment.patient?.phone || 'No disponible'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-600">Email</h3>
                  <p className="text-lg">{selectedAppointment.patient?.user?.email || 'No disponible'}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-600 mb-2">Detalles de la Cita</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-600">Fecha y Hora</h4>
                      <p>{format(new Date(selectedAppointment.date), 'dd/MM/yyyy HH:mm')}</p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-600">Estado</h4>
                      <p className="capitalize">{selectedAppointment.status || 'Programada'}</p>
                    </div>

                    <div className="md:col-span-2">
                      <h4 className="font-medium text-gray-600">Motivo de Consulta</h4>
                      <p>{selectedAppointment.reason || 'No especificado'}</p>
                    </div>

                    {selectedAppointment.notes && (
                      <div className="md:col-span-2">
                        <h4 className="font-medium text-gray-600">Notas</h4>
                        <p>{selectedAppointment.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={closePatientDetails}
                >
                  Cerrar
                </Button>

                <Button
                  variant="primary"
                  onClick={() => {
                    // Aquí se podría implementar la funcionalidad para actualizar la ficha
                    closePatientDetails();
                    setToast({
                      message: 'Funcionalidad de actualización en desarrollo',
                      type: 'info'
                    });
                  }}
                >
                  Actualizar Ficha
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default DoctorSchedulePage;
