import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center mb-4">
              <div className="bg-white text-blue-600 h-16 w-16 flex items-center justify-center rounded-full p-1">
                <span className="text-2xl font-bold">AP</span>
              </div>
              <span className="text-2xl font-bold ml-2">APSIV</span>
            </Link>
            <p className="text-gray-300 text-lg">
              APSIV, Atención Psicogeriátrica Virtual. Su función principal es la atención psicogeriátrica
              de tipo virtual, vía Zoom.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Enlaces</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white transition-colors text-lg">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/#about" className="text-gray-300 hover:text-white transition-colors text-lg">
                  Quienes Somos
                </Link>
              </li>
              <li>
                <Link to="/#services" className="text-gray-300 hover:text-white transition-colors text-lg">
                  Servicios
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors text-lg">
                  Registrarse
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-lg">
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:atencionpsicogeriatria@apsiv.cl" className="text-gray-300 hover:text-white break-all">
                  atencionpsicogeriatria@apsiv.cl
                </a>
              </li>
              <li className="flex items-start text-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-300">Consulta virtual vía Zoom</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} APSIV - Todos los derechos reservados
          </p>
          <p className="text-gray-500 mt-2 text-sm">
            Diseño Web: APSIV Team
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;