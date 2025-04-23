const Patients = () => {
    return (
      <section className="py-20 bg-gray-100">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-2">
              <h2 className="text-3xl font-bold text-blue-600 mb-4">
                Nuestros Pacientes
              </h2>

              <div className="h-1 w-24 bg-green-600 mb-6"></div>

              <div className="text-lg">
                <p className="mb-4">
                  <strong>Personas Mayores (PM.) de 60 años, Portadoras de:</strong>
                </p>

                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-bold mr-3">
                      a
                    </span>
                    <span>Trastornos del ánimo (ex -depresión)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-bold mr-3">
                      b
                    </span>
                    <span>Trastornos de Ansiedad</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-bold mr-3">
                      c
                    </span>
                    <span>Trastornos del sueño</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-bold mr-3">
                      d
                    </span>
                    <span>Compromiso de la memoria</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-bold mr-3">
                      e
                    </span>
                    <span>Abuso de medicamentos o sustancias (alcohol)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white font-bold mr-3">
                      f
                    </span>
                    <span>Polifarmacia o polimedicación</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="order-1 md:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-lg transform translate-x-6 translate-y-6"></div>
                <div
                  className="relative z-10 rounded-lg shadow-lg w-full max-w-md h-64 bg-gray-300 flex items-center justify-center"
                >
                  <span className="text-xl font-bold text-gray-600">Foto de Pacientes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  export default Patients;