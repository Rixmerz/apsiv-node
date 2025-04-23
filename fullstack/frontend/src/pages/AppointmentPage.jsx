import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { useAuth } from '../hooks/useAuth';

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

  // Time slots with their labels
  const timeSlots = [
    { id: 'Bloque_1', time: '09:00 - 10:00' },
    { id: 'Bloque_2', time: '10:00 - 11:00' },
    { id: 'Bloque_3', time: '11:00 - 12:00' },
    { id: 'Bloque_4', time: '12:00 - 13:00' },
    { id: 'Bloque_5', time: '14:00 - 15:00' },
    { id: 'Bloque_6', time: '15:00 - 16:00' },
    { id: 'Bloque_7', time: '16:00 - 17:00' },
    { id: 'Bloque_8', time: '17:00 - 18:00' }
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

  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setLoading(true);

    try {
      // Call API to get available slots for the selected date
      const response = await axios.get(`/api/appointments/available-slots?date=${formatDateForApi(date)}`);

      if (response.data && response.data.availableSlots) {
        setAvailableSlots(response.data.availableSlots);
      } else {
        // For demo purposes, generate mock data
        const mockAvailableSlots = timeSlots.map(slot => ({
          ...slot,
          available: Math.random() > 0.3 // 70% chance of being available
        }));
        setAvailableSlots(mockAvailableSlots);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      // For demo purposes, generate mock data even on error
      const mockAvailableSlots = timeSlots.map(slot => ({
        ...slot,
        available: Math.random() > 0.3 // 70% chance of being available
      }));
      setAvailableSlots(mockAvailableSlots);

      setToast({
        message: 'Usando datos de demostración para horarios disponibles.',
        type: 'info'
      });
    } finally {
      setLoading(false);
      // No avanzamos automáticamente para que el usuario pueda revisar su selección
    }
  };

  const handleSlotSelect = (slotId) => {
    setSelectedSlot(slotId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const nextStep = () => {
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

    setStep(step + 1);
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
      const appointmentData = {
        date: formatDateForApi(selectedDate),
        timeSlot: selectedSlot,
        patientId: user.id,
        reason: formData.reason,
        notes: formData.notes
      };

      const response = await axios.post('/api/appointments', appointmentData);

      if (response.data.success) {
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

        // Navigate to confirmation or appointments page after delay
        setTimeout(() => {
          navigate('/appointment/confirmation', {
            state: {
              appointment: response.data.appointment
            }
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      setToast({
        message: 'Error al agendar la cita. Intente nuevamente.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes, simulate API data for available slots
  useEffect(() => {
    if (selectedDate && step === 3) {
      // Simulate API call
      setTimeout(() => {
        // Randomly make some slots unavailable for demo
        const mockAvailableSlots = timeSlots.map(slot => ({
          ...slot,
          available: Math.random() > 0.3 // 70% chance of being available
        }));
        setAvailableSlots(mockAvailableSlots);
        setLoading(false);
      }, 1000);
    }
  }, [selectedDate, step]);

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
                      const dayOfWeek = date.getDay() || 7; // 1-7 (Monday-Sunday)
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
            )

            {/* Step 3: Time Slot Selection */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold mb-2">Seleccione un Horario</h2>
                <p className="text-gray-600 mb-6">
                  Fecha seleccionada: <span className="font-semibold capitalize">{formatDate(selectedDate)}</span>
                </p>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {availableSlots.length > 0 ? (
                      availableSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => slot.available && handleSlotSelect(slot.id)}
                          disabled={!slot.available}
                          className={`p-4 border rounded-lg text-center transition-colors ${
                            selectedSlot === slot.id
                              ? 'border-primary-dark bg-primary-light/20 border-2'
                              : slot.available
                                ? 'border-gray-300 hover:bg-gray-50'
                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <p className="text-lg font-semibold">{slot.time}</p>
                          {!slot.available && (
                            <p className="text-sm text-red-500 mt-1">No disponible</p>
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="col-span-full text-center py-8 text-gray-500">
                        No hay horarios disponibles para la fecha seleccionada.
                      </p>
                    )}
                  </div>
                )}

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
                      <p>{user.nombre} {user.apellido}</p>
                    </div>

                    <div>
                      <p className="font-semibold">RUT:</p>
                      <p>{user.rut}</p>
                    </div>
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
          duration={5000}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default AppointmentPage;