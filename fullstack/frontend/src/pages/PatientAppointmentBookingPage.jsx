import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import { getAvailableSlotsForDate, createAppointment } from '../services/appointmentService';
import { getAllDoctors } from '../services/doctorService';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';

const PatientAppointmentBookingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  // Usamos la misma fecha base que en la página de gestión de horarios del doctor (24 de abril de 2025)
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 3, 24));
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState(null);
  const [availableDays, setAvailableDays] = useState([]);

  // Cargar la lista de doctores al montar el componente
  useEffect(() => {
    // Usar una variable para controlar si el componente está montado
    let isMounted = true;

    const fetchDoctors = async () => {
      try {
        if (isMounted) setLoading(true);

        // Verificar si ya se ha hecho una petición para evitar duplicados
        console.log('Iniciando petición para obtener lista de doctores...');

        const doctorsData = await getAllDoctors();

        if (isMounted) {
          console.log('Doctores obtenidos correctamente:', doctorsData.length);
          setDoctors(doctorsData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error al cargar doctores:', error);
        if (isMounted) {
          setToast({
            message: 'Error al cargar la lista de doctores',
            type: 'error'
          });
          setLoading(false);
        }
      }
    };

    fetchDoctors();

    // Función de limpieza para evitar actualizar el estado si el componente se desmonta
    return () => {
      isMounted = false;
    };
  }, []);

  // Cargar los días disponibles cuando se selecciona un doctor y cambia el mes
  useEffect(() => {
    if (selectedDoctor) {
      // Aquí se podría implementar una función para obtener los días disponibles del mes
      // Por ahora, simplemente mostraremos todos los días del mes actual
      const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
      const availableDaysArray = [];

      for (let i = 1; i <= daysInMonth; i++) {
        const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);

        // No mostrar días pasados ni fines de semana
        // Usamos la misma fecha de referencia que en la página de gestión de horarios del doctor (24 de abril de 2025)
        const referenceDate = new Date(2025, 3, 24);
        referenceDate.setHours(0, 0, 0, 0);

        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        const isPast = day < referenceDate;

        if (!isWeekend && !isPast) {
          availableDaysArray.push(day);
        }
      }

      setAvailableDays(availableDaysArray);
    }
  }, [selectedDoctor, currentMonth]);

  // Cargar los horarios disponibles cuando se selecciona una fecha
  useEffect(() => {
    // Usar una variable para controlar si el componente está montado
    let isMounted = true;

    const fetchAvailableSlots = async () => {
      if (selectedDoctor && selectedDate) {
        try {
          if (isMounted) setLoading(true);

          // Asegurarnos de que la fecha se maneje correctamente
          // Crear una nueva fecha para evitar problemas con zonas horarias
          const year = selectedDate.getFullYear();
          const month = selectedDate.getMonth();
          const day = selectedDate.getDate();
          const dateObj = new Date(year, month, day);

          const dateStr = format(dateObj, 'yyyy-MM-dd');
          console.log(`Fecha seleccionada: ${selectedDate.toISOString()}`);
          console.log(`Fecha formateada: ${dateStr}`);
          console.log(`Iniciando petición para obtener horarios disponibles para doctor ${selectedDoctor.id} en fecha ${dateStr}...`);

          const slotsData = await getAvailableSlotsForDate(selectedDoctor.id, dateStr);

          if (isMounted) {
            console.log('Horarios obtenidos correctamente:', slotsData);
            setAvailableSlots(slotsData);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error al cargar horarios disponibles:', error);
          if (isMounted) {
            setToast({
              message: 'Error al cargar horarios disponibles',
              type: 'error'
            });
            setLoading(false);
          }
        }
      }
    };

    fetchAvailableSlots();

    // Función de limpieza para evitar actualizar el estado si el componente se desmonta
    return () => {
      isMounted = false;
    };
  }, [selectedDoctor, selectedDate]);

  // Navegar al mes anterior
  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  // Navegar al mes siguiente
  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  // Seleccionar un doctor
  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  // Seleccionar una fecha
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  // Seleccionar un horario
  const handleSlotSelect = (slotId) => {
    setSelectedSlot(slotId);
  };

  // Reservar cita
  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) {
      setToast({
        message: 'Por favor, seleccione doctor, fecha y horario',
        type: 'warning'
      });
      return;
    }

    try {
      setLoading(true);

      // Crear la fecha de la cita combinando la fecha seleccionada con la hora del slot
      const slotNumber = parseInt(selectedSlot.replace('slot_', ''));
      const appointmentHour = slotNumber + 7; // slot_1 -> 8:00, slot_2 -> 9:00, etc.

      // Asegurarnos de que la fecha se maneje correctamente
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const day = selectedDate.getDate();

      const appointmentDate = new Date(year, month, day, appointmentHour, 0, 0, 0);
      console.log(`Fecha de la cita: ${appointmentDate.toISOString()}, hora: ${appointmentHour}:00`);

      // Obtener el ID del paciente del usuario actual
      // Verificar la estructura del objeto user para obtener el ID del paciente
      console.log('Usuario actual:', user);

      let patientId;
      if (user.patientProfile && user.patientProfile.id) {
        patientId = user.patientProfile.id;
      } else if (user.patient && user.patient.id) {
        patientId = user.patient.id;
      } else if (user.patientId) {
        patientId = user.patientId;
      } else {
        // Si no podemos obtener el ID del paciente, mostrar un error
        setToast({
          message: 'No se pudo obtener el ID del paciente. Por favor, contacte al administrador.',
          type: 'error'
        });
        setLoading(false);
        return;
      }

      console.log(`ID del paciente obtenido: ${patientId}`);

      const appointmentData = {
        doctorId: selectedDoctor.id,
        patientId: patientId,
        date: appointmentDate.toISOString(),
        slotId: selectedSlot,
        notes: notes
      };

      console.log('Datos de la cita a enviar:', appointmentData);

      try {
        const result = await createAppointment(appointmentData);
        console.log('Resultado de la creación de la cita:', result);

        if (result.success) {
          setToast({
            message: 'Cita reservada con éxito',
            type: 'success'
          });

          // Limpiar el formulario
          setSelectedDoctor(null);
          setSelectedDate(null);
          setSelectedSlot(null);
          setNotes('');

          // Redirigir a la página de citas del paciente
          setTimeout(() => {
            navigate('/patient/appointments');
          }, 2000);
        } else {
          // Mostrar el mensaje de error específico
          setToast({
            message: result.error || 'Error al reservar cita',
            type: 'error'
          });
          console.error('Error al reservar cita:', result.error);
        }
      } catch (error) {
        console.error('Error inesperado al reservar cita:', error);
        setToast({
          message: 'Error inesperado al reservar cita',
          type: 'error'
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error al reservar cita:', error);
      setToast({
        message: 'Error al reservar cita',
        type: 'error'
      });
      setLoading(false);
    }
  };

  // Renderizar el calendario del mes
  const renderCalendar = () => {
    if (!selectedDoctor) return null;

    return (
      <div className="mt-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={goToPreviousMonth}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            &lt; Anterior
          </button>
          <h3 className="text-xl font-semibold capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h3>
          <button
            onClick={goToNextMonth}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Siguiente &gt;
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2 text-center">
          <div className="font-semibold">Lun</div>
          <div className="font-semibold">Mar</div>
          <div className="font-semibold">Mié</div>
          <div className="font-semibold">Jue</div>
          <div className="font-semibold">Vie</div>
          <div className="font-semibold text-red-500">Sáb</div>
          <div className="font-semibold text-red-500">Dom</div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {renderDaysInMonth()}
        </div>
      </div>
    );
  };

  // Renderizar los días del mes
  const renderDaysInMonth = () => {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Ajustar el primer día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
    // En JavaScript, getDay() devuelve 0 para domingo, 1 para lunes, etc.
    // Pero nuestro calendario empieza en lunes, así que ajustamos:
    // Lunes: 0, Martes: 1, ..., Domingo: 6
    let firstDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (firstDayOfWeek < 0) firstDayOfWeek = 6; // Si es domingo (0), ajustar a 6

    console.log(`Primer día del mes: ${firstDayOfMonth.toISOString()}, día de la semana: ${firstDayOfMonth.getDay()}, ajustado: ${firstDayOfWeek}`);

    const daysArray = [];

    // Agregar celdas vacías para los días anteriores al primer día del mes
    for (let i = 0; i < firstDayOfWeek; i++) {
      daysArray.push(<div key={`empty-${i}`} className="h-12 border rounded bg-gray-100"></div>);
    }

    // Agregar los días del mes
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dateStr = format(date, 'yyyy-MM-dd');
      const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === dateStr;

      // Verificar si es fin de semana
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

      // Verificar si es un día pasado
      // Usamos la misma fecha de referencia que en la página de gestión de horarios del doctor (24 de abril de 2025)
      const referenceDate = new Date(2025, 3, 24);
      referenceDate.setHours(0, 0, 0, 0);
      const isPast = date < referenceDate;

      // Verificar si el día está en la lista de días disponibles
      const isAvailable = availableDays.some(availableDay =>
        format(availableDay, 'yyyy-MM-dd') === dateStr
      );

      daysArray.push(
        <div
          key={day}
          className={`h-12 border rounded flex items-center justify-center cursor-pointer ${
            isSelected
              ? 'bg-primary text-white'
              : isWeekend || isPast
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isAvailable
                  ? 'hover:bg-primary-light'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
          onClick={() => {
            if (!isWeekend && !isPast && isAvailable) {
              handleDateSelect(date);
            }
          }}
        >
          {day}
        </div>
      );
    }

    return daysArray;
  };

  // Renderizar los horarios disponibles
  const renderAvailableSlots = () => {
    if (!selectedDate || !availableSlots.slotsInfo) return null;

    const slots = availableSlots.slotsInfo;
    const slotIds = Object.keys(slots).sort((a, b) => {
      // Ordenar por número de slot (slot_1, slot_2, etc.)
      const numA = parseInt(a.replace('slot_', ''));
      const numB = parseInt(b.replace('slot_', ''));
      return numA - numB;
    });

    // Contar cuántos slots están disponibles
    const availableCount = slotIds.filter(slotId => slots[slotId].status === 'available').length;
    console.log(`Renderizando ${slotIds.length} slots, ${availableCount} disponibles`);

    // Mostrar todos los slots disponibles
    console.log('Slots disponibles:');
    slotIds.forEach(slotId => {
      const slot = slots[slotId];
      if (slot.status === 'available') {
        console.log(`- ${slotId}: ${slot.hour}`);
      }
    });

    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">
          Horarios disponibles para el {format(selectedDate, 'd MMMM yyyy', { locale: es })}
        </h3>

        <div className="mb-2">
          <p className="text-sm text-gray-600">
            {availableCount} horarios disponibles
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {slotIds.map(slotId => {
            const slot = slots[slotId];
            const isAvailable = slot.status === 'available';
            const isSelected = selectedSlot === slotId;

            // Solo mostrar slots disponibles
            if (!isAvailable) {
              return null;
            }

            // Agregar log para depuración
            console.log(`Renderizando slot ${slotId}: configuredByDoctor=${slot.configuredByDoctor}, status=${slot.status}, available=${slot.available}`);

            return (
              <button
                key={slotId}
                className={`p-3 rounded border ${
                  isSelected
                    ? 'bg-primary text-white border-primary'
                    : 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                }`}
                onClick={() => handleSlotSelect(slotId)}
              >
                {slot.hour}
              </button>
            );
          })}

          {availableCount === 0 && (
            <div className="col-span-full text-center py-4 text-gray-500">
              No hay horarios disponibles para esta fecha
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Reservar Cita</h1>

          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

          {loading && <Spinner />}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Seleccione un doctor</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {doctors.map(doctor => (
            <div
              key={doctor.id}
              className={`border rounded-lg p-4 cursor-pointer ${
                selectedDoctor?.id === doctor.id
                  ? 'border-primary bg-primary-light/20'
                  : 'hover:border-primary hover:bg-primary-light/10'
              }`}
              onClick={() => handleDoctorSelect(doctor)}
            >
              <h3 className="font-semibold">{doctor.user.name}</h3>
              <p className="text-sm text-gray-600">{doctor.specialty}</p>
            </div>
          ))}

          {doctors.length === 0 && !loading && (
            <div className="col-span-full text-center py-4 text-gray-500">
              No hay doctores disponibles
            </div>
          )}
        </div>

        {renderCalendar()}

        {renderAvailableSlots()}

        {selectedSlot && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">Notas adicionales</h3>

            <textarea
              className="w-full border rounded p-2 mb-4"
              rows="3"
              placeholder="Agregue notas o síntomas (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>

            <button
              className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark"
              onClick={handleBookAppointment}
              disabled={loading}
            >
              {loading ? 'Reservando...' : 'Reservar Cita'}
            </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PatientAppointmentBookingPage;
