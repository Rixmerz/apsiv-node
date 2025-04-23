import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';

const AdminPatientsPage = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  
  // Get patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        // Replace with actual API endpoint
        const response = await axios.get('/api/admin/patients');
        setPatients(response.data.patients);
      } catch (error) {
        console.error('Error fetching patients:', error);
        setToast({
          message: 'Error al cargar los pacientes. Intente nuevamente.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, []);
  
  // For demo purposes, mock patient data
  useEffect(() => {
    // Mock data
    const mockPatients = [
      {
        id: 1,
        nombre: 'Juan',
        apellido: 'Pérez',
        rut: '12.345.678-9',
        email: 'juan.perez@ejemplo.com',
        telefono: '+56912345678',
        isapre: 'FONASA',
        fechaRegistro: '2023-05-15',
        ultimaConsulta: '2023-10-22'
      },
      {
        id: 2,
        nombre: 'María',
        apellido: 'González',
        rut: '9.876.543-2',
        email: 'maria.gonzalez@ejemplo.com',
        telefono: '+56987654321',
        isapre: 'Cruz Blanca',
        fechaRegistro: '2023-06-10',
        ultimaConsulta: '2023-11-05'
      },
      {
        id: 3,
        nombre: 'Carlos',
        apellido: 'López',
        rut: '15.678.901-3',
        email: 'carlos.lopez@ejemplo.com',
        telefono: '+56923456789',
        isapre: 'Banmédica',
        fechaRegistro: '2023-07-20',
        ultimaConsulta: null
      },
      {
        id: 4,
        nombre: 'Ana',
        apellido: 'Martínez',
        rut: '18.765.432-1',
        email: 'ana.martinez@ejemplo.com',
        telefono: '+56956789123',
        isapre: 'Colmena',
        fechaRegistro: '2023-08-05',
        ultimaConsulta: '2023-09-18'
      },
      {
        id: 5,
        nombre: 'Jorge',
        apellido: 'Sánchez',
        rut: '7.654.321-0',
        email: 'jorge.sanchez@ejemplo.com',
        telefono: '+56945678912',
        isapre: 'FONASA',
        fechaRegistro: '2023-04-12',
        ultimaConsulta: '2023-11-15'
      }
    ];
    
    setTimeout(() => {
      setPatients(mockPatients);
      setLoading(false);
    }, 1000);
  }, []);
  
  const openPatientDetails = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPatient(null);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const searchLower = searchTerm.toLowerCase();
    return (
      patient.nombre.toLowerCase().includes(searchLower) ||
      patient.apellido.toLowerCase().includes(searchLower) ||
      patient.rut.toLowerCase().includes(searchLower) ||
      patient.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-16 bg-light-dark">
        <div className="container-custom">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <h1 className="text-3xl font-bold mb-4 md:mb-0">Administración de Pacientes</h1>
              
              <div className="w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  className="input-field w-full md:w-80"
                  value={searchTerm}
                  onChange={handleSearchChange}
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
                      <th className="py-4 px-6 text-left text-lg font-semibold text-gray-700">Nombre</th>
                      <th className="py-4 px-6 text-left text-lg font-semibold text-gray-700">RUT</th>
                      <th className="py-4 px-6 text-left text-lg font-semibold text-gray-700">Email</th>
                      <th className="py-4 px-6 text-left text-lg font-semibold text-gray-700">Teléfono</th>
                      <th className="py-4 px-6 text-left text-lg font-semibold text-gray-700">ISAPRE</th>
                      <th className="py-4 px-6 text-left text-lg font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map(patient => (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="py-4 px-6 text-gray-700 text-lg">
                            {patient.nombre} {patient.apellido}
                          </td>
                          <td className="py-4 px-6 text-gray-700 text-lg">{patient.rut}</td>
                          <td className="py-4 px-6 text-gray-700 text-lg">{patient.email}</td>
                          <td className="py-4 px-6 text-gray-700 text-lg">{patient.telefono}</td>
                          <td className="py-4 px-6 text-gray-700 text-lg">{patient.isapre}</td>
                          <td className="py-4 px-6">
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => openPatientDetails(patient)}
                            >
                              Ver detalles
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-lg text-gray-500">
                          {searchTerm
                            ? "No se encontraron pacientes que coincidan con la búsqueda."
                            : "No hay pacientes registrados."}
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
      
      {/* Patient Details Modal */}
      {isModalOpen && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Detalles del Paciente</h2>
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
                  <h3 className="font-bold text-gray-700">Información Personal</h3>
                  <p className="mb-1"><span className="font-semibold">Nombre:</span> {selectedPatient.nombre} {selectedPatient.apellido}</p>
                  <p className="mb-1"><span className="font-semibold">RUT:</span> {selectedPatient.rut}</p>
                  <p className="mb-1"><span className="font-semibold">Email:</span> {selectedPatient.email}</p>
                  <p className="mb-1"><span className="font-semibold">Teléfono:</span> {selectedPatient.telefono}</p>
                  <p className="mb-1"><span className="font-semibold">ISAPRE:</span> {selectedPatient.isapre}</p>
                </div>
                
                <div>
                  <h3 className="font-bold text-gray-700">Datos de Registro</h3>
                  <p className="mb-1"><span className="font-semibold">Fecha de registro:</span> {selectedPatient.fechaRegistro}</p>
                  <p className="mb-1">
                    <span className="font-semibold">Última consulta:</span>{" "}
                    {selectedPatient.ultimaConsulta || "Sin consultas previas"}
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={closeModal}
                >
                  Cerrar
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    closeModal();
                    // Navigate to appointments page with patient filter
                    // navigate(`/admin/appointments?patient=${selectedPatient.id}`);
                  }}
                >
                  Ver Citas
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

export default AdminPatientsPage;