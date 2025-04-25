import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { getAvailableSlotsForDate, createAppointment } from '../services/appointmentService';
import { getAllDoctors } from '../services/doctorService';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';

const PatientAppointmentBookingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availableSlots, setAvailableSlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState(null);
  const [availableDays, setAvailableDays] = useState([]);
  
  // Cargar la lista de doctores al montar el componente
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const doctorsData = await getAllDoctors();
        setDoctors(doctorsData);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar doctores:', error);
        setToast({
          message: 'Error al cargar la lista de doctores',
          type: 'error'
        });
        setLoading(false);
      }
    };
    
    fetchDoctors();
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        const isPast = day < today;
        
        if (!isWeekend && !isPast) {
          availableDaysArray.push(day);
        }
      }
      
      setAvailableDays(availableDaysArray);
    }
  }, [selectedDoctor, currentMonth]);
  
  // Cargar los horarios disponibles cuando se selecciona una fecha
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (selectedDoctor && selectedDate) {
        try {
          setLoading(true);
          const dateStr = format(selectedDate, 'yyyy-MM-dd');
          const slotsData = await getAvailableSlotsForDate(selectedDoctor.id, dateStr);
          
          setAvailableSlots(slotsData);
          setLoading(false);
        } catch (error) {
          console.error('Error al cargar horarios disponibles:', error);
          setToast({
            message: 'Error al cargar horarios disponibles',
            type: 'error'
          });
          setLoading(false);
        }
      }
    };
    
    fetchAvailableSlots();
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
      
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(appointmentHour, 0, 0, 0);
      
      const appointmentData = {
        doctorId: selectedDoctor.id,
        patientId: user.patientProfile.id,
        date: appointmentDate.toISOString(),
        slotId: selectedSlot,
        notes: notes
      };
      
      const result = await createAppointment(appointmentData);
      
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
        setToast({
          message: result.error || 'Error al reservar cita',
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
    let firstDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (firstDayOfWeek < 0) firstDayOfWeek = 6; // Si es domingo (0), ajustar a 6
    
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const isPast = date < today;
      
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
    const slotIds = Object.keys(slots).sort();
    
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">
          Horarios disponibles para el {format(selectedDate, 'd MMMM yyyy', { locale: es })}
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {slotIds.map(slotId => {
            const slot = slots[slotId];
            const isAvailable = slot.available;
            const isSelected = selectedSlot === slotId;
            
            // No mostrar slots no configurados o no disponibles
            if (!slot.configuredByDoctor || slot.status !== 'available') {
              return null;
            }
            
            return (
              <button
                key={slotId}
                className={`p-3 rounded border ${
                  isSelected
                    ? 'bg-primary text-white border-primary'
                    : isAvailable
                      ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                      : 'bg-red-100 text-red-800 border-red-200 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (isAvailable) {
                    handleSlotSelect(slotId);
                  }
                }}
                disabled={!isAvailable}
              >
                {slot.hour}
              </button>
            );
          })}
          
          {slotIds.filter(slotId => {
            const slot = slots[slotId];
            return slot.configuredByDoctor && slot.status === 'available';
          }).length === 0 && (
            <div className="col-span-full text-center py-4 text-gray-500">
              No hay horarios disponibles para esta fecha
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
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
  );
};

export default PatientAppointmentBookingPage;
