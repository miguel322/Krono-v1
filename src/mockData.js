// KRONO Configuración de Base de Datos Simulada e Estado Inicial

export const initialEmployees = [
  {
    id: "EMP-001",
    name: "Juan Pérez",
    role: "Especialista Principal de Operaciones",
    department: "Operaciones",
    shift: "Turno Diurno (08:00 - 17:00)",
    checkIn: "08:02:14",
    checkOut: "--:--:--",
    method: "TOTP-QR (Dinámico)",
    location: "Edificio C - Puerta Principal 2",
    accuracy: "4.2m",
    status: "PRESENTE",
    gpsDistance: 8.5, // metros al centro del edificio
    deviceFingerprint: "iPhone14,2 (iOS 16.5; Safari/604.1)",
    biometricVerified: true,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
    timeline: [
      { time: "08:00:00", event: "Inicio Esperado del Turno por Sistema", type: "system" },
      { time: "08:02:14", event: "Entrada registrada mediante TOTP-QR (Clave Válida)", type: "clockin", details: "Precisión GPS: 4.2m | Dispositivo: iOS | Coincidencia de BSSID WiFi" },
    ],
    adjustments: []
  },
  {
    id: "EMP-002",
    name: "María Gómez",
    role: "Oficial de Seguridad",
    department: "Operaciones",
    shift: "Turno Diurno (08:00 - 17:00)",
    checkIn: "07:56:40",
    checkOut: "--:--:--",
    method: "Presencia Zero-Touch",
    location: "Edificio A - Perímetro Sur",
    accuracy: "11.1m",
    status: "PRESENTE",
    gpsDistance: 12.3,
    deviceFingerprint: "Samsung SM-G998B (Android 13; Chrome/114)",
    biometricVerified: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    timeline: [
      { time: "07:56:40", event: "Marcaje automático Zero-Touch activado", type: "system", details: "SSID: KronoCorp_Secure | Geocerca: OK (12.3m) | FaceID Local: OK" },
    ],
    adjustments: []
  },
  {
    id: "EMP-003",
    name: "Carlos Díaz",
    role: "Administrador de Base de Datos",
    department: "TI y Sistemas",
    shift: "Turno Estándar (09:00 - 18:00)",
    checkIn: "09:05:12",
    checkOut: "--:--:--",
    method: "--",
    location: "--",
    accuracy: "--",
    status: "TARDE",
    gpsDistance: null,
    deviceFingerprint: "OnePlus NE2213 (Android 12)",
    biometricVerified: false,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
    timeline: [
      { time: "09:00:00", event: "Inicio Esperado del Turno por Sistema", type: "system" },
      { time: "09:05:12", event: "Entrada Tardía Registrada (Margen de tolerancia: 10m permitido)", type: "clockin", details: "Sin salida activa" }
    ],
    adjustments: []
  },
  {
    id: "EMP-004",
    name: "Sofía Rodríguez",
    role: "Gerente de Adquisición de Talento",
    department: "Recursos Humanos",
    shift: "Turno Estándar (09:00 - 18:00)",
    checkIn: "08:52:10",
    checkOut: "18:05:11",
    method: "TOTP-QR (Dinámico)",
    location: "Oficinas Centrales - Piso 4",
    accuracy: "6.8m",
    status: "PRESENTE",
    gpsDistance: 4.1,
    deviceFingerprint: "iPhone13,4 (iOS 15.2; Safari/604.1)",
    biometricVerified: true,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    timeline: [
      { time: "08:52:10", event: "Entrada registrada mediante TOTP-QR", type: "clockin" },
      { time: "18:05:11", event: "Salida registrada mediante TOTP-QR", type: "clockout" }
    ],
    adjustments: []
  },
  {
    id: "EMP-005",
    name: "Alejandro Ruiz",
    role: "Líder de Turno de Producción",
    department: "Operaciones",
    shift: "Turno Nocturno (22:00 - 06:00)",
    checkIn: "21:54:10",
    checkOut: "06:03:15",
    method: "Presencia Zero-Touch",
    location: "Plataforma de Carga Delta",
    accuracy: "14.2m",
    status: "FERIADO_TRABAJADO",
    gpsDistance: 13.9,
    deviceFingerprint: "Xiaomi M2102J20SG (Android 11)",
    biometricVerified: true,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80",
    timeline: [
      { time: "21:54:10", event: "Entrada vinculada a jornada nocturna cruzada", type: "clockin" },
      { time: "06:03:15", event: "Salida de jornada nocturna completada", type: "clockout" }
    ],
    adjustments: [
      { timestamp: "2026-06-25 22:10:00", actor: "Daemon del Sistema", action: "Aplicación de Regla Automática", detail: "Asignado FERIADO_TRABAJADO (factor salarial 1.75x) debido al calendario oficial local" }
    ]
  },
  {
    id: "EMP-006",
    name: "Camila Silva",
    role: "Agente de Soporte al Cliente",
    department: "Experiencia del Cliente",
    shift: "Turno Estándar (09:00 - 18:00)",
    checkIn: "08:58:30",
    checkOut: "--:--:--",
    method: "TOTP-QR (Dinámico)",
    location: "Oficinas Centrales - Piso 2",
    accuracy: "7.1m",
    status: "EN_DESCANSO",
    gpsDistance: 5.5,
    deviceFingerprint: "iPhone15,1 (iOS 17.1)",
    biometricVerified: true,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80",
    timeline: [
      { time: "08:58:30", event: "Entrada registrada mediante TOTP-QR", type: "clockin" },
      { time: "12:30:00", event: "Salida a hora de almuerzo / descanso", type: "break-start" }
    ],
    adjustments: []
  },
  {
    id: "EMP-007",
    name: "Roberto Méndez",
    role: "Supervisor de Almacén",
    department: "Logística",
    shift: "Turno Diurno (08:00 - 17:00)",
    checkIn: "--:--:--",
    checkOut: "--:--:--",
    method: "--",
    location: "--",
    accuracy: "--",
    status: "AUSENTE",
    gpsDistance: null,
    deviceFingerprint: "--",
    biometricVerified: false,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
    timeline: [
      { time: "08:30:00", event: "No se detectó entrada. Límite de ausencia superado (umbral de 30m)", type: "system-alarm" }
    ],
    adjustments: []
  },
  {
    id: "EMP-008",
    name: "Lucía Fernández",
    role: "Ingeniera DevOps",
    department: "TI y Sistemas",
    shift: "Turno Estándar (09:00 - 18:00)",
    checkIn: "09:02:11",
    checkOut: "--:--:--",
    method: "TOTP-QR (Dinámico)",
    location: "Edificio C - Nodo Tecnológico",
    accuracy: "3.5m",
    status: "SIN_SALIDA",
    gpsDistance: 2.1,
    deviceFingerprint: "iPhone12,8 (iOS 15.0)",
    biometricVerified: true,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80",
    timeline: [
      { time: "09:02:11", event: "Entrada registrada mediante TOTP-QR", type: "clockin" },
      { time: "22:00:00", event: "Límite superado (Duración del turno + 4h). Alerta automática SIN_SALIDA", type: "system-alarm" }
    ],
    adjustments: []
  }
];

export const initialIncidents = [
  {
    id: "INC-901",
    caseName: "Entrada Tardía - Carlos Díaz",
    employee: "Carlos Díaz",
    department: "TI y Sistemas",
    type: "TARDE",
    severity: "INFO",
    slaRemaining: 18, // horas restantes para resolver
    owner: "Supervisor Alfa",
    status: "PENDIENTE"
  },
  {
    id: "INC-902",
    caseName: "Ausencia Injustificada - Roberto Méndez",
    employee: "Roberto Méndez",
    department: "Logistics",
    type: "AUSENTE",
    severity: "WARNING",
    slaRemaining: 4,
    owner: "Supervisor Logística",
    status: "PENDIENTE"
  },
  {
    id: "INC-903",
    caseName: "Sin Registro de Salida - Lucía Fernández",
    employee: "Lucía Fernández",
    department: "TI y Sistemas",
    type: "SIN_SALIDA",
    severity: "CRITICAL",
    slaRemaining: 2,
    owner: "Supervisor Alfa",
    status: "PENDING"
  },
  {
    id: "INC-904",
    caseName: "SLA Vencido: Escalado a RRHH",
    employee: "Roberto Méndez",
    department: "Logística",
    type: "ESCALADO",
    severity: "CRITICAL",
    slaRemaining: 0,
    owner: "Mesa RRHH Corporativo",
    status: "ESCALADO"
  }
];

export const initialShifts = {
  patterns: [
    {
      id: "PAT-001",
      name: "Rotativo Cíclico Operaciones 4x2",
      anchorDate: "2026-07-01",
      pattern: "4x2", // 4 trabajados, 2 libres
      startTime: "08:00",
      endTime: "17:00",
      department: "Operaciones",
      employees: ["Juan Pérez", "María Gómez"]
    },
    {
      id: "PAT-002",
      name: "Rotativo Logística 5x2",
      anchorDate: "2026-06-25",
      pattern: "5x2",
      startTime: "09:00",
      endTime: "18:00",
      department: "Logística",
      employees: ["Roberto Méndez"]
    },
    {
      id: "PAT-003",
      name: "Soporte Técnico TI 6x1",
      anchorDate: "2026-07-01",
      pattern: "6x1",
      startTime: "09:00",
      endTime: "18:00",
      department: "TI y Sistemas",
      employees: ["Carlos Díaz", "Lucía Fernández"]
    }
  ],
  crossDay: {
    description: "Los turnos cruzados permiten a los trabajadores marcar entrada en una fecha del calendario y marcar salida al día siguiente. El sistema asocia automáticamente la salida con la sesión iniciada el día anterior, previniendo alertas de registros huérfanos.",
    activeRule: "VINCULAR_DIA_ANTERIOR",
    bufferHours: 4, // horas tras fin de turno durante las cuales se vincula la salida
    exampleShift: {
      name: "Turno Nocturno de Producción",
      timeframe: "22:00 - 06:00",
      linkingThreshold: "Si la salida ocurre antes de las 10:00 AM del día siguiente, vincular a la sesión iniciada ayer."
    }
  },
  holidayMatrix: [
    { date: "2026-07-04", name: "Día de la Independencia", region: "EE.UU. (Todas)", rule: "FERIADO_TRABAJADO (Doble Base)", status: "Activo" },
    { date: "2026-09-07", name: "Día del Trabajo", region: "EE.UU. (Todas)", rule: "FERIADO_TRABAJADO (1.75x)", status: "Activo" },
    { date: "2026-11-26", name: "Acción de Gracias", region: "EE.UU. (Todas)", rule: "FERIADO_TRABAJADO (Doble Base)", status: "Activo" },
    { date: "2026-12-25", name: "Navidad", region: "EE.UU. (Todas)", rule: "FERIADO_TRABAJADO (Doble Base)", status: "Activo" }
  ]
};

export const initialRequests = [
  {
    id: "REQ-301",
    employee: "Carlos Díaz",
    department: "TI y Sistemas",
    type: "Corrección de Marcaje",
    details: "Ajustar hora de entrada de 09:05:12 a 08:58:00. Retraso en línea 1 del metro.",
    evidence: "Comprobante_Retraso_Metro.jpg",
    gps: "40.7128° N, 74.0060° W",
    distance: "12m",
    requestDate: "2026-06-26 09:15",
    supervisor: "Supervisor Alfa",
    sla: "14h restantes",
    status: "PENDIENTE"
  },
  {
    id: "REQ-302",
    employee: "Lucía Fernández",
    department: "TI y Sistemas",
    type: "Marcaje Retroactivo",
    details: "Solicitud de marcaje retroactivo para jornada del 2026-06-25 por la tarde. El celular se quedó sin batería.",
    evidence: "Bitacora_Visita_Cliente.pdf",
    gps: "40.7580° N, 73.9855° W",
    distance: "185m (Validación cliente off-site)",
    requestDate: "2026-06-25 18:30",
    supervisor: "Supervisor Alfa",
    sla: "Vencido (Escalado a RRHH)",
    status: "PENDIENTE"
  },
  {
    id: "REQ-303",
    employee: "Roberto Méndez",
    department: "Logística",
    type: "Justificación de Ausencia",
    details: "Consulta médica de urgencia por procedimiento dental.",
    evidence: "Certificado_Medico_Mendez.pdf",
    gps: "40.7202° N, 74.0130° W",
    distance: "2.4km (Centro Clínico)",
    requestDate: "2026-06-26 10:20",
    supervisor: "Supervisor Logística",
    sla: "21h restantes",
    status: "PENDIENTE"
  },
  {
    id: "REQ-304",
    employee: "Juan Pérez",
    department: "Operaciones",
    type: "Intercambio de Turno",
    details: "Intercambiar turno del sábado por la noche con María Gómez.",
    evidence: "No requiere comprobantes",
    gps: "40.7132° N, 74.0048° W",
    distance: "4m",
    requestDate: "2026-06-24 14:00",
    supervisor: "Supervisor Operaciones",
    sla: "Aprobado",
    status: "APPROVED"
  }
];

export const initialVisitors = [
  {
    id: "VIS-701",
    name: "Sarah Jenkins",
    company: "Ventas Enterprise Stripe",
    host: "Sofía Rodríguez",
    appointmentTime: "10:30 AM",
    status: "ARRIVED",
    geofenceDistance: "3.5m",
    qrCode: "KRN-VIS-9812739",
    notified: true
  },
  {
    id: "VIS-702",
    name: "David Chen",
    company: "AuditCorp LLC",
    host: "Juan Pérez",
    appointmentTime: "02:00 PM",
    status: "PRE_REGISTERED",
    geofenceDistance: "145m",
    qrCode: "KRN-VIS-1029482",
    notified: false
  },
  {
    id: "VIS-703",
    name: "Elena Rostova",
    company: "Quantum CyberSec",
    host: "Lucía Fernández",
    appointmentTime: "11:15 AM",
    status: "GEO_VERIFIED",
    geofenceDistance: "8.2m",
    qrCode: "KRN-VIS-8374921",
    notified: false
  },
  {
    id: "VIS-704",
    name: "Marcus Aurelius",
    company: "Rome Builders",
    host: "Carlos Díaz",
    appointmentTime: "09:00 AM",
    status: "EXPIRED",
    geofenceDistance: "Desconocido",
    qrCode: "KRN-VIS-3920194",
    notified: false
  }
];

export const initialRooms = [
  {
    id: "RM-101",
    name: "Sala de Juntas Alfa (Ejecutiva)",
    capacity: 16,
    status: "CHECKED_IN",
    nextReservation: "11:30 AM - Revisión de Alianza con Deel",
    organizer: "Sofía Rodríguez",
    slaTimer: 0, // Ingresado, a salvo de liberación
    qrCode: "KRN-RM-ALPHA"
  },
  {
    id: "RM-102",
    name: "Nodo Turing (Desarrollo y Código)",
    capacity: 8,
    status: "RESERVED",
    nextReservation: "10:00 AM - Post-Mortem de Caída de Sistemas",
    organizer: "Carlos Díaz",
    slaTimer: 12, // 12 minutos restantes antes de liberar
    qrCode: "KRN-RM-TURING"
  },
  {
    id: "RM-103",
    name: "Sala Ada Lovelace",
    capacity: 4,
    status: "RELEASED_BY_NO_SHOW",
    nextReservation: "09:00 AM - Standup Semanal Operaciones",
    organizer: "Juan Pérez",
    slaTimer: 0, // Liberado automáticamente tras 15 minutos sin check-in
    qrCode: "KRN-RM-ADA"
  },
  {
    id: "RM-104",
    name: "Lounge Colaborativo Stripe",
    capacity: 12,
    status: "AVAILABLE",
    nextReservation: "03:00 PM - Presentación Junta Trimestral",
    organizer: "--",
    slaTimer: 15,
    qrCode: "KRN-RM-STRIPE"
  }
];

export const initialAuditTrail = [
  {
    id: "AUD-8001",
    actor: "Carlos Díaz",
    action: "REGISTRO_ENTRADA",
    affectedEntity: "EMP-003",
    prevValue: "AUSENTE",
    newValue: "PRESENTE (TARDE)",
    eventHash: "4f7a1b...8e9d",
    timestamp: "2026-06-26 13:05:12 UTC",
    ipAddress: "198.51.100.42",
    device: "OnePlus NE2213",
    status: "VALIDATED"
  },
  {
    id: "AUD-8002",
    actor: "Admin (Supervisor Alfa)",
    action: "AJUSTE_MARCAJE",
    affectedEntity: "EMP-008",
    prevValue: "SIN_SALIDA",
    newValue: "PRESENTE (AJUSTADO)",
    eventHash: "a3f12e...6b9c",
    timestamp: "2026-06-26 13:40:22 UTC",
    ipAddress: "203.0.113.19",
    device: "macOS 14.1 / Chrome 120",
    status: "VALIDATED"
  },
  {
    id: "AUD-8003",
    actor: "Daemon Cron Sistema",
    action: "LIBERAR_SALA_AUTOMATICO",
    affectedEntity: "RM-103",
    prevValue: "RESERVADO",
    newValue: "LIBERADO_POR_AUSENCIA",
    eventHash: "9d8e7c...1a2b",
    timestamp: "2026-06-26 13:15:00 UTC",
    ipAddress: "127.0.0.1 (Localhost)",
    device: "Krono Engine v4.2",
    status: "VALIDATED"
  },
  {
    id: "AUD-8004",
    actor: "IP: 198.51.100.99",
    action: "INTENTO_REPLAY",
    affectedEntity: "TOTP_GATEWAY",
    prevValue: "VALIDACION_TICKET",
    newValue: "REPLAY_BLOQUEADO",
    eventHash: "e3d2c1...7f8e",
    timestamp: "2026-06-26 13:02:15 UTC",
    ipAddress: "198.51.100.99",
    device: "Huella Digital Desconocida",
    status: "SUSPICIOUS"
  }
];

export const initialPayroll = [
  {
    employeeId: "EMP-001",
    name: "Juan Pérez",
    department: "Operaciones",
    regularHours: 40.0,
    nightHours: 0.0,
    overtimeHours: 4.5,
    appliedFactor: "1.35x (H. Extra Diurna)",
    estimatedAmount: 980.50,
    status: "PENDIENTE"
  },
  {
    employeeId: "EMP-002",
    name: "María Gómez",
    department: "Operaciones",
    regularHours: 40.0,
    nightHours: 0.0,
    overtimeHours: 0.5,
    appliedFactor: "1.35x (H. Extra Diurna)",
    estimatedAmount: 812.25,
    status: "AUTO_APROBADO"
  },
  {
    employeeId: "EMP-004",
    name: "Sofía Rodríguez",
    department: "Recursos Humanos",
    regularHours: 38.5,
    nightHours: 0.0,
    overtimeHours: 0.0,
    appliedFactor: "1.00x (Estándar)",
    estimatedAmount: 1150.00,
    status: "AUTO_APROBADO"
  },
  {
    employeeId: "EMP-005",
    name: "Alejandro Ruiz",
    department: "Operaciones",
    regularHours: 32.0,
    nightHours: 8.0,
    overtimeHours: 2.0,
    appliedFactor: "1.75x (Nocturno y Feriado)",
    estimatedAmount: 1045.00,
    status: "AUTO_APROBADO"
  },
  {
    employeeId: "EMP-006",
    name: "Camila Silva",
    department: "Experiencia del Cliente",
    regularHours: 40.0,
    nightHours: 0.0,
    overtimeHours: 1.25,
    appliedFactor: "1.35x (H. Extra Diurna)",
    estimatedAmount: 765.40,
    status: "PENDIENTE"
  }
];

export const initialSettings = {
  tenant: {
    name: "Krono Global Inc.",
    industry: "Logística y Tecnología Global",
    region: "Sede Américas",
    timezone: "America/New_York",
    multiTenantId: "TNT-8942-X90"
  },
  security: {
    doubleEncryption: true,
    localBiometricOnly: true,
    antiReplaySkew: 3, // segundos tolerados de retraso
    allowedFailedScans: 5
  },
  clockInMethods: {
    totpQr: true,
    zeroTouch: true,
    kioskMode: false,
    manualAdjustOnlySupervisor: true
  },
  bssids: [
    { bssid: "00:1A:2B:3C:4D:5E", name: "Área Central HQ", status: "Active" },
    { bssid: "00:1A:2B:3C:4D:6F", name: "Plataforma de Logística HQ", status: "Active" },
    { bssid: "AA:BB:CC:DD:EE:FF", name: "Lounge Edificio B", status: "Inactive" }
  ],
  geofences: [
    { name: "Geocerca Sede Central HQ", latitude: 40.7128, longitude: -74.0060, radius: 40, status: "Active" },
    { name: "Geocerca Centro de Distribución", latitude: 40.7580, longitude: -73.9855, radius: 60, status: "Active" }
  ],
  tolerances: {
    entryTolerance: 10, // minutos
    lateThreshold: 11, // minutos (de 11 a 30)
    partialAbsence: 30, // minutos (más de 30)
    missingCheckoutTrigger: 4 // horas tras fin de turno esperado
  },
  salaryRules: {
    baseRate: 20.00, // tarifa base estándar
    daytimeOtFactor: 1.35,
    nighttimeOtFactor: 1.75,
    holidayFactor: 2.00,
    autoOtLimitMinutes: 45 // OT por debajo de este límite se aprueba automáticamente
  },
  slas: {
    supervisorResolution: 24, // horas antes de escalar a RRHH
    hrAutoApprove: 48, // horas antes de auto-aprobar
    roomAntiGhosting: 15 // minutos de tolerancia para check-in en salas
  },
  integrations: [
    { name: "Sincronización Nómina Workday", type: "Integración de Nómina", status: "CONNECTED" },
    { name: "Enlace Rippling HRIS", type: "Sincronización Personal", status: "CONNECTED" },
    { name: "Pasarela Slack Alerts", type: "Notificaciones", status: "CONNECTED" },
    { name: "SAP ERP Ledger Integration", type: "Sincronización Financiera", status: "DISCONNECTED" }
  ]
};
