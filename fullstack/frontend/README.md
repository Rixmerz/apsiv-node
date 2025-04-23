# APSIV - Atención Psicogeriátrica Virtual

Sistema de gestión para consultas psicogeriátricas virtuales desarrollado con React, Vite, Tailwind CSS y próximamente Node.js con Express y Prisma.

## Características

- Página informativa sobre los servicios médicos
- Sistema de registro y autenticación de pacientes
- Módulo de agendamiento de citas online
- Panel administrativo para gestión de pacientes y citas
- Diseño accesible y amigable para adultos mayores

## Tecnologías Utilizadas

- **Frontend**:
  - React (con hooks y context API)
  - Vite (para build y desarrollo)
  - Tailwind CSS (para estilos)
  - React Router (para navegación)
  - Axios (para peticiones HTTP)
  - Date-fns (para manejo de fechas)

- **Backend** (próximamente):
  - Node.js
  - Express
  - Prisma ORM
  - MySQL

## Requisitos Previos

- Node.js (v16.0.0 o superior)
- NPM (v8.0.0 o superior)

## Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/tuusuario/apsiv-app.git
   cd apsiv-app
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Ejecuta la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```

4. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Modo Desarrollo (Datos de Prueba)

Para acceder al sistema sin backend, puedes usar las siguientes credenciales:

### Usuario normal:
- Email: usuario@ejemplo.com
- Contraseña: usuario123

### Usuario administrador:
- Email: admin@apsiv.cl  
- Contraseña: admin123

## Estructura del Proyecto

```
frontend/
├── public/             # Archivos públicos
├── src/
│   ├── assets/         # Imágenes y otros recursos
│   ├── components/     # Componentes React reutilizables
│   ├── context/        # Context API para estado global
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Páginas principales
│   ├── utils/          # Funciones de utilidad
│   ├── App.jsx         # Componente principal y rutas
│   └── main.jsx        # Punto de entrada
├── .eslintrc.js        # Configuración de ESLint
├── package.json        # Dependencias y scripts
├── tailwind.config.js  # Configuración de Tailwind CSS
└── vite.config.js      # Configuración de Vite
```

## Próximos Pasos

- Implementación del backend con Node.js, Express y Prisma
- Integración con API de Zoom para consultas virtuales
- Sistema de notificaciones por correo electrónico
- Implementación de pruebas unitarias y de integración

## Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o una pull request para sugerir cambios o mejoras.

## Licencia

Este proyecto está bajo la Licencia MIT.