import { Link } from 'react-router-dom';
import Button from '../common/Button';

const Hero = () => {
  return (
    <section
      className="relative py-20 md:py-32 bg-blue-600"
    >
      <div className="container-custom text-center">
        <h1 className="text-white font-extrabold mb-6 uppercase tracking-wide">
          APSIV, Atención Psicogeriátrica Virtual
        </h1>

        <p className="text-white text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
          SU FUNCIÓN PRINCIPAL ES LA ATENCIÓN PSICOGERIATRICA DE TIPO VIRTUAL, VÍA ZOOM
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/register">
            <Button
              variant="primary"
              size="large"
              className="w-full sm:w-auto"
            >
              Solicitar Consulta
            </Button>
          </Link>

          <a href="#contact">
            <Button
              variant="secondary"
              size="large"
              className="w-full sm:w-auto"
            >
              Contáctenos
            </Button>
          </a>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg className="relative block w-full h-[60px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="#ffffff" opacity=".7"></path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;