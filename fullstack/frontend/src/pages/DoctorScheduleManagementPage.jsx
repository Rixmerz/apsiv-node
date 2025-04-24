import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';

const DoctorScheduleManagementPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Estado para la semana actual
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Estado para los horarios disponibles
  const [availableSlots, setAvailableSlots] = useState({});

  // Estado para controlar si los datos se han cargado inicialmente
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  // Horarios posibles (8:00 AM a 6:00 PM)
  const timeSlots = Array.from({ length: 11 }, (_, i) => {
    const hour = i + 8;
    return {
      id: `slot_${hour}`,
      time: `${hour}:00 - ${hour + 1}:00`
    };
  });

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

  // Cargar los horarios disponibles del doctor
  useEffect(() => {
    const fetchAvailableSlots = async () => {
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

        // En un entorno real, aquí se haría una llamada a la API
        // para obtener los horarios disponibles del doctor

        // Para demo, generamos datos aleatorios solo si no se han cargado antes
        if (!initialDataLoaded) {
          console.log('Inicializando datos de disponibilidad');
          const slots = {};

          weekDays.forEach(day => {
            const dateStr = format(day.date, 'yyyy-MM-dd');
            slots[dateStr] = {};

            timeSlots.forEach(slot => {
              // 70% de probabilidad de que el horario esté disponible
              slots[dateStr][slot.id] = Math.random() > 0.3;
            });
          });

          setAvailableSlots(slots);
          setInitialDataLoaded(true);
        } else {
          // Si ya se cargaron los datos, solo agregamos las fechas nuevas que no existan
          console.log('Actualizando datos de disponibilidad para nuevas fechas');
          setAvailableSlots(prevSlots => {
            const newSlots = { ...prevSlots };

            weekDays.forEach(day => {
              const dateStr = format(day.date, 'yyyy-MM-dd');

              if (!newSlots[dateStr]) {
                newSlots[dateStr] = {};

                timeSlots.forEach(slot => {
                  // 70% de probabilidad de que el horario esté disponible
                  newSlots[dateStr][slot.id] = Math.random() > 0.3;
                });
              }
            });

            return newSlots;
          });
        }
      } catch (error) {
        console.error('Error fetching available slots:', error);
        setToast({
          message: 'Error al cargar los horarios disponibles',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [user, currentWeek, timeSlots, weekDays, initialDataLoaded]);

  // Navegar a la semana anterior
  const goToPreviousWeek = () => {
    setCurrentWeek(prevWeek => subWeeks(prevWeek, 1));
  };

  // Navegar a la semana siguiente
  const goToNextWeek = () => {
    setCurrentWeek(prevWeek => addWeeks(prevWeek, 1));
  };

  // Navegar a la semana actual
  const goToCurrentWeek = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Cambiar la disponibilidad de un horario
  const toggleSlotAvailability = (dateStr, slotId) => {
    console.log(`Cambiando disponibilidad para ${dateStr}, slot ${slotId}`);
    console.log('Estado actual:', availableSlots[dateStr]?.[slotId]);

    setAvailableSlots(prevSlots => {
      // Crear una copia profunda del objeto para asegurar que React detecte el cambio
      const newSlots = JSON.parse(JSON.stringify(prevSlots));

      if (!newSlots[dateStr]) {
        newSlots[dateStr] = {};
      }

      // Invertir el valor actual
      newSlots[dateStr][slotId] = !newSlots[dateStr][slotId];

      console.log('Nuevo estado:', newSlots[dateStr][slotId]);
      return newSlots;
    });
  };

  // Guardar los cambios
  const saveChanges = async () => {
    try {
      setLoading(true);

      // En un entorno real, aquí se haría una llamada a la API
      // para guardar los horarios disponibles del doctor

      // Simulamos una llamada exitosa
      await new Promise(resolve => setTimeout(resolve, 1000));

      setToast({
        message: 'Horarios guardados con éxito',
        type: 'success'
      });
    } catch (error) {
      console.error('Error saving available slots:', error);
      setToast({
        message: 'Error al guardar los horarios',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-8 bg-gray-50">
        <div className="container-custom">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold">Gestión de Horarios Disponibles</h1>

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

            <p className="text-gray-600 mb-6">
              Seleccione los horarios en los que estará disponible para atender pacientes.
              Haga clic en un horario para marcarlo como disponible o no disponible.
            </p>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto mb-6">
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
                      {timeSlots.map((slot, timeIndex) => (
                        <tr key={timeIndex}>
                          <td className="p-3 border bg-gray-50 font-medium text-center">
                            {slot.time}
                          </td>
                          {weekDays.map((day, dayIndex) => {
                            const dateStr = format(day.date, 'yyyy-MM-dd');
                            const isAvailable = availableSlots[dateStr]?.[slot.id];

                            return (
                              <td
                                key={dayIndex}
                                className={`p-2 border relative h-16 ${
                                  isSameDay(day.date, new Date()) ? 'bg-primary-light/10' : ''
                                }`}
                              >
                                <button
                                  onClick={() => toggleSlotAvailability(dateStr, slot.id)}
                                  className={`w-full h-full p-2 text-center rounded transition-colors ${
                                    isAvailable
                                      ? 'bg-green-100 hover:bg-green-200 text-green-800'
                                      : 'bg-red-100 hover:bg-red-200 text-red-800'
                                  }`}
                                >
                                  {isAvailable ? 'Disponible' : 'No disponible'}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    size="large"
                    onClick={saveChanges}
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </>
            )}
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

export default DoctorScheduleManagementPage;
