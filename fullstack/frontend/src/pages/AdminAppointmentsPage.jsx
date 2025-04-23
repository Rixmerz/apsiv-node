import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';

const AdminAppointmentsPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromUrl = queryParams.get('patient');
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [toast, setToast] = useState(null);
  
  // Get appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // Replace with actual API endpoint
        let url = '/api/admin/appointments';
        
        if (patientIdFromUrl) {
          url += `?patientId=${patientIdFromUrl}`;
        }
        
        const response = await axios.get(url);
        setAppointments(response.data.appointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setToast({
          message: 'Error al cargar las citas. Intente nuevamente.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [patientIdFromUrl]);
  
  // For demo purposes, mock appointment data
  useEffect(() => {
    // Mock data with status: 'scheduled', 'completed', 'cancelled'
    const mockAppointments = [
      {
        id: 1,
        patientId: 1,
        patientName: 'Juan Pérez',
        patientRut: '12.345.678-9',
        date: '2024-04-25',
        startTime: '09:00',
        endTime: '10:00',
        status: 'scheduled',
        reason: 'Control de tratamiento',
        notes: 'Paciente requiere evaluación del tratamiento iniciado hace 1 mes'
      },
      {
        id: 2,
        patientId: 2,
        patientName: 'María González',
        patientRut: '9.876.543-2',
        date: '2024-04-26',
        startTime: '11:00',
        endTime: '12:00',
        status: 'scheduled',
        reason: 'Trastornos del sueño',
        notes: 'Problemas para conciliar el sueño en las últimas semanas'
      },
      {
        id: 3,
        patientId: 3,
        patientName: 'Carlos López',
        patientRut: '15.678.901-3',
        date: '2024-04-20',
        startTime: '15:00',
        endTime: '16:00',
        status: 'completed',
        reason: 'Primera consulta',
        notes: 'Evaluación inicial del paciente'
      },
      {
        id: 4,
        patientId: 4,
        patientName: 'Ana Martínez',
        patientRut: '18.765.432-1',
        date: '2024-04-18',
        startTime: '10:00',
        endTime: '11:00',
        status: 'cancelled',
        reason: 'Trastornos de ansiedad',
        notes: 'Cancelada por el paciente por motivos personales'
      },
      {
        id: 5,
        patientId: 5,
        patientName: 'Jorge Sánchez',
        patientRut: '7.654.321-0',
        date: '2024-04-30',
        startTime: '14:00',
        endTime: '15:00',
        status: 'scheduled',
        reason: 'Problemas de memoria',
        notes: 'Evaluación de pérdida de memoria reciente'
      }
    ];
    
    // If patientIdFromUrl is present, filter the mock data
    const filteredAppointments = patientIdFromUrl
      ? mockAppointments.filter(app => app.patientId === parseInt(patientIdFromUrl))
      : mockAppointments;
    
    setTimeout(() => {
      setAppointments(filteredAppointments);
      setLoading(false);
    }, 1000);
  }, [patientIdFromUrl]);
  
  const openAppointmentDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterStatusChange = (e) => {
    setFilterStatus(e.target.value);
  };
  
  const handleFilterDateChange = (e) => {
    setFilterDate(e.target.value);
  };
  
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      // In a real app, this would make an API call to update the status
      setLoading(true);
      
      // Mock API call
      // await axios.patch(`/api/admin/appointments/${appointmentId}`, { status: newStatus });
      
      // Update the local state
      setAppointments(prevAppointments => 
        prevAppointments.map(app => 
          app.id === appointmentId ? { ...app, status: newStatus } : app
        )
      );
      
      setToast({
        message: 'Estado de la cita actualizado correctamente',
        type: 'success'
      });
      
      // If we're in the modal, update the selected appointment too
      if (selectedAppointment && selectedAppointment.id === appointmentId) {
        setSelectedAppointment(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setToast({
        message: 'Error al actualizar el estado de la cita',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM 'de' yyyy", { locale: es });
  };
  
  // Filter appointments based on search term, status, and date
  const filteredAppointments = appointments.filter(appointment => {
    // Search term filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      appointment.patientName.toLowerCase().includes(searchLower) ||
      appointment.patientRut.toLowerCase().includes(searchLower) ||
      appointment.reason.toLowerCase().includes(searchLower);
    
    // Status filter
    const matchesStatus = 
      filterStatus === 'all' || 
      appointment.status === filterStatus;
    
    // Date filter
    const matchesDate = 
      !filterDate || 
      appointment.date === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });
  
  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'scheduled':
        return 'Agendada';
      case 'completed':
        return 'Completada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-16 bg-light-dark">
        <div className="container-custom">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h1 className="text-3xl font-bold mb-8">Administración de Citas</h1>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar paciente
                </label>
                <input
                  type="text"
                  id="search"
                  placeholder="Nombre, RUT o motivo..."
                  className="input-field w-full"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="statusFilter"
                  className="input-field w-full"
                  value={filterStatus}
                  onChange={handleFilterStatusChange}
                >
                  <option value="all">Todos los estados</option>
                  <option value="scheduled">Agendadas</option>
                  <option value="completed">Completadas</option>
                  <option value="cancelled">Canceladas</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  id="dateFilter"
                  className="input-field w-full"
                  value={filterDate}
                  onChange={handleFilterDateChange}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-4 px-6 text-left text-lg font-semibold text-gray-700">Paciente</th>
                      <th className="py-4 px-6 text-left text-lg font-semibold text-gray-700">Fecha y Hora</th>
                      <th className="py-4 px-6 text-left text-lg font-semibold text-gray-700">Motivo</th>
                      <th className="py-4 px-6 text-left text-lg font-semibold text-gray-700">Estado</th>
                      <th className="py-4 px-6 text-left text-lg font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map(appointment => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6 text-gray-700 text-lg">
                            <div>{appointment.patientName}</div>
                            <div className="text-sm text-gray-500">{appointment.patientRut}</div>
                          </td>
                          <td className="py-4 px-6 text-gray-700 text-lg">
                            <div>{formatDate(appointment.date)}</div>
                            <div className="text-sm text-gray-500">
                              {appointment.startTime} - {appointment.endTime}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-700 text-lg">
                            {appointment.reason}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(appointment.status)}`}>
                              {getStatusLabel(appointment.status)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <Button
                              variant="primary"
                              size="small"
                              className="mr-2"
                              onClick={() => openAppointmentDetails(appointment)}
                            >
                              Ver detalles
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-lg text-gray-500">
                          No se encontraron citas que coincidan con los filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Appointment Details Modal */}
      {isModalOpen && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Detalles de la Cita</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg mb-6">
                <div>
                  <h3 className="font-bold text-gray-700">Información del Paciente</h3>
                  <p className="mb-1"><span className="font-semibold">Nombre:</span> {selectedAppointment.patientName}</p>
                  <p className="mb-1"><span className="font-semibold">RUT:</span> {selectedAppointment.patientRut}</p>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-700">Detalles de la Cita</h3>
                  <p className="mb-1"><span className="font-semibold">Fecha:</span> {formatDate(selectedAppointment.date)}</p>
                  <p className="mb-1">
                    <span className="font-semibold">Horario:</span> {selectedAppointment.startTime} - {selectedAppointment.endTime}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">Estado:</span>{" "}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-medium ${getStatusBadgeColor(selectedAppointment.status)}`}>
                      {getStatusLabel(selectedAppointment.status)}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold text-gray-700 mb-2">Motivo de consulta</h3>
                <p className="text-lg">{selectedAppointment.reason}</p>
              </div>
              
              {selectedAppointment.notes && (
                <div className="mb-6">
                  <h3 className="font-bold text-gray-700 mb-2">Notas adicionales</h3>
                  <p className="text-lg">{selectedAppointment.notes}</p>
                </div>
              )}
              
              <div className="mt-8">
                <h3 className="font-bold text-gray-700 mb-4">Cambiar estado de la cita</h3>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedAppointment.status === 'scheduled' ? 'primary' : 'outline'}
                    size="small"
                    onClick={() => handleStatusChange(selectedAppointment.id, 'scheduled')}
                    disabled={selectedAppointment.status === 'scheduled'}
                  >
                    Agendada
                  </Button>
                  
                  <Button
                    variant={selectedAppointment.status === 'completed' ? 'primary' : 'outline'}
                    size="small"
                    onClick={() => handleStatusChange(selectedAppointment.id, 'completed')}
                    disabled={selectedAppointment.status === 'completed'}
                  >
                    Completada
                  </Button>
                  
                  <Button
                    variant={selectedAppointment.status === 'cancelled' ? 'primary' : 'outline'}
                    size="small"
                    onClick={() => handleStatusChange(selectedAppointment.id, 'cancelled')}
                    disabled={selectedAppointment.status === 'cancelled'}
                  >
                    Cancelada
                  </Button>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button
                  variant="outline"
                  onClick={closeModal}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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

export default AdminAppointmentsPage;