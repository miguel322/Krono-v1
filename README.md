# Krono: Plataforma de Gestión de Asistencia y Turnos sin Hardware

**Krono** es una plataforma web empresarial de grado productivo para la gestión inteligente de personal, control de asistencia en tiempo real, programación de turnos y reserva de espacios corporativos. Su propuesta de valor principal es operar **completamente sin terminales físicos ni hardware dedicado**, utilizando en su lugar geolocalización avanzada por GPS, emparejamiento por SSID/BSSID de redes Wi-Fi, códigos QR dinámicos (TOTP), huellas de dispositivo y verificación biométrica local del smartphone.

---

## 🚀 Características Clave

*   **Panel General (Dashboard):** Métricas operativas críticas en tiempo real (empleados presentes, tardíos, ausentes, en descanso, solicitudes ESS pendientes, incidentes activos, precisión promedio de GPS y estatus de sincronización local/servidor).
*   **Monitoreo en Tiempo Real (Live Attendance):** Registro dinámico de actividades con marcas de geocercas, red Wi-Fi detectada, fingerprint de dispositivo (sistema operativo, navegador) y estado de verificación biométrica.
*   **Terminal de Marcaje Digital (Digital Clock-In):** Simulador de quiosco interactivo que emula el marcaje del empleado a través de códigos QR dinámicos (TOTP), validación de GPS, reconocimiento facial local y cola de sincronización fuera de línea (Offline-Sync Queue).
*   **Gestión Avanzada de Turnos y Calendarios (Shifts & Calendars):** Catálogo de horarios flexibles, fijos, nocturnos cruzados y guardias extensas. Definición de ciclos rotativos y asignación permanente o temporal por empleado/departamento con resolución de conflictos.
*   **Algoritmo de Autoprogramación (AutoScheduler):** Motor inteligente integrado que genera cuadrantes de forma automatizada respetando los descansos obligatorios de 12 horas entre jornadas, colisiones de turnos nocturnos contiguos y leyes laborales.
*   **Control de Incidencias:** Motor de excepciones en tiempo real que alerta sobre retardos, salidas tempranas, ausencias sin justificar o registros huérfanos con gestión de SLAs y escalado de flujos.
*   **Pre-Nómina y Horas Extras:** Cálculo automatizado de horas ordinarias y extras (1.5x, 2.0x, 1.75x feriado) con validación de umbrales y exportación.
*   **Autoservicio del Empleado (ESS Requests):** Permite a los colaboradores solicitar correcciones de marcaje, ingresos retroactivos, justificar ausencias con adjuntos (PDF/JPG) e intercambiar turnos entre pares.
*   **Control de Visitantes:** Generación de invitaciones QR con geocercas para accesos temporales y alertas inmediatas al anfitrión.
*   **Reserva de Salas de Reunión:** Programación visual de espacios de trabajo integrados con sensores simulados de presencia IoT y cancelación automática por incomparecencia (no-show) tras 10 minutos.
*   **Pistas de Auditoría Criptográficas (Audit Trail):** Registro inmutable de eventos administrativos con firma criptográfica SHA-256 para prevenir manipulaciones.

---

## 🛠️ Stack Tecnológico

El proyecto está construido bajo una arquitectura cliente moderna, rápida y responsiva:

*   **Framework Core:** [React 19](https://react.dev/) (usando hooks avanzados y arquitectura de estado centralizado).
*   **Empaquetador y Dev Server:** [Vite v8](https://vite.dev/) (compilación ultra rápida y Hot Module Replacement).
*   **Estilos y UI:** [Tailwind CSS v4](https://tailwindcss.com/) (mediante el plugin nativo `@tailwindcss/vite` para utilidades de diseño modernas y responsivas).
*   **Iconografía:** [Lucide React](https://lucide.dev/) (set de iconos vectoriales limpios y consistentes).

---

## 📂 Estructura del Proyecto

```bash
Krono/
├── dist/                  # Distribución construida para producción
├── public/                # Recursos públicos estáticos
├── src/
│   ├── assets/            # Imágenes, logotipos y recursos globales
│   ├── components/        # Componentes/Módulos de la UI del sistema
│   │   ├── AuditTrail.jsx        # Pistas de auditoría criptográficas
│   │   ├── Dashboard.jsx         # Panel de control ejecutivo y KPIs
│   │   ├── DigitalClockIn.jsx    # Terminal/Simulador de marcaje
│   │   ├── EssRequests.jsx       # Autoservicio de solicitudes y flujo RRHH
│   │   ├── Incidents.jsx         # Alertas y excepciones de asistencia
│   │   ├── LiveAttendance.jsx    # Monitoreo en tiempo real de registros
│   │   ├── MeetingRooms.jsx      # Reserva inteligente de salas e IoT
│   │   ├── Organization.jsx      # Organigrama, geocercas y redes Wi-Fi
│   │   ├── PayrollOvertime.jsx   # Reportes de horas extras y pre-nómina
│   │   ├── Settings.jsx          # Ajustes globales de seguridad y límites
│   │   ├── ShiftsCalendars.jsx   # [COMPLEJO] Control de horarios y turnos
│   │   └── Visitors.jsx          # Gestión y accesos de visitantes
│   ├── App.css            # Estilos CSS específicos de la aplicación
│   ├── App.jsx            # Punto de entrada y controlador del estado global
│   ├── index.css          # Directivas globales de Tailwind CSS
│   ├── main.jsx           # Renderizador del árbol de React
│   └── mockData.js        # Base de datos simulada y estados iniciales
├── index.html             # Estructura HTML base con metadatos SEO
├── KRONO_Prototipo.html   # Prototipo autocontenido compilado (Single-file)
├── package.json           # Dependencias y scripts de ejecución
└── vite.config.js         # Configuración del compilador Vite
```

---

## 💻 Instalación y Uso

### Prerrequisitos

Asegúrate de tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior recomendada).

### 1. Clonar e Instalar Dependencias

Navega a la carpeta raíz del proyecto e instala las dependencias necesarias:

```bash
npm install
```

### 2. Ejecutar en Modo Desarrollo

Inicia el servidor local de desarrollo de Vite con recarga rápida en tiempo real:

```bash
npm run dev
```

El servidor se abrirá por defecto en `http://localhost:5173`. Abre esa URL en tu navegador para ver la plataforma.

### 3. Compilar para Producción

Para generar los archivos optimizados y listos para distribución:

```bash
npm run build
```

Esto generará la carpeta `dist/` con todo el código compilado y optimizado.

---

## 📘 Más Información de Módulos

Para comprender a fondo la arquitectura, el flujo de datos global de la aplicación y el funcionamiento del **Módulo de Turnos y Calendarios (el más complejo del sistema)**, consulta el manual de módulos:

👉 **[Documento de Módulos e Ingeniería (MODULES.md)](file:///c:/Projects/Krono/MODULES.md)**
