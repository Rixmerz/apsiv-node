const About = () => {
    return (
      <section id="about" className="py-20 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <h2 className="text-3xl font-bold text-blue-600 mb-4">
                Dr. Friedrich von Mühlenbrock S.
              </h2>

              <div className="h-1 w-24 bg-green-600 mb-6"></div>

              <ul className="space-y-4 text-lg">
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Estudia Medicina en la Universidad Católica de Chile, recibiendo certificado de Médico Cirujano, con distinción máxima.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Becado de especialista en medicina Interna en el Hospital J. J. Aguirre de la Universidad de Chile.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Becado en Psiquiatría del proyecto de formación de especialistas de CODELCO Chile en Clínica Psiquiátrica de la Universidad de Chile.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Socio fundador de la Sociedad de Geriatría y Gerontología de Chile.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Socio fundador de la Sociedad Chilena de Psicogeriatría (SOCHIPSI) y primer presidente.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Profesor por doce años del módulo de Psicogeriatría del Diplomado de Geriatría de la Universidad de Concepción.</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span>Presidente en ejercicio de la Sociedad Chilena de Psicogeriatría (SOCHIPSI).</span>
                </li>
              </ul>
            </div>

            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-lg transform translate-x-6 translate-y-6"></div>
                <div
                  className="relative z-10 rounded-lg shadow-lg w-full max-w-md h-64 bg-gray-300 flex items-center justify-center"
                >
                  <span className="text-xl font-bold text-gray-600">Foto del Doctor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  export default About;