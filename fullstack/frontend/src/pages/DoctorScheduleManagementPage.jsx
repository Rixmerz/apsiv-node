import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { normalizeSlotId, denormalizeSlotId } from '../utils/slotUtils';

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

  // Estado para controlar si se deben actualizar los datos
  const [shouldUpdateData, setShouldUpdateData] = useState(false);

  // Horarios posibles (8:00 AM a 6:00 PM)
  // Usamos useMemo para evitar recalcular en cada renderizado
  const timeSlots = useMemo(() => {
    return Array.from({ length: 11 }, (_, i) => {
      const hour = i + 8;
      return {
        id: `slot_${hour}`,
        time: `${hour}:00 - ${hour + 1}:00`
      };
    });
  }, []);

  // Nota: Ahora usamos las funciones de normalización importadas de utils/slotUtils.js

  // Generar los días de la semana actual
  // Usamos useMemo para evitar recalcular en cada renderizado
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(currentWeek, i);
      return {
        date: day,
        dayName: format(day, 'EEEE', { locale: es }),
        dayNumber: format(day, 'd', { locale: es }),
        month: format(day, 'MMMM', { locale: es })
      };
    });
  }, [currentWeek]);

  // Cargar los horarios disponibles del doctor
  useEffect(() => {
    // Accedemos a timeSlots y weekDays dentro del efecto para evitar dependencias cíclicas
    const currentTimeSlots = timeSlots;
    const currentWeekDays = weekDays;

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
        console.log('Obteniendo horarios del doctor...');

        // Intentar obtener los horarios del doctor desde el backend
        try {
          const doctorId = user.doctorProfile.id;
          console.log('Llamando a la API para obtener horarios del doctor:', doctorId);

          const response = await api.get(`/api/doctor/schedule/${doctorId}`);
          console.log('Respuesta del servidor:', response.data);

          if (response.data && Object.keys(response.data).length > 0) {
            console.log('Horarios obtenidos del servidor');

            // Convertir los IDs de slots del formato del backend al formato del frontend
            const convertedSlots = {};

            // Recorrer todas las fechas
            Object.keys(response.data).forEach(dateStr => {
              convertedSlots[dateStr] = {};

              // Recorrer todos los slots de cada fecha
              Object.keys(response.data[dateStr]).forEach(slotId => {
                // Convertir el ID del slot de Bloque_X a slot_X
                const frontendSlotId = denormalizeSlotId(slotId);
                convertedSlots[dateStr][frontendSlotId] = response.data[dateStr][slotId];
              });
            });

            setAvailableSlots(convertedSlots);
            setInitialDataLoaded(true);
            setLoading(false);
            return;
          } else {
            console.log('No se encontraron horarios en el servidor, generando datos iniciales');
          }
        } catch (apiError) {
          console.error('Error al obtener horarios del servidor:', apiError);

          // Inicializar con slots vacíos para las fechas actuales
          console.log('Inicializando datos de disponibilidad vacíos');
          const emptySlots = {};

          // Crear slots vacíos para la semana actual
          currentWeekDays.forEach(day => {
            const dateStr = format(day.date, 'yyyy-MM-dd');
            emptySlots[dateStr] = {};

            // Inicializar todos los slots como no disponibles
            currentTimeSlots.forEach(slot => {
              const normalizedSlotId = normalizeSlotId(slot.id);
              emptySlots[dateStr][normalizedSlotId] = false;
            });
          });

          setAvailableSlots(emptySlots);
          setToast({
            message: 'No se pudieron cargar los horarios del servidor. Se han creado horarios vacíos.',
            type: 'warning',
            duration: 5000
          });
        }

        setInitialDataLoaded(true);
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
  }, [user, currentWeek, initialDataLoaded, shouldUpdateData]);

  // Navegar a la semana anterior
  const goToPreviousWeek = () => {
    setCurrentWeek(prevWeek => subWeeks(prevWeek, 1));
    // Indicar que se deben actualizar los datos
    setShouldUpdateData(prev => !prev);
  };

  // Navegar a la semana siguiente
  const goToNextWeek = () => {
    setCurrentWeek(prevWeek => addWeeks(prevWeek, 1));
    // Indicar que se deben actualizar los datos
    setShouldUpdateData(prev => !prev);
  };

  // Navegar a la semana actual
  const goToCurrentWeek = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
    // Indicar que se deben actualizar los datos
    setShouldUpdateData(prev => !prev);
  };

  // Cambiar la disponibilidad de un horario
  const toggleSlotAvailability = (dateStr, slotId) => {
    // Normalizar el ID del slot para asegurar consistencia
    const normalizedSlotId = normalizeSlotId(slotId);

    console.log(`Cambiando disponibilidad para ${dateStr}, slot ${slotId} (normalizado: ${normalizedSlotId})`);

    // Verificar si el slot existe en el estado
    const slotExists = dateStr in availableSlots && normalizedSlotId in availableSlots[dateStr];
    console.log(`¿El slot existe en el estado? ${slotExists}`);

    // Obtener el estado actual (false por defecto si no existe)
    const currentValue = availableSlots[dateStr]?.[normalizedSlotId] === true;
    console.log(`Estado actual: ${currentValue}`);

    // Usar una variable local para el nuevo valor (invertir el estado actual)
    const newValue = !currentValue;
    console.log(`Nuevo estado: ${newValue}`);

    // Actualizar el estado una sola vez
    setAvailableSlots(prevSlots => {
      // Crear una copia del objeto evitando la serialización innecesaria
      const newSlots = {...prevSlots};

      if (!newSlots[dateStr]) {
        newSlots[dateStr] = {};
      }

      // Asignar el nuevo valor
      newSlots[dateStr][normalizedSlotId] = newValue;

      return newSlots;
    });
  };

  // Guardar los cambios
  const saveChanges = async () => {
    try {
      setLoading(true);
      console.log('Guardando horarios disponibles:', availableSlots);

      if (!user || !user.doctorProfile) {
        throw new Error('No se encontró el perfil de doctor');
      }

      const doctorId = user.doctorProfile.id;

      try {
        // Convertir los IDs de slots del formato del frontend al formato del backend
        const convertedSlots = {};

        // Recorrer todas las fechas
        Object.keys(availableSlots).forEach(dateStr => {
          convertedSlots[dateStr] = {};

          // Recorrer todos los slots de cada fecha
          Object.keys(availableSlots[dateStr]).forEach(slotId => {
            // Convertir el ID del slot de slot_X a Bloque_X
            const backendSlotId = normalizeSlotId(slotId);
            convertedSlots[dateStr][backendSlotId] = availableSlots[dateStr][slotId];
          });
        });

        // Intentar hacer la llamada a la API real
        console.log(`Enviando datos al servidor: /api/doctor/schedule/${doctorId}`);
        console.log('Datos convertidos para el backend:', convertedSlots);
        const response = await api.post(`/api/doctor/schedule/${doctorId}`, { availableSlots: convertedSlots });
        console.log('Respuesta del servidor:', response.data);

        // Ya no guardamos en localStorage para evitar inconsistencias

        setToast({
          message: 'Horarios guardados con éxito en el servidor',
          type: 'success'
        });
      } catch (apiError) {
        console.error('Error en la llamada a la API:', apiError);

        // Ya no guardamos en localStorage para evitar inconsistencias

        setToast({
          message: 'Error al guardar los horarios en el servidor. Por favor, intente nuevamente.',
          type: 'error',
          duration: 5000
        });
      }
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
                            // Normalizar el ID del slot para asegurar consistencia
                            const normalizedSlotId = normalizeSlotId(slot.id);
                            // Verificar si el slot existe en el estado y si está disponible
                            // Si no existe, se considera como no disponible por defecto
                            const isAvailable = availableSlots[dateStr]?.[normalizedSlotId] === true;

                            return (
                              <td
                                key={dayIndex}
                                className={`p-2 border relative h-16 ${
                                  isSameDay(day.date, new Date()) ? 'bg-primary-light/10' : ''
                                }`}
                              >
                                <button
                                  onClick={() => toggleSlotAvailability(dateStr, normalizedSlotId)}
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
