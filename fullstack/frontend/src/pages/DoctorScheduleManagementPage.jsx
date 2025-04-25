import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { format, addDays, isSameDay, addWeeks, subWeeks, isBefore } from 'date-fns';
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
  // Usamos el 24 de abril de 2025 como fecha base (según los logs)
  // El 24 de abril de 2025 es un jueves (día 4)
  // Calculamos el inicio de la semana (lunes) para esta fecha
  const baseDate = new Date(2025, 3, 24); // 24 de abril de 2025
  const [currentWeek, setCurrentWeek] = useState(() => {
    // Retroceder hasta el lunes de la semana actual
    const monday = new Date(baseDate);
    const dayOfWeek = baseDate.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    // Si es domingo (0), retroceder 6 días, si es lunes (1), retroceder 0 días, etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(baseDate.getDate() - daysToSubtract);
    return monday;
  });

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

  // Función para verificar si una fecha es pasada (anterior a la fecha de referencia)
  const isPastDate = (date) => {
    // Usamos el 24 de abril de 2025 como fecha de referencia "actual"
    const referenceDate = new Date(2025, 3, 24); // 24 de abril de 2025

    // Normalizar las fechas para comparar solo año, mes y día
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const normalizedReference = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

    // Verificar si la fecha es anterior a la fecha de referencia
    return isBefore(normalizedDate, normalizedReference);
  };

  // Generar los días de la semana actual
  // Usamos useMemo para evitar recalcular en cada renderizado
  const weekDays = useMemo(() => {
    // Usar el estado currentWeek como inicio de la semana
    // Esto permitirá que la navegación entre semanas funcione correctamente
    const startDate = new Date(currentWeek);

    console.log(`Generando días para la semana que comienza el ${format(startDate, 'yyyy-MM-dd')}`);
    console.log(`Día de la semana del inicio: ${startDate.getDay()}`); // Debería ser 1 (lunes)

    return Array.from({ length: 7 }, (_, i) => {
      const day = addDays(startDate, i);
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayOfWeek = day.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sábado o domingo
      const isPast = isPastDate(day); // Verificar si es una fecha pasada

      console.log(`Día ${i+1} de la semana: ${dateStr}, día de la semana: ${dayOfWeek}, ¿es fin de semana? ${isWeekend}, ¿es pasado? ${isPast}`);

      return {
        date: day,
        dayName: format(day, 'EEEE', { locale: es }),
        dayNumber: format(day, 'd', { locale: es }),
        month: format(day, 'MMMM', { locale: es }),
        isWeekend: isWeekend,
        isPast: isPast
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
        // Limpiar el estado de los slots disponibles al cambiar de semana
        setAvailableSlots({});
        console.log('Obteniendo horarios del doctor para la semana que comienza el', format(currentWeek, 'yyyy-MM-dd'));

        // Intentar obtener los horarios del doctor desde el backend
        try {
          const doctorId = user.doctorProfile.id;
          console.log('Llamando a la API para obtener horarios del doctor:', doctorId);

          const response = await api.get(`/api/doctors/schedule/${doctorId}`);
          console.log('Respuesta del servidor:', response.data);

          // Inicializar con slots vacíos para las fechas de la semana actual
          const initialSlots = {};

          // Crear slots vacíos para la semana actual
          currentWeekDays.forEach(day => {
            if (!day.isWeekend) { // Solo inicializar días laborables
              const dateStr = format(day.date, 'yyyy-MM-dd');
              initialSlots[dateStr] = {};

              // Inicializar todos los slots como no disponibles
              currentTimeSlots.forEach(slot => {
                initialSlots[dateStr][slot.id] = false;
              });
            }
          });

          if (response.data && Object.keys(response.data).length > 0) {
            console.log('Horarios obtenidos del servidor:', response.data);

            // Mostrar un ejemplo de los datos recibidos
            const sampleDate = Object.keys(response.data)[0];
            if (sampleDate) {
              console.log(`Ejemplo para fecha ${sampleDate}:`, response.data[sampleDate]);

              // Verificar si hay slots disponibles
              const availableCount = Object.values(response.data[sampleDate]).filter(value => value === true).length;
              console.log(`Slots disponibles para ${sampleDate}: ${availableCount} de ${Object.keys(response.data[sampleDate]).length}`);
            }

            // Convertir los IDs de slots del formato del backend al formato del frontend
            const convertedSlots = {...initialSlots}; // Usar los slots inicializados como base

            // Recorrer todas las fechas del servidor
            Object.keys(response.data).forEach(dateStr => {
              // Verificar si la fecha está en la semana actual
              const dateInCurrentWeek = currentWeekDays.some(day =>
                format(day.date, 'yyyy-MM-dd') === dateStr && !day.isWeekend
              );

              if (dateInCurrentWeek) {
                if (!convertedSlots[dateStr]) {
                  convertedSlots[dateStr] = {};
                }

                // Recorrer todos los slots de cada fecha
                Object.keys(response.data[dateStr]).forEach(slotId => {
                  // Convertir el ID del slot de Bloque_X a slot_X
                  const frontendSlotId = denormalizeSlotId(slotId);
                  const isAvailable = response.data[dateStr][slotId] === true;

                  console.log(`Convirtiendo slot: ${slotId} -> ${frontendSlotId}, disponible: ${isAvailable}`);

                  convertedSlots[dateStr][frontendSlotId] = isAvailable;
                });
              }
            });

            // Verificar la conversión para la fecha de ejemplo
            if (sampleDate) {
              console.log(`Slots convertidos para ${sampleDate}:`, convertedSlots[sampleDate]);
            }

            setAvailableSlots(convertedSlots);
            setInitialDataLoaded(true);
            setLoading(false);
            return;
          } else {
            console.log('No se encontraron horarios en el servidor, usando datos iniciales');
            setAvailableSlots(initialSlots);
            setInitialDataLoaded(true);
            setLoading(false);
            return;
          }
        } catch (apiError) {
          console.error('Error al obtener horarios del servidor:', apiError);

          // Inicializar con slots vacíos para las fechas actuales
          console.log('Inicializando datos de disponibilidad vacíos');
          const emptySlots = {};

          // Crear slots vacíos para la semana actual
          currentWeekDays.forEach(day => {
            if (!day.isWeekend) { // Solo inicializar días laborables
              const dateStr = format(day.date, 'yyyy-MM-dd');
              emptySlots[dateStr] = {};

              // Inicializar todos los slots como no disponibles
              currentTimeSlots.forEach(slot => {
                // Usar directamente el ID del slot en formato frontend
                emptySlots[dateStr][slot.id] = false;
              });
            }
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

  // Navegar a la semana de referencia (24 de abril de 2025)
  const goToCurrentWeek = () => {
    // Calcular el inicio de la semana (lunes) para la fecha base
    const referenceDate = new Date(2025, 3, 24); // 24 de abril de 2025
    const monday = new Date(referenceDate);
    const dayOfWeek = referenceDate.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
    // Si es domingo (0), retroceder 6 días, si es lunes (1), retroceder 0 días, etc.
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    monday.setDate(referenceDate.getDate() - daysToSubtract);

    setCurrentWeek(monday);
    // Indicar que se deben actualizar los datos
    setShouldUpdateData(prev => !prev);
  };

  // Cambiar la disponibilidad de un horario
  const toggleSlotAvailability = (dateStr, slotId) => {
    // El slotId ya viene en formato frontend (slot_X)
    console.log(`Cambiando disponibilidad para ${dateStr}, slot ${slotId}`);

    // Verificar si la fecha es pasada
    const date = new Date(dateStr);
    if (isPastDate(date)) {
      console.log(`No se puede modificar una fecha pasada: ${dateStr}`);
      setToast({
        message: 'No se pueden modificar horarios de fechas pasadas',
        type: 'warning',
        duration: 3000
      });
      return;
    }

    // Verificar si la fecha existe en el estado
    const dateExists = dateStr in availableSlots;
    console.log(`¿La fecha ${dateStr} existe en el estado? ${dateExists}`);

    // Mostrar todos los slots disponibles para esta fecha
    if (dateExists) {
      console.log(`Slots para fecha ${dateStr}:`, availableSlots[dateStr]);

      // Contar cuántos slots están disponibles
      const availableCount = Object.values(availableSlots[dateStr]).filter(Boolean).length;
      console.log(`Slots disponibles para ${dateStr}: ${availableCount} de ${Object.keys(availableSlots[dateStr]).length}`);

      // Mostrar los slots disponibles
      Object.keys(availableSlots[dateStr]).forEach(id => {
        if (availableSlots[dateStr][id]) {
          console.log(`- Slot disponible: ${id}`);
        }
      });
    } else {
      console.log(`La fecha ${dateStr} no existe en el estado. Inicializando...`);
    }

    // Verificar si el slot existe en el estado
    const slotExists = dateExists && slotId in availableSlots[dateStr];
    console.log(`¿El slot ${slotId} existe en el estado? ${slotExists}`);

    // Obtener el estado actual (false por defecto si no existe)
    const currentValue = availableSlots[dateStr]?.[slotId] === true;
    console.log(`Estado actual de ${slotId}: ${currentValue}`);

    // Usar una variable local para el nuevo valor (invertir el estado actual)
    const newValue = !currentValue;
    console.log(`Nuevo estado de ${slotId}: ${newValue}`);

    // Actualizar el estado una sola vez
    setAvailableSlots(prevSlots => {
      // Crear una copia profunda del objeto para evitar modificar el estado directamente
      const newSlots = JSON.parse(JSON.stringify(prevSlots));

      // Si la fecha no existe, inicializarla con todos los slots como no disponibles
      if (!newSlots[dateStr]) {
        newSlots[dateStr] = {};

        // Inicializar todos los slots como no disponibles
        timeSlots.forEach(slot => {
          newSlots[dateStr][slot.id] = false;
        });
      }

      // Asignar el nuevo valor
      newSlots[dateStr][slotId] = newValue;

      // Mostrar el estado actualizado
      console.log(`Estado actualizado para ${dateStr}, slot ${slotId}: ${newValue}`);

      // Contar cuántos slots están disponibles después de la actualización
      const availableCount = Object.values(newSlots[dateStr]).filter(Boolean).length;
      console.log(`Slots disponibles para ${dateStr} después de la actualización: ${availableCount} de ${Object.keys(newSlots[dateStr]).length}`);

      return newSlots;
    });
  };

  // Guardar los cambios SOLO de la semana actual
  const saveChanges = async () => {
    try {
      setLoading(true);
      console.log('Guardando ÚNICAMENTE los horarios de la semana actual');

      if (!user || !user.doctorProfile) {
        throw new Error('No se encontró el perfil de doctor');
      }

      const doctorId = user.doctorProfile.id;

      try {
        // Convertir los IDs de slots del formato del frontend al formato del backend
        const convertedSlots = {};

        // Obtener las fechas de la semana actual (excluyendo fines de semana)
        const currentWeekDates = weekDays
          .filter(day => !day.isWeekend && !day.isPast) // Excluir fines de semana y fechas pasadas
          .map(day => format(day.date, 'yyyy-MM-dd'));

        console.log('Fechas de la semana actual a guardar (excluyendo pasadas y fines de semana):', currentWeekDates);

        // Recorrer solo las fechas de la semana actual
        currentWeekDates.forEach(dateStr => {
          // Verificar si tenemos datos para esta fecha
          if (availableSlots[dateStr]) {
            convertedSlots[dateStr] = {};

            // Contar cuántos slots están disponibles
            const availableCount = Object.values(availableSlots[dateStr]).filter(Boolean).length;
            console.log(`Slots disponibles para ${dateStr}: ${availableCount} de ${Object.keys(availableSlots[dateStr]).length}`);

            // Mostrar los slots disponibles
            console.log(`Slots disponibles para ${dateStr}:`);
            Object.keys(availableSlots[dateStr]).forEach(id => {
              if (availableSlots[dateStr][id]) {
                console.log(`- ${id}`);
              }
            });

            // Recorrer todos los slots de cada fecha
            Object.keys(availableSlots[dateStr]).forEach(slotId => {
              // Convertir el ID del slot de slot_X a Bloque_X
              const backendSlotId = normalizeSlotId(slotId);
              convertedSlots[dateStr][backendSlotId] = availableSlots[dateStr][slotId];
              console.log(`Convirtiendo ${slotId} -> ${backendSlotId}, disponible: ${availableSlots[dateStr][slotId]}`);
            });
          } else {
            console.log(`No hay datos para la fecha ${dateStr}, inicializando como no disponibles`);
            convertedSlots[dateStr] = {};

            // Inicializar todos los slots como no disponibles
            timeSlots.forEach(slot => {
              const backendSlotId = normalizeSlotId(slot.id);
              convertedSlots[dateStr][backendSlotId] = false;
              console.log(`Inicializando ${slot.id} -> ${backendSlotId} como no disponible`);
            });
          }
        });

        // Intentar hacer la llamada a la API real
        console.log(`Enviando datos al servidor: /api/doctors/schedule/${doctorId}`);
        console.log('Datos convertidos para el backend:', convertedSlots);
        const response = await api.post(`/api/doctors/schedule/${doctorId}`, { availableSlots: convertedSlots });
        console.log('Respuesta del servidor:', response.data);

        // Ya no guardamos en localStorage para evitar inconsistencias

        setToast({
          message: 'Horarios de esta semana guardados con éxito en el servidor',
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
                  aria-label="Semana de referencia"
                >
                  Semana Base
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
                              day.isWeekend
                                ? 'bg-gray-200 text-gray-500'
                                : day.isPast
                                  ? 'bg-gray-300 text-gray-600'
                                  : isSameDay(day.date, new Date(2025, 3, 24))
                                    ? 'bg-primary-light/20'
                                    : 'bg-gray-100'
                            }`}
                          >
                            <div className="font-bold capitalize">{day.dayName}</div>
                            <div>{day.dayNumber} de {day.month}</div>
                            {day.isWeekend && <div className="text-xs text-gray-500">Fin de semana</div>}
                            {day.isPast && !day.isWeekend && <div className="text-xs text-gray-600">Fecha pasada</div>}
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
                            // Usar el ID del slot en formato frontend (slot_X) para buscar en availableSlots
                            const frontendSlotId = slot.id;

                            // Verificar si la fecha existe en el estado
                            const dateExists = dateStr in availableSlots;

                            // Verificar si el slot existe para esta fecha
                            const slotExists = dateExists && frontendSlotId in availableSlots[dateStr];

                            // Obtener el valor de disponibilidad
                            const slotValue = slotExists ? availableSlots[dateStr][frontendSlotId] : undefined;

                            // Verificar si el slot está disponible (debe ser exactamente true)
                            const isAvailable = slotValue === true;

                            // Log para depuración (solo para el primer slot de cada día)
                            if (timeIndex === 0 && dayIndex === 0) {
                              console.log(`Renderizando slot ${frontendSlotId} para fecha ${dateStr}:`);
                              console.log(`- ¿Fecha existe? ${dateExists}`);
                              console.log(`- ¿Slot existe? ${slotExists}`);
                              console.log(`- Valor del slot: ${slotValue}`);
                              console.log(`- ¿Está disponible? ${isAvailable}`);
                            }

                            // Si es fin de semana, mostrar como no disponible
                            if (day.isWeekend) {
                              return (
                                <td
                                  key={dayIndex}
                                  className="p-3 border text-center bg-gray-200"
                                >
                                  <div className="text-gray-500">Fin de semana</div>
                                </td>
                              );
                            }

                            // Si es una fecha pasada, mostrar como no disponible
                            if (day.isPast) {
                              return (
                                <td
                                  key={dayIndex}
                                  className="p-3 border text-center bg-gray-300"
                                >
                                  <div className="text-gray-600">Fecha pasada</div>
                                </td>
                              );
                            }

                            // Si la fecha no existe en los datos, mostrar un mensaje
                            if (!dateExists) {
                              return (
                                <td
                                  key={dayIndex}
                                  className="p-3 border text-center bg-gray-100"
                                >
                                  <div className="text-xs text-gray-500">No hay datos</div>
                                </td>
                              );
                            }

                            return (
                              <td
                                key={dayIndex}
                                className={`p-2 border relative h-16 ${
                                  isSameDay(day.date, new Date(2025, 3, 24)) ? 'bg-primary-light/10' : ''
                                }`}
                              >
                                <button
                                  onClick={() => toggleSlotAvailability(dateStr, frontendSlotId)}
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
                    {loading ? 'Guardando...' : 'Guardar Cambios de Esta Semana'}
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
