const Services = () => {
    const services = [
      {
        title: "Consulta Psicogeriátrica Online",
        description: "Evaluamos y tratamos trastornos mentales de adultos mayores a través de consultas virtuales."
      },
      {
        title: "Evaluación Psicogeriátrica Integral",
        description: "Una visión completa de la salud mental del adulto mayor, considerando aspectos médicos, psicológicos y sociales."
      },
      {
        title: "Plan de tratamiento Psicogeriátrico",
        description: "Creación de un plan personalizado para abordar las necesidades específicas de cada paciente."
      },
      {
        title: "Control de tratamiento medicamentoso",
        description: "Seguimiento y ajuste de la medicación para garantizar los mejores resultados y minimizar efectos adversos."
      },
      {
        title: "Revisión de exámenes",
        description: "Análisis de resultados de laboratorio e imágenes para un diagnóstico preciso y seguimiento adecuado."
      },
      {
        title: "Evaluación del estado mental",
        description: "Valoración completa de las funciones cognitivas y el estado emocional del paciente mayor."
      }
    ];

    return (
      <section id="services" className="py-20 bg-gray-100">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-blue-600 mb-4">Nuestros Servicios</h2>
            <div className="h-1 w-24 bg-green-600 mx-auto mb-6"></div>
            <p className="text-xl max-w-3xl mx-auto">
              <strong>Profesional encargado: Dr. Friedrich von Mühlenbrock S.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="card hover:shadow-xl transition-shadow duration-300">
                <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-700 text-lg">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 card">
            <h3 className="text-xl font-bold mb-4">Servicios adicionales:</h3>
            <ul className="space-y-4 text-lg">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Dirección de equipos de evaluación inter o trans disciplinaria en Psicogeriatría.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Promoción y prevención de compromiso de capacidades físicas o funcionales.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Estimulación de la rehabilitación y reinserción familiar o social de pacientes con trastornos físicos o mentales.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Coordinación del equipo encargado del Cuidado del Cuidador.</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Trabajo en equipo para mejorar el cuidado y tratamiento de las Personas Mayores con trastornos psíquicos o mentales.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    );
  };

  export default Services;