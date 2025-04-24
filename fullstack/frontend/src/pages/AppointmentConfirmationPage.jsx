import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';

const AppointmentConfirmationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Obtener los datos de la cita de sessionStorage
  const storedAppointmentDetails = sessionStorage.getItem('appointmentDetails');

  // Parsear los datos o usar datos de respaldo si no hay datos
  let appointmentDetails;
  try {
    if (storedAppointmentDetails) {
      appointmentDetails = JSON.parse(storedAppointmentDetails);
      // Convertir la fecha de string a objeto Date
      if (typeof appointmentDetails.date === 'string') {
        appointmentDetails.date = new Date(appointmentDetails.date);
      }
    } else {
      // Datos de respaldo si no hay datos en sessionStorage
      const today = new Date();
      today.setDate(today.getDate() + 2); // Cita en 2 días

      appointmentDetails = {
        date: today,
        timeSlot: '10:00 - 11:00',
        doctorName: 'Dr. Juan Pérez',
        patientName: user?.name || 'Paciente',
        patientEmail: user?.email || 'paciente@example.com',
        reason: 'Consulta médica',
        notes: ''
      };
    }
  } catch (error) {
    console.error('Error parsing appointment details:', error);
    // Datos de respaldo en caso de error
    const today = new Date();
    today.setDate(today.getDate() + 2); // Cita en 2 días

    appointmentDetails = {
      date: today,
      timeSlot: '10:00 - 11:00',
      doctorName: 'Dr. Juan Pérez',
      patientName: user?.name || 'Paciente',
      patientEmail: user?.email || 'paciente@example.com',
      reason: 'Consulta médica',
      notes: ''
    };
  }

  // Formatear la fecha para mostrar
  const formattedDate = appointmentDetails.date.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) + ' a las ' + appointmentDetails.timeSlot.split(' - ')[0];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-800">¡Cita Confirmada!</h1>
              <p className="text-gray-600 mt-2">Su cita médica ha sido agendada con éxito</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Detalles de la Cita</h2>

              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-gray-700">Fecha y Hora:</p>
                  <p className="capitalize text-gray-800">{formattedDate}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">Paciente:</p>
                  <p className="text-gray-800">{appointmentDetails.patientName}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">Email:</p>
                  <p className="text-gray-800">{appointmentDetails.patientEmail}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">Doctor:</p>
                  <p className="text-gray-800">{appointmentDetails.doctorName}</p>
                </div>

                <div>
                  <p className="font-semibold text-gray-700">Motivo de la consulta:</p>
                  <p className="text-gray-800">{appointmentDetails.reason}</p>
                </div>

                {appointmentDetails.notes && (
                  <div>
                    <p className="font-semibold text-gray-700">Notas adicionales:</p>
                    <p className="text-gray-800 whitespace-pre-line">{appointmentDetails.notes}</p>
                  </div>
                )}

                <div>
                  <p className="font-semibold text-gray-700">Estado:</p>
                  <p className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium">
                    Agendada
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-8 border-l-4 border-blue-500">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800">
                    Recibirá un recordatorio por correo electrónico 24 horas antes de su cita.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <Button
                variant="outline"
                size="large"
                onClick={() => navigate('/')}
              >
                Volver al Inicio
              </Button>

              <Button
                variant="primary"
                size="large"
                onClick={() => window.print()}
              >
                Imprimir Comprobante
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AppointmentConfirmationPage;
