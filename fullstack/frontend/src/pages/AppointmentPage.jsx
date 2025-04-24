import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { format, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { useAuth } from '../hooks/useAuth';
import { normalizeSlotId, denormalizeSlotId } from '../utils/slotUtils';

const AppointmentPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    reason: '',
    notes: ''
  });

  // Meses disponibles (actual y siguientes 2 meses)
  const getAvailableMonths = () => {
    const months = [];
    const today = new Date();

    for (let i = 0; i < 3; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      months.push({
        month: date.getMonth(),
        year: date.getFullYear(),
        label: format(date, 'MMMM yyyy', { locale: es })
      });
    }

    return months;
  };

  const availableMonths = getAvailableMonths();

  // Time slots with their labels - Usando formato frontend (slot_X)
  const timeSlots = [
    { id: 'slot_1', time: '09:00 - 10:00' },
    { id: 'slot_2', time: '10:00 - 11:00' },
    { id: 'slot_3', time: '11:00 - 12:00' },
    { id: 'slot_4', time: '12:00 - 13:00' },
    { id: 'slot_5', time: '14:00 - 15:00' },
    { id: 'slot_6', time: '15:00 - 16:00' },
    { id: 'slot_7', time: '16:00 - 17:00' },
    { id: 'slot_8', time: '17:00 - 18:00' }
  ];

  // Available dates for the selected month (excluding weekends and past dates)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    // First day of selected month
    const firstDay = new Date(selectedYear, selectedMonth, 1);

    // Last day of selected month
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

    // Start from today if current month, otherwise start from first day of month
    const startDate = (selectedMonth === today.getMonth() && selectedYear === today.getFullYear())
      ? today
      : firstDay;

    for (let d = new Date(startDate); d <= lastDay; d.setDate(d.getDate() + 1)) {
      // Skip weekends (0 is Sunday, 6 is Saturday)
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        dates.push(new Date(d));
      }
    }

    return dates;
  };

  // Recalculate available dates when month changes
  useEffect(() => {
    if (selectedMonth !== null && selectedYear !== null) {
      // Reset selected date when month changes
      setSelectedDate(null);
      setSelectedSlot(null);
    }
  }, [selectedMonth, selectedYear]);

  const availableDates = getAvailableDates();

  // Format date for display
  const formatDate = (date) => {
    return format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es });
  };

  // Format date for API
  const formatDateForApi = (date) => {
    return format(date, 'yyyy-MM-dd');
  };



  // Handle month selection
  const handleMonthSelect = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setSelectedDate(null); // Reset selected date when month changes
  };

  // Preselect current month on component mount
  useEffect(() => {
    // Current month is already set as default state
    // This is just to ensure the calendar is properly initialized
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  }, []);

  const handleDateSelect = (date) => {
    console.log('Fecha seleccionada original:', date);

    // Normalizar la fecha para que siempre tenga hora 00:00:00
    // Esto evita problemas con la zona horaria y la hora actual
    const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);

    console.log('Fecha seleccionada normalizada:', normalizedDate);
    setSelectedDate(normalizedDate);
    setSelectedSlot(null);
    // La carga de horarios disponibles se maneja en el useEffect cuando se cambia a step 3
  };

  const handleSlotSelect = (slotId) => {
    setSelectedSlot(slotId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => {
    console.log('Avanzando al siguiente paso. Paso actual:', step);

    if (step === 1 && !selectedMonth) {
      setToast({
        message: 'Por favor, seleccione un mes para continuar.',
        type: 'warning'
      });
      return;
    }

    if (step === 2 && !selectedDate) {
      setToast({
        message: 'Por favor, seleccione una fecha para continuar.',
        type: 'warning'
      });
      return;
    }

    if (step === 3 && !selectedSlot) {
      setToast({
        message: 'Por favor, seleccione un horario para continuar.',
        type: 'warning'
      });
      return;
    }

    const newStep = step + 1;
    console.log('Avanzando al paso:', newStep);
    setStep(newStep);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedSlot) {
      setToast({
        message: 'Por favor, seleccione fecha y horario para continuar.',
        type: 'warning'
      });
      return;
    }

    setLoading(true);

    try {
      // Para demo, usamos el primer doctor disponible (ID 1)
      const doctorId = 1;

      // Normalizar el ID del slot para el backend
      const backendSlotId = normalizeSlotId(selectedSlot);
      console.log('ID del slot normalizado para backend:', backendSlotId);

      // Combinar fecha y hora seleccionada
      const timeSlotInfo = timeSlots.find(slot => slot.id === selectedSlot);
      const timeString = timeSlotInfo?.time || '09:00 - 10:00';
      const hourStr = timeString.split(' - ')[0];
      const hour = parseInt(hourStr.split(':')[0]);
      const minute = parseInt(hourStr.split(':')[1] || '0');

      console.log('Hora seleccionada:', { timeString, hour, minute });

      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(hour, minute, 0, 0);

      console.log('Fecha y hora de la cita:', appointmentDateTime);

      // Para demo, usamos un ID de paciente fijo si no está disponible
      const patientId = user?.patientProfile?.id || 1;

      const appointmentData = {
        date: appointmentDateTime.toISOString(),
        patientId: patientId,
        doctorId: doctorId,
        status: 'scheduled',
        notes: `${formData.reason}\n${formData.notes || ''}`
      };

      console.log('Datos de la cita a enviar:', appointmentData);

      // Verificar si el token está disponible
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({
          message: 'No hay sesión activa. Por favor, inicie sesión nuevamente.',
          type: 'error'
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      const response = await api.post('/api/appointments', appointmentData);

      if (response.data && response.data.appointment) {
        setToast({
          message: '¡Cita agendada con éxito!',
          type: 'success'
        });

        // Reset form
        setSelectedDate(null);
        setSelectedSlot(null);
        setFormData({
          reason: '',
          notes: ''
        });

        // Crear un objeto con los datos de la cita para pasar a la página de confirmación
        const appointmentDetails = {
          date: appointmentDateTime,
          timeSlot: timeSlots.find(slot => slot.id === selectedSlot)?.time,
          doctorName: 'Dr. Juan Pérez',
          patientName: user?.name,
          patientEmail: user?.email,
          reason: formData.reason,
          notes: formData.notes
        };

        // Guardar los datos en sessionStorage (se borrarán al cerrar la pestaña)
        sessionStorage.setItem('appointmentDetails', JSON.stringify(appointmentDetails));

        // Navigate to confirmation page after delay
        setTimeout(() => {
          navigate('/appointment/confirmation');
        }, 1000);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      console.error('Error details:', error.response?.data);

      // Mostrar un mensaje de error más detallado si está disponible
      const errorMessage = error.response?.data?.error || 'Error al agendar la cita. Intente nuevamente.';

      setToast({
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Referencia para controlar si el componente está montado
  const isMounted = React.useRef(true);

  // Limpiar la referencia cuando el componente se desmonte
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Función para obtener los horarios disponibles (fuera del useEffect)
  const fetchAvailableSlots = async (dateObj) => {
    if (!dateObj) return;

    try {
      // Formatear la fecha para la API
      const dateStr = formatDateForApi(dateObj);
      console.log(`Obteniendo horarios disponibles para la fecha ${dateStr}`);

      // Aquí usamos un ID de doctor fijo (1) para demo
      const doctorId = 1;

      // Consultar directamente el endpoint de slots disponibles
      console.log(`Consultando API para slots disponibles del doctor ${doctorId} en fecha ${dateStr}`);

      // Agregar un timeout para la solicitud
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout

      try {
        const response = await api.get(`/api/appointments/available-slots/${doctorId}/${dateStr}`, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log('Respuesta del servidor:', response.data);

        // Verificar si el componente sigue montado antes de actualizar el estado
        if (!isMounted.current) return;

        if (response.data && response.data.slots) {
          // Convertir el objeto de slots a un array para el frontend
          const slotsData = response.data.slots;
          const doctorSlotsData = response.data.doctorAvailableSlots || {};
          const hasAvailableSlots = response.data.hasAvailableSlots || false;

          console.log('Respuesta del backend - hasAvailableSlots:', hasAvailableSlots);

          // Mapear los slots disponibles a la estructura que espera el frontend
          const availableSlotsList = timeSlots.map(slot => {
            // Normalizar el ID del slot para buscar en los datos del backend
            const backendSlotId = normalizeSlotId(slot.id);

            // Un slot está disponible si:
            // 1. El doctor lo ha marcado como disponible (doctorSlotsData)
            // 2. No hay cita programada en ese horario (slotsData)
            const isDoctorAvailable = doctorSlotsData[backendSlotId] === true;
            const isSlotFree = slotsData[backendSlotId] === true;

            return {
              ...slot,
              // Solo mostrar como disponible si ambas condiciones son verdaderas
              available: isDoctorAvailable && isSlotFree,

              // Agregar más información para ayudar en la interfaz de usuario
              doctorAvailable: isDoctorAvailable,
              hasExistingAppointment: isDoctorAvailable && !isSlotFree
            };
          });

          console.log('Lista final de slots con disponibilidad:', availableSlotsList);

          if (hasAvailableSlots) {
            console.log('Hay slots disponibles para esta fecha');
            // Actualizar el estado con los slots disponibles
            setAvailableSlots(availableSlotsList);

            // Mostrar mensaje informativo
            setToast({
              message: 'Mostrando horarios disponibles basados en datos reales de la base de datos.',
              type: 'success',
              duration: 3000
            });
          } else {
            console.log('No hay slots disponibles para esta fecha');
            // Actualizar el estado con los slots no disponibles
            setAvailableSlots(availableSlotsList);

            // Mostrar mensaje informativo
            setToast({
              message: 'No hay horarios disponibles para la fecha seleccionada. Por favor, seleccione otra fecha.',
              type: 'warning',
              duration: 5000
            });
          }
        } else {
          console.log('No se recibieron datos válidos del servidor');

          // Si no hay datos, mostrar todos los slots como no disponibles
          const defaultSlots = timeSlots.map(slot => ({
            ...slot,
            available: false,
            doctorAvailable: false,
            hasExistingAppointment: false
          }));

          setAvailableSlots(defaultSlots);

          setToast({
            message: 'No hay horarios configurados para esta fecha. Por favor, seleccione otra fecha.',
            type: 'warning',
            duration: 3000
          });
        }
      } catch (apiError) {
        console.error('Error en la llamada a la API:', apiError);

        // Datos de respaldo en caso de error
        const fallbackSlots = timeSlots.map(slot => ({
          ...slot,
          available: false,
          doctorAvailable: false,
          hasExistingAppointment: false
        }));

        setAvailableSlots(fallbackSlots);

        setToast({
          message: 'Error al cargar horarios. Por favor, intente nuevamente o seleccione otra fecha.',
          type: 'error',
          duration: 5000
        });
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('Error general al obtener slots disponibles:', error);

      // Verificar si el componente sigue montado antes de actualizar el estado
      if (!isMounted.current) return;

      // En caso de error, mostrar todas las horas como no disponibles
      const fallbackSlots = timeSlots.map(slot => ({
        ...slot,
        available: false,
        doctorAvailable: false,
        hasExistingAppointment: false
      }));

      setAvailableSlots(fallbackSlots);

      setToast({
        message: 'Error al cargar horarios. Por favor, intente nuevamente.',
        type: 'error',
        duration: 5000
      });
    } finally {
      // Siempre asegurarse de que setLoading(false) se ejecute
      if (isMounted.current) {
        setLoading(false);
        console.log('Estado de carga completado');
      }
    }
  };

  // Efecto para cargar los horarios disponibles cuando cambia la fecha o el paso
  useEffect(() => {
    console.log('useEffect para cargar horas disponibles. Fecha:', selectedDate, 'Paso:', step);

    // Solo cargar horarios cuando estamos en el paso 3 y hay una fecha seleccionada
    if (selectedDate && step === 3) {
      console.log('Cargando horas disponibles para la fecha:', selectedDate);
      setLoading(true);

      // Inicializar con valores por defecto
      const defaultSlots = timeSlots.map(slot => ({
        ...slot,
        available: false,
        doctorAvailable: false,
        hasExistingAppointment: false
      }));
      setAvailableSlots(defaultSlots);

      // Usar un flag para controlar si ya se ha manejado la respuesta
      let isHandled = false;

      // Llamar a la función de carga con un pequeño retraso
      const timerId = setTimeout(() => {
        if (!isHandled && isMounted.current) {
          fetchAvailableSlots(selectedDate)
            .finally(() => {
              isHandled = true;
            });
        }
      }, 300);

      // Timeout de seguridad para evitar carga infinita
      const securityTimeoutId = setTimeout(() => {
        if (!isHandled && isMounted.current) {
          console.log('Timeout de seguridad activado, completando carga');
          setLoading(false);
          isHandled = true;

          setToast({
            message: 'La carga de horarios está tomando más tiempo de lo esperado. Por favor, intente nuevamente.',
            type: 'warning',
            duration: 5000
          });
        }
      }, 15000); // 15 segundos de timeout de seguridad

      return () => {
        clearTimeout(timerId);
        clearTimeout(securityTimeoutId);
      };
    }
  }, [selectedDate, step]);

  // Nota: La función loadFromLocalStorage ya no se usa porque ahora generamos datos de demostración
  // directamente en fetchAvailableSlots para evitar problemas de bucle infinito y errores de recursos.

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 bg-light-dark">
        <div className="container-custom">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold text-center mb-8">Agendar Hora Médica</h1>

            {/* Progress steps */}
            <div className="flex justify-center mb-12">
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                } text-lg font-bold`}>
                  1
                </div>
                <div className={`w-20 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                } text-lg font-bold`}>
                  2
                </div>
                <div className={`w-20 h-1 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                } text-lg font-bold`}>
                  3
                </div>
                <div className={`w-20 h-1 ${step >= 4 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 4 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                } text-lg font-bold`}>
                  4
                </div>
              </div>
            </div>

            {/* Step 1: Month Selection */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Seleccione un Mes</h2>
                <p className="text-gray-600 mb-6">Primero, elija el mes en el que desea agendar su cita</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {availableMonths.map((monthData, index) => (
                    <button
                      key={index}
                      onClick={() => handleMonthSelect(monthData.month, monthData.year)}
                      className={`p-6 border-2 rounded-lg text-center hover:bg-gray-50 transition-colors ${
                        selectedMonth === monthData.month && selectedYear === monthData.year
                          ? 'border-primary-dark bg-primary-light/20'
                          : 'border-gray-300'
                      }`}
                    >
                      <p className="text-xl font-semibold capitalize">
                        {monthData.label}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    variant="primary"
                    size="large"
                    onClick={nextStep}
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Day Selection */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Seleccione un Día</h2>
                <p className="text-gray-600 mb-6">
                  Mes seleccionado: <span className="font-semibold capitalize">
                    {format(new Date(selectedYear, selectedMonth, 1), 'MMMM yyyy', { locale: es })}
                  </span>
                </p>

                <div className="mb-6">
                  <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day, i) => (
                      <div key={i} className="text-sm font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {/* Render calendar grid */}
                    {availableDates.map((date, index) => {
                      // 1-7 (Monday-Sunday)
                      const isToday = isSameDay(date, new Date());

                      return (
                        <button
                          key={index}
                          onClick={() => handleDateSelect(date)}
                          className={`p-3 rounded-lg text-center hover:bg-gray-50 transition-colors ${
                            selectedDate && isSameDay(date, selectedDate)
                              ? 'bg-primary-light/20 font-bold text-primary-dark'
                              : isToday
                                ? 'bg-gray-100 font-semibold'
                                : ''
                          }`}
                        >
                          <p className="text-lg">
                            {date.getDate()}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button
                    variant="outline"
                    size="large"
                    onClick={prevStep}
                  >
                    Volver
                  </Button>

                  <Button
                    variant="primary"
                    size="large"
                    onClick={nextStep}
                    disabled={!selectedDate}
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Time Slot Selection */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Seleccione un Horario</h2>
                <p className="text-gray-600 mb-2">
                  Fecha seleccionada: <span className="font-semibold capitalize">{formatDate(selectedDate)}</span>
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Solo se muestran los horarios que el doctor tiene disponibles. Los horarios marcados como "Reservado" ya han sido tomados por otros pacientes.
                </p>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div>
                    {/* Verificar si hay al menos un slot disponible */}
                    {availableSlots.length > 0 && availableSlots.some(slot => slot.available) ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => slot.available && handleSlotSelect(slot.id)}
                            disabled={!slot.available}
                            className={`p-4 border rounded-lg text-center transition-colors ${
                              selectedSlot === slot.id
                                ? 'border-primary-dark bg-primary-light/20 border-2'
                                : slot.available
                                  ? 'border-gray-300 hover:bg-gray-50'
                                  : slot.doctorAvailable
                                    ? 'border-gray-200 bg-red-50 text-gray-400 cursor-not-allowed' // El doctor está disponible pero hay una cita
                                    : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' // El doctor no está disponible
                            }`}
                          >
                            <p className="text-lg font-semibold">{slot.time}</p>
                            {!slot.available && slot.doctorAvailable && (
                              <p className="text-sm text-red-500 mt-1">Reservado</p>
                            )}
                            {!slot.doctorAvailable && (
                              <p className="text-sm text-gray-500 mt-1">No disponible</p>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200 p-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                          No hay horarios disponibles para esta fecha
                        </p>
                        <p className="text-gray-600 mb-4">
                          El doctor no tiene horas disponibles para la fecha seleccionada. Por favor, seleccione otra fecha del calendario.
                        </p>
                        <Button
                          variant="outline"
                          size="medium"
                          onClick={prevStep}
                        >
                          Volver al calendario
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Solo mostrar los botones de navegación si hay slots disponibles */}
                {!loading && availableSlots.some(slot => slot.available) && (
                  <div className="mt-8 flex justify-between">
                    <Button
                      variant="outline"
                      size="large"
                      onClick={prevStep}
                    >
                      Volver
                    </Button>

                    <Button
                      variant="primary"
                      size="large"
                      onClick={nextStep}
                      disabled={!selectedSlot}
                    >
                      Continuar
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Confirmation and Additional Info */}
            {step === 4 && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Confirmar Cita</h2>

                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                  <h3 className="text-xl font-bold mb-4">Resumen de la Cita</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                    <div>
                      <p className="font-semibold">Fecha:</p>
                      <p className="capitalize">{formatDate(selectedDate)}</p>
                    </div>

                    <div>
                      <p className="font-semibold">Horario:</p>
                      <p>{timeSlots.find(slot => slot.id === selectedSlot)?.time}</p>
                    </div>

                    <div>
                      <p className="font-semibold">Paciente:</p>
                      <p>{user?.name || 'No disponible'}</p>
                    </div>

                    <div>
                      <p className="font-semibold">Email:</p>
                      <p>{user?.email || 'No disponible'}</p>
                    </div>

                    {user?.patientProfile?.phone && (
                      <div>
                        <p className="font-semibold">Teléfono:</p>
                        <p>{user.patientProfile.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-6 mb-8">
                    <div>
                      <label htmlFor="reason" className="label">
                        Motivo de la consulta
                      </label>
                      <select
                        id="reason"
                        name="reason"
                        className="input-field"
                        value={formData.reason}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccione un motivo</option>
                        <option value="Primera consulta">Primera consulta</option>
                        <option value="Control de tratamiento">Control de tratamiento</option>
                        <option value="Trastornos del ánimo">Trastornos del ánimo</option>
                        <option value="Trastornos de ansiedad">Trastornos de ansiedad</option>
                        <option value="Trastornos del sueño">Trastornos del sueño</option>
                        <option value="Problemas de memoria">Problemas de memoria</option>
                        <option value="Revisión de medicamentos">Revisión de medicamentos</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="notes" className="label">
                        Notas adicionales (opcional)
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows="4"
                        className="input-field"
                        placeholder="Describa brevemente su situación o agrege información relevante para el médico"
                        value={formData.notes}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="large"
                      onClick={prevStep}
                      type="button"
                    >
                      Volver
                    </Button>

                    <Button
                      variant="primary"
                      size="large"
                      type="submit"
                      disabled={loading || !formData.reason}
                    >
                      {loading ? 'Agendando...' : 'Confirmar Cita'}
                    </Button>
                  </div>
                </form>
              </div>
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
          duration={toast.duration || 5000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AppointmentPage;