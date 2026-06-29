import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Calendar, QrCode, AlertTriangle, DollarSign, 
  FileText, UserPlus, Compass, ShieldAlert, Settings as SettingsIcon,
  Search, Bell, User, Clock, ChevronDown, ChevronRight, Menu, X, Building2,
  BarChart2
} from 'lucide-react';

// Importar Pantallas en Español
import Dashboard from './components/Dashboard';
import LiveAttendance from './components/LiveAttendance';
import ShiftsCalendars from './components/ShiftsCalendars';
import DigitalClockIn from './components/DigitalClockIn';
import Incidents from './components/Incidents';
import PayrollOvertime from './components/PayrollOvertime';
import EssRequests from './components/EssRequests';
import Visitors from './components/Visitors';
import MeetingRooms from './components/MeetingRooms';
import AuditTrail from './components/AuditTrail';
import Settings from './components/Settings';
import Organization from './components/Organization';
import Reports from './components/Reports';

// Importar Base de Datos Simulada en Español
import {
  initialEmployees,
  initialIncidents,
  initialShifts,
  initialRequests,
  initialVisitors,
  initialRooms,
  initialAuditTrail,
  initialPayroll,
  initialSettings
} from './mockData';

export default function App() {
  const [currentTab, setCurrentTab] = useState('Panel General');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Estado Centralizado
  const [employees, setEmployees] = useState(() =>
    initialEmployees.map((emp, i) => ({
      ...emp,
      branch: i % 3 === 0 ? 'Corporativo Central' : i % 3 === 1 ? 'Planta Industrial Norte' : 'Centro de Distribución Occidente'
    }))
  );
  const [branches, setBranches] = useState([
    { id: 'SC-01', name: 'Corporativo Central', address: 'Av. Reforma 402, Ciudad de México', timezone: 'GMT-6 (CDMX)', ipRange: '192.168.1.1/24', manager: 'Laura González', employeesCount: 4 },
    { id: 'SC-02', name: 'Planta Industrial Norte', address: 'Parque Industrial Milimex, Monterrey', timezone: 'GMT-6 (CDMX)', ipRange: '10.0.1.1/24', manager: 'Roberto Méndez', employeesCount: 2 },
    { id: 'SC-03', name: 'Centro de Distribución Occidente', address: 'Anillo Periférico Sur 8100, Guadalajara', timezone: 'GMT-6 (CDMX)', ipRange: '172.16.0.1/24', manager: 'Alejandro Ruiz', employeesCount: 1 }
  ]);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [shifts, setShifts] = useState(initialShifts);
  const [requests, setRequests] = useState(initialRequests);
  const [visitors, setVisitors] = useState(initialVisitors);
  const [rooms, setRooms] = useState(initialRooms);
  const [auditLogs, setAuditLogs] = useState(initialAuditTrail);
  const [payroll, setPayroll] = useState(initialPayroll);
  const [settings, setSettings] = useState(initialSettings);
  const [departments, setDepartments] = useState([
    'Operaciones', 
    'Logística', 
    'TI y Sistemas', 
    'Recursos Humanos', 
    'Experiencia del Cliente'
  ]);

  // --- Estados de Turnos y Calendarios Levantados ---
  const ANCHOR = '2026-07-01';
  const DAY_MS = 86400000;
  const [scheduleCatalog, setScheduleCatalog] = useState([
    {
      id: 'SCH-FIJO-01', code: 'DF1', name: 'Diurno General Corporativo', type: 'FIJO',
      startTime: '08:00', endTime: '17:00',
      checkInStart: '07:00', checkInEnd: '09:30', checkOutStart: '16:30', checkOutEnd: '20:00',
      gracePeriod: 10, otThreshold: 15, otEarly: false, otLate: true, otBase: 'TRABAJADO',
      crossDay: false, daySpan: 1, validatePunch: true, dupMinutes: 5, dayChange: '00:00',
      breakType: 'AUTOMATICO', breakDuration: 60,
      bg: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    {
      id: 'SCH-FLEX-02', code: 'FLX', name: 'Flexible TI / Soporte', type: 'FLEXIBLE',
      startTime: 'Flexible', endTime: 'Flexible', targetHours: 8.5, multiPunch: true,
      gracePeriod: 0, otThreshold: 30, otBase: 'EXTRA',
      crossDay: false, daySpan: 1, validatePunch: false, dupMinutes: 5, dayChange: '00:00',
      breakType: 'REGISTRADO', breakDuration: 45,
      bg: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      id: 'SCH-NOC-03', code: 'NOC', name: 'Nocturno Rotativo Carga (+1)', type: 'NOCTURNO',
      startTime: '22:00', endTime: '06:00',
      checkInStart: '21:00', checkInEnd: '23:30', checkOutStart: '05:30', checkOutEnd: '08:00',
      gracePeriod: 15, otThreshold: 20, otEarly: false, otLate: true, otBase: 'TRABAJADO',
      crossDay: true, daySpan: 1, validatePunch: true, dupMinutes: 5, dayChange: '04:00',
      breakType: 'AUTOMATICO', breakDuration: 30,
      bg: 'bg-slate-800 text-white border-slate-700'
    },
    {
      id: 'SCH-EXT-04', code: 'G24', name: 'Jornada Extensa Guardia', type: 'EXTENSO',
      startTime: '08:00', endTime: '08:00', durationHours: 24,
      gracePeriod: 15, otThreshold: 30, otBase: 'TRABAJADO',
      crossDay: true, daySpan: 2, validatePunch: true, dupMinutes: 10, dayChange: '00:00',
      breakType: 'AUTOMATICO', breakDuration: 120,
      bg: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      id: 'SCH-DESC-05', code: 'LIB', name: 'Día Libre (Descanso)', type: 'DESCANSO',
      startTime: 'N/A', endTime: 'N/A', otMultiplier: 2.0,
      bg: 'bg-slate-100 text-slate-400 border-slate-200'
    }
  ]);

  const [shiftCycles, setShiftCycles] = useState([
    {
      id: 'CYC-SEM-01', name: 'Semanal Administrativo Estándar', type: 'SEMANAL', auto: false,
      days: ['DF1', 'DF1', 'DF1', 'DF1', 'DF1', 'LIB', 'LIB'],
      desc: 'Lunes a Viernes Diurno, Sábado y Domingo Libres'
    },
    {
      id: 'CYC-ROT-02', name: 'Rotativo Vigilancia 12x24', type: 'CUSTOM', auto: false,
      days: ['DF1', 'LIB', 'NOC', 'LIB'],
      desc: 'Diurno → Libre → Nocturno → Libre (ciclo continuo de 4 días)'
    },
    {
      id: 'CYC-ROT-03', name: 'Guardia Médica 24x48', type: 'CUSTOM', auto: false,
      days: ['G24', 'LIB', 'LIB'],
      desc: 'Guardia 24 horas + 48 horas de descanso continuo'
    },
    {
      id: 'CYC-AUTO-04', name: 'Multi-turno Automático (IA)', type: 'AUTO', auto: true,
      days: [],
      desc: 'El sistema detecta el turno (Diurno/Vespertino/Nocturno) según la hora del marcaje'
    }
  ]);

  const [assignments, setAssignments] = useState([
    { id: 'ASG-OPS', mode: 'DEPARTAMENTO', target: 'Operaciones', cycleId: 'CYC-ROT-02', startDate: ANCHOR, endDate: '2026-07-31', isTemp: false, phase: 0, pub: { mode: 'PERIODICA', cadence: 'SEMANAL', noticeDay: 5, lead: 1 } },
    { id: 'ASG-LOG', mode: 'DEPARTAMENTO', target: 'Logística', cycleId: 'CYC-ROT-02', startDate: ANCHOR, endDate: '2026-07-31', isTemp: false, phase: 1, pub: { mode: 'PERIODICA', cadence: 'QUINCENAL', noticeDay: 4, lead: 1 } },
    { id: 'ASG-TI', mode: 'DEPARTAMENTO', target: 'TI y Sistemas', cycleId: 'CYC-SEM-01', startDate: ANCHOR, endDate: '2026-07-31', isTemp: false, phase: 0, pub: { mode: 'NINGUNA' } },
    { id: 'ASG-RH', mode: 'DEPARTAMENTO', target: 'Recursos Humanos', cycleId: 'CYC-SEM-01', startDate: ANCHOR, endDate: '2026-07-31', isTemp: false, phase: 0, pub: { mode: 'NINGUNA' } },
    { id: 'ASG-LUCIA', mode: 'EMPLEADO', target: 'Lucía Fernández', cycleId: 'CYC-ROT-03', startDate: ANCHOR, endDate: '2026-07-31', isTemp: false, phase: 0, pub: { mode: 'PERIODICA', cadence: 'MENSUAL', noticeDay: 1, lead: 1 } },
    { id: 'EXC-MARIA', mode: 'EMPLEADO', target: 'María Gómez', shiftCode: 'G24', startDate: '2026-07-05', endDate: '2026-07-05', isTemp: true, exceptionType: 'REEMPLAZAR' }
  ]);

  const [manualOverrides, setManualOverrides] = useState({});
  const [periodOverrides, setPeriodOverrides] = useState({});

  const dateIndex = (ds) =>
    Math.round((new Date(ds + 'T00:00:00') - new Date(ANCHOR + 'T00:00:00')) / DAY_MS);

  const resolveAssignment = (empName, dept, ds) => {
    const inRange = (a) => ds >= a.startDate && ds <= a.endDate;
    return (
      assignments.find((a) => a.isTemp && a.mode === 'EMPLEADO' && a.target === empName && inRange(a)) ||
      assignments.find((a) => !a.isTemp && a.mode === 'EMPLEADO' && a.target === empName && inRange(a)) ||
      assignments.find((a) => a.mode === 'DEPARTAMENTO' && a.target === dept && inRange(a)) ||
      null
    );
  };

  const familyOf = (cyc) => (cyc.auto ? 'AUTO' : cyc.type === 'SEMANAL' ? 'FIJO' : 'ROTATIVO');

  const codeForDay = (asg, cycles, dsIdxAbs, dateObj) => {
    if (!asg) return 'SIN_ASIGNAR';
    if (asg.shiftCode) return asg.shiftCode;
    const cyc = cycles.find((c) => c.id === asg.cycleId);
    if (!cyc) return 'SIN_ASIGNAR';
    const fam = familyOf(cyc);
    if (fam === 'AUTO') return 'AUTO';
    if (fam === 'FIJO') {
      const wpos = (dateObj.getDay() + 6) % 7;
      return cyc.days[wpos % cyc.days.length];
    }
    const len = cyc.days.length;
    const anchorIdx = dateIndex(asg.anchorDate || asg.startDate);
    const phase = asg.phase || 0;
    const pos = (((dsIdxAbs - anchorIdx + phase) % len) + len) % len;
    return cyc.days[pos];
  };

  const getExpectedShift = (empName, dept, dateStr) => {
    const asg = resolveAssignment(empName, dept, dateStr);
    const dateObj = new Date(dateStr + 'T00:00:00');
    const code = codeForDay(asg, shiftCycles, dateIndex(dateStr), dateObj);
    const sch = scheduleCatalog.find(s => s.code === code);
    if (!sch) return code === 'SIN_ASIGNAR' ? 'Sin Asignar' : code;
    return `${sch.name} (${sch.startTime === 'Flexible' ? 'Flexible' : `${sch.startTime} - ${sch.endTime}`})`;
  };

  // Estados de Header y Búsqueda
  const [tenantName, setTenantName] = useState('Krono Global Inc.');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  // Reloj en vivo en el header
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Generador de Hash Simulado
  const generateFakeHash = () => {
    return '0x' + Array.from({length: 12}, () => Math.floor(Math.random()*16).toString(16)).join('');
  };

  // Modificadores de Estado
  const handleAddAuditLog = (actor, action, affectedEntity, prevValue, newValue, details = '') => {
    const timestampUTC = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const newLog = {
      id: `AUD-${Math.floor(8000 + Math.random() * 1999)}`,
      actor,
      action,
      affectedEntity,
      prevValue,
      newValue,
      eventHash: generateFakeHash(),
      timestamp: timestampUTC,
      ipAddress: '198.51.100.12',
      device: 'macOS Sonoma / Chrome 124',
      status: 'VALIDATED'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleAdjustPunch = (empId, checkIn, checkOut, notes) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        let nextStatus = 'PRESENTE';
        if (checkIn === '--:--:--' && checkOut === '--:--:--') {
          nextStatus = 'AUSENTE';
        } else if (checkIn !== '--:--:--' && checkOut !== '--:--:--') {
          nextStatus = 'PRESENTE';
        } else {
          nextStatus = 'PRESENTE';
        }

        const newTimelineItem = {
          time: new Date().toLocaleTimeString(),
          event: `Ajuste manual de marcaje por Admin de RRHH: In[${checkIn}] Out[${checkOut}]`,
          type: 'adjustment'
        };

        const newAdjustmentItem = {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          actor: 'Administrador RRHH',
          action: 'Marcaje Ajustado',
          detail: `In: ${checkIn}, Out: ${checkOut}. Justificación: ${notes}`
        };

        return {
          ...emp,
          checkIn,
          checkOut,
          status: nextStatus,
          timeline: [...emp.timeline, newTimelineItem],
          adjustments: [...emp.adjustments, newAdjustmentItem]
        };
      }
      return emp;
    }));
    handleAddAuditLog('Admin de RRHH', 'AJUSTE_MARCAJE', empId, 'MUTATED', `In: ${checkIn} Out: ${checkOut}`, `Razón: ${notes}`);
  };

  const handleApproveException = (empId) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          status: 'PRESENTE',
          timeline: [...emp.timeline, { time: new Date().toLocaleTimeString(), event: 'Excepción de entrada tardía o sin salida aprobada por el supervisor', type: 'waiver' }]
        };
      }
      return emp;
    }));
    setIncidents(prev => prev.filter(inc => !inc.caseName.includes(empId)));
  };

  const handleAddPattern = (newPattern) => {
    setShifts(prev => ({
      ...prev,
      patterns: [...prev.patterns, newPattern]
    }));
  };

  const handleResolveIncident = (id, nextStatus) => {
    setIncidents(prev => prev.map(inc => {
      if (inc.id === id) {
        return { ...inc, status: nextStatus, slaRemaining: nextStatus === 'APPROVED' ? 0 : inc.slaRemaining };
      }
      return inc;
    }));

    if (nextStatus === 'APPROVED') {
      const incident = incidents.find(i => i.id === id);
      if (incident && (incident.type === 'TARDE' || incident.type === 'SIN_SALIDA')) {
        const emp = employees.find(e => e.name === incident.employee);
        if (emp) handleApproveException(emp.id);
      }
      setTimeout(() => {
        setIncidents(prev => prev.filter(inc => inc.id !== id));
      }, 500);
    }
  };

  const handleResolveRequest = (id, nextStatus) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, status: nextStatus === 'APPROVED' ? 'APROBADO' : 'RECHAZADO', sla: nextStatus === 'APPROVED' ? 'Aprobado' : 'Rechazado' };
      }
      return req;
    }));

    if (nextStatus === 'APPROVED') {
      const request = requests.find(r => r.id === id);
      if (request && (request.type === 'Marcaje Retroactivo' || request.type === 'Corrección de Marcaje')) {
        const emp = employees.find(e => e.name === request.employee);
        if (emp) {
          setEmployees(prev => prev.map(e => {
            if (e.id === emp.id) {
              return {
                ...e,
                checkIn: '08:58:00',
                checkOut: '18:00:00',
                status: 'PRESENTE',
                timeline: [...e.timeline, { time: new Date().toLocaleTimeString(), event: 'Marcaje retroactivo aprobado mediante flujo de ESS', type: 'clockin' }]
              };
            }
            return e;
          }));
        }
      }
    }
  };

  const handleAddVisitor = (newVis) => {
    setVisitors(prev => [newVis, ...prev]);
  };

  const handleUpdateVisitorStatus = (id, fields) => {
    setVisitors(prev => prev.map(vis => {
      if (vis.id === id) {
        return { ...vis, ...fields };
      }
      return vis;
    }));
  };

  const handleUpdateRoom = (id, updatedRoom) => {
    setRooms(prev => prev.map(r => r.id === id ? updatedRoom : r));
  };

  const handleAddRoom = (newRoom) => {
    setRooms(prev => [...prev, newRoom]);
  };

  const handleDeleteRoom = (id) => {
    setRooms(prev => prev.filter(r => r.id !== id));
  };

  const handleAddBranch = (newBranch) => {
    setBranches(prev => [...prev, newBranch]);
  };

  const handleDeleteBranch = (id) => {
    setBranches(prev => prev.filter(b => b.id !== id));
  };

  const handleClockInStaff = (name, method) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.name === name) {
        return {
          ...emp,
          checkIn: new Date().toLocaleTimeString(),
          method,
          status: 'PRESENTE',
          gpsDistance: 4.2,
          biometricVerified: true,
          timeline: [...emp.timeline, { time: new Date().toLocaleTimeString(), event: `Entrada registrada con éxito vía ${method}`, type: 'clockin' }]
        };
      }
      return emp;
    }));
  };

  const handleUpdateSettings = (updatedSettings) => {
    setSettings(updatedSettings);
  };

  const handleAddEmployee = (newEmp) => {
    setEmployees(prev => [newEmp, ...prev]);
  };

  const handleAddDepartment = (newDeptName) => {
    setDepartments(prev => [...prev, newDeptName]);
  };

  // Configuración de Pestañas de Navegación Lateral
  const navTabs = [
    { label: 'Panel General', icon: LayoutDashboard },
    { label: 'Organización', icon: Building2 },
    { label: 'Asistencia en Vivo', icon: Users, badge: employees.filter(e => e.status === 'SIN_SALIDA').length },
    { label: 'Turnos y Calendarios', icon: Calendar },
    { label: 'Marcaje Digital', icon: QrCode },
    { label: 'Triage de Incidentes', icon: AlertTriangle, badge: incidents.length },
    { label: 'Nómina y Horas Extras', icon: DollarSign },
    { label: 'Centro de Reportes', icon: BarChart2 },
    { label: 'Solicitudes ESS', icon: FileText, badge: requests.filter(r => r.status === 'PENDIENTE').length },
    { label: 'Control de Visitantes', icon: UserPlus },
    { label: 'Salas de Reunión', icon: Compass, badge: rooms.filter(r => r.status === 'RESERVADO' && r.slaTimer > 0).length },
    { label: 'Pistas de Auditoría', icon: ShieldAlert },
    { label: 'Configuración', icon: SettingsIcon }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
      
      {/* BARRA LATERAL (SIDEBAR) */}
      <aside className={`bg-slate-900 text-slate-400 fixed top-0 bottom-0 left-0 z-40 transition-all duration-300 flex flex-col border-r border-slate-800 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}>
        {/* Cabecera del Logo */}
        <div className="h-16 px-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white font-mono text-lg tracking-wider shadow-md">
              K
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg text-white tracking-wide font-mono">
                KRONO<span className="text-indigo-500 font-sans font-medium text-xs ml-1 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-900/40">SaaS</span>
              </span>
            )}
          </div>
        </div>

        {/* Lista de Navegación */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.label;
            return (
              <button
                key={tab.label}
                onClick={() => setCurrentTab(tab.label)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-bold text-left flex items-center gap-3 transition-all cursor-pointer group relative ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon size={16} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                {sidebarOpen && <span className="truncate">{tab.label}</span>}
                {sidebarOpen && tab.badge > 0 && (
                  <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {!sidebarOpen && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-slate-950 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap border border-slate-800">
                    {tab.label} {tab.badge > 0 ? `(${tab.badge})` : ''}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Info del Motor en Barra Lateral */}
        {sidebarOpen && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950 text-center shrink-0">
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 block">Motor de Telemetría Krono</span>
            <span className="text-[9px] font-mono text-indigo-400 mt-1 block">v4.12.0 - Cadena Criptográfica</span>
          </div>
        )}
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'pl-64' : 'pl-20'
      }`}>
        
        {/* CABECERA (HEADER) */}
        <header className="h-16 bg-white border-b border-slate-200/80 shadow-xs px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
          
          {/* Sección Izquierda: Toggle Lateral y Selector de Tenant */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Selector de División */}
            <div className="relative">
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-50 border border-slate-200/80 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <span>{tenantName}</span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Sección Central: Reloj Digital */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-lg border">
            <Clock size={13} className="text-slate-400" />
            <span className="font-mono text-slate-700 font-bold">{time.toLocaleDateString()} {time.toLocaleTimeString()}</span>
          </div>

          {/* Sección Derecha: Búsqueda, Notificaciones y Perfil */}
          <div className="flex items-center gap-4">
            {/* Buscador */}
            <div className="relative hidden sm:block w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
              <input
                type="text"
                placeholder="Búsqueda Global..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-semibold"
              />
            </div>

            {/* Notificaciones */}
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer relative"
              >
                <Bell size={18} />
                {incidents.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                )}
              </button>

              {/* Notificaciones Desplegables */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                    <span className="font-bold text-xs text-slate-800">Triage de Incidentes Críticos</span>
                    <button 
                      onClick={() => {
                        setCurrentTab('Triage de Incidentes');
                        setNotificationsOpen(false);
                      }}
                      className="text-[10px] font-bold text-indigo-600 hover:underline"
                    >
                      Ver Todos
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {incidents.slice(0, 3).map((inc) => (
                      <div key={inc.id} className="p-3 text-[11px] hover:bg-slate-50 transition-colors font-medium">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-800">{inc.caseName}</span>
                          <span className="text-[9px] bg-rose-50 text-rose-700 px-1.5 rounded">{inc.severity}</span>
                        </div>
                        <p className="text-slate-400 mt-0.5">Asignado a {inc.owner}. {inc.slaRemaining}h restantes.</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Perfil del Usuario */}
            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 hover:bg-slate-50 p-1 rounded-lg transition-all cursor-pointer"
              >
                <img 
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80" 
                  alt="Perfil del Administrador" 
                  className="w-8 h-8 rounded-full border object-cover shadow-sm"
                />
                <span className="hidden lg:block text-xs font-bold text-slate-700">Portal Admin</span>
                <ChevronDown size={12} className="hidden lg:block text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden p-2 text-xs font-bold text-slate-600 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-2 border-b border-slate-100 space-y-0.5">
                    <span className="text-slate-800 font-bold block">Diana Prince</span>
                    <span className="text-[10px] text-slate-400 block font-semibold">Directora de RRHH / Admin</span>
                  </div>
                  <button onClick={() => { setCurrentTab('Configuración'); setProfileOpen(false); }} className="w-full text-left p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    Configuración Global
                  </button>
                  <button onClick={() => { setCurrentTab('Pistas de Auditoría'); setProfileOpen(false); }} className="w-full text-left p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                    Auditoría e Integridad
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ÁREA DE CONTENIDO PRINCIPAL */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto pb-16">
          
          {currentTab === 'Panel General' && (
            <Dashboard 
              employees={employees}
              incidents={incidents}
              requests={requests}
              visitors={visitors}
              rooms={rooms}
              auditLogs={auditLogs}
              setCurrentTab={setCurrentTab}
            />
          )}

          {currentTab === 'Organización' && (
            <Organization 
              employees={employees}
              departments={departments}
              branches={branches}
              onAddEmployee={handleAddEmployee}
              onAddDepartment={handleAddDepartment}
              onAddBranch={handleAddBranch}
              onDeleteBranch={handleDeleteBranch}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {currentTab === 'Asistencia en Vivo' && (
            <LiveAttendance 
              employees={employees}
              onAdjustPunch={handleAdjustPunch}
              onApproveException={handleApproveException}
              onAddAuditLog={handleAddAuditLog}
              getExpectedShift={getExpectedShift}
            />
          )}

          {currentTab === 'Turnos y Calendarios' && (
            <ShiftsCalendars 
              departments={departments}
              onAddAuditLog={handleAddAuditLog}
              assignments={assignments}
              setAssignments={setAssignments}
              shiftCycles={shiftCycles}
              setShiftCycles={setShiftCycles}
              scheduleCatalog={scheduleCatalog}
              setScheduleCatalog={setScheduleCatalog}
              manualOverrides={manualOverrides}
              setManualOverrides={setManualOverrides}
              periodOverrides={periodOverrides}
              setPeriodOverrides={setPeriodOverrides}
            />
          )}

          {currentTab === 'Marcaje Digital' && (
            <DigitalClockIn 
              onAddAuditLog={handleAddAuditLog}
              onClockInStaff={handleClockInStaff}
            />
          )}

          {currentTab === 'Triage de Incidentes' && (
            <Incidents 
              incidents={incidents}
              onResolveIncident={handleResolveIncident}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {currentTab === 'Nómina y Horas Extras' && (
            <PayrollOvertime 
              payrollState={payroll}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {currentTab === 'Centro de Reportes' && (
            <Reports 
              employees={employees}
              departments={departments}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {currentTab === 'Solicitudes ESS' && (
            <EssRequests 
              requests={requests}
              onResolveRequest={handleResolveRequest}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {currentTab === 'Control de Visitantes' && (
            <Visitors 
              visitors={visitors}
              onAddVisitor={handleAddVisitor}
              onUpdateVisitorStatus={handleUpdateVisitorStatus}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {currentTab === 'Salas de Reunión' && (
            <MeetingRooms 
              roomsState={rooms}
              onUpdateRoom={handleUpdateRoom}
              onAddRoom={handleAddRoom}
              onDeleteRoom={handleDeleteRoom}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

          {currentTab === 'Pistas de Auditoría' && (
            <AuditTrail 
              auditLogs={auditLogs}
            />
          )}

          {currentTab === 'Configuración' && (
            <Settings 
              settingsState={settings}
              onUpdateSettings={handleUpdateSettings}
              onAddAuditLog={handleAddAuditLog}
            />
          )}

        </main>

      </div>
    </div>
  );
}
