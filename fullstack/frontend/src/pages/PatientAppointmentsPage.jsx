import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';
import { getPatientAppointments, cancelAppointment } from '../services/appointmentService';
import Spinner from '../components/common/Spinner';
import Toast from '../components/common/Toast';

const PatientAppointmentsPage = () => {
  const { user } = useAuth();

  // Estados
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [toast, setToast] = useState(null);

  // Cargar las citas del paciente al montar el componente
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user || !user.patientProfile) {
        setToast({
          message: 'No se encontró el perfil de paciente',
          type: 'error'
        });
        return;
      }

      try {
        setLoading(true);
        const appointmentsData = await getPatientAppointments(user.patientProfile.id);
        setAppointments(appointmentsData);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar citas:', error);
        setToast({
          message: 'Error al cargar las citas',
          type: 'error'
        });
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  // Cancelar una cita
  const handleCancelAppointment = async (appointmentId) => {
    if (!confirm('¿Está seguro de que desea cancelar esta cita?')) {
      return;
    }

    try {
      setLoading(true);
      await cancelAppointment(appointmentId);

      // Actualizar la lista de citas
      const updatedAppointments = appointments.filter(
        appointment => appointment.id !== appointmentId
      );
      setAppointments(updatedAppointments);

      setToast({
        message: 'Cita cancelada con éxito',
        type: 'success'
      });

      setLoading(false);
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      setToast({
        message: 'Error al cancelar la cita',
        type: 'error'
      });
      setLoading(false);
    }
  };

  // Agrupar citas por fecha
  const groupAppointmentsByDate = () => {
    const grouped = {};

    appointments.forEach(appointment => {
      const date = format(new Date(appointment.date), 'yyyy-MM-dd');

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push(appointment);
    });

    // Ordenar las fechas
    return Object.keys(grouped)
      .sort()
      .map(date => ({
        date,
        appointments: grouped[date].sort((a, b) => new Date(a.date) - new Date(b.date))
      }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mis Citas</h1>
        <Link
          to="/patient/book-appointment"
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
        >
          Reservar Nueva Cita
        </Link>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {loading ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tiene citas programadas</p>
              <Link
                to="/patient/book-appointment"
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
              >
                Reservar Cita
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {groupAppointmentsByDate().map(group => (
                <div key={group.date}>
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                    {format(parseISO(group.date), 'EEEE d MMMM yyyy', { locale: es })}
                  </h2>

                  <div className="space-y-4">
                    {group.appointments.map(appointment => (
                      <div
                        key={appointment.id}
                        className="border rounded-lg p-4 hover:border-primary transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-lg">
                              {format(new Date(appointment.date), 'HH:mm')} - Dr. {appointment.doctor.user.name}
                            </p>
                            <p className="text-gray-600">{appointment.doctor.specialty}</p>

                            {appointment.notes && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-500">Notas:</p>
                                <p className="text-sm">{appointment.notes}</p>
                              </div>
                            )}
                          </div>

                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleCancelAppointment(appointment.id)}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientAppointmentsPage;
