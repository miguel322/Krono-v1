import React, { useState } from 'react';
import { 
  Calendar, RotateCcw, Plus, Clock, Globe, ShieldAlert, CheckCircle, Info,
  UserPlus, UserMinus, Settings, Edit, Eye, Trash2, ArrowRightLeft, Check, X,
  FileText, Sliders, AlertCircle, Play, Sparkles, UserCheck, HelpCircle, Layers
} from 'lucide-react';

export default function ShiftsCalendars({ shiftsState, departments, onAddPattern, onAddAuditLog }) {
  const [subTab, setSubTab] = useState('ROSTER'); // ROSTER, HORARIOS, CICLOS, ASIGNADOR

  // 1. BIBLIOTECA DE HORARIOS (Estilo BioTime Pro)
  const [scheduleCatalog, setScheduleCatalog] = useState([
    { 
      id: 'SCH-FIJO-01', 
      code: 'DF1', 
      name: 'Diurno General Corporativo', 
      type: 'FIJO', 
      startTime: '08:00', 
      endTime: '17:00',
      checkInStart: '07:00',
      checkInEnd: '09:30',
      checkOutStart: '16:30',
      checkOutEnd: '20:00',
      gracePeriod: 10, // minutos
      otThreshold: 15, // minutos
      breakType: 'AUTOMATICO', // AUTOMATICO o REGISTRADO
      breakDuration: 60, // minutos
      bg: 'bg-blue-100 text-blue-800 border-blue-200' 
    },
    { 
      id: 'SCH-FLEX-02', 
      code: 'FLX', 
      name: 'Flexible TI / Soporte', 
      type: 'FLEXIBLE', 
      startTime: 'Flexible', 
      endTime: 'Flexible',
      targetHours: 8.5,
      multiPunch: true, // Checadas múltiples
      breakType: 'REGISTRADO',
      breakDuration: 45,
      bg: 'bg-purple-100 text-purple-800 border-purple-200' 
    },
    { 
      id: 'SCH-NOC-03', 
      code: 'NOC', 
      name: 'Nocturno Rotativo Carga (+1)', 
      type: 'NOCTURNO', 
      startTime: '22:00', 
      endTime: '06:00',
      checkInStart: '21:00',
      checkInEnd: '23:30',
      checkOutStart: '05:30',
      checkOutEnd: '08:00',
      gracePeriod: 15,
      otThreshold: 20,
      breakType: 'AUTOMATICO',
      breakDuration: 30,
      bg: 'bg-slate-800 text-white border-slate-700' 
    },
    { 
      id: 'SCH-EXT-04', 
      code: 'G24', 
      name: 'Jornada Extensa Guardia', 
      type: 'EXTENSO', 
      startTime: '08:00', 
      endTime: '08:00', // 24 horas
      durationHours: 24,
      gracePeriod: 15,
      breakType: 'AUTOMATICO',
      breakDuration: 120,
      bg: 'bg-amber-100 text-amber-800 border-amber-200' 
    },
    { 
      id: 'SCH-DESC-05', 
      code: 'LIB', 
      name: 'Día Libre (Descanso)', 
      type: 'DESCANSO', 
      startTime: 'N/A', 
      endTime: 'N/A',
      otMultiplier: 2.0, // Pago doble si se trabaja
      bg: 'bg-slate-100 text-slate-400 border-slate-200' 
    }
  ]);

  // Formulario de nuevo horario
  const [schType, setSchType] = useState('FIJO');
  const [schCode, setSchCode] = useState('');
  const [schName, setSchName] = useState('');
  const [schStart, setSchStart] = useState('09:00');
  const [schEnd, setSchEnd] = useState('18:00');
  const [schCheckInStart, setSchCheckInStart] = useState('08:00');
  const [schCheckInEnd, setSchCheckInEnd] = useState('10:00');
  const [schCheckOutStart, setSchCheckOutStart] = useState('17:30');
  const [schCheckOutEnd, setSchCheckOutEnd] = useState('20:00');
  const [schGrace, setSchGrace] = useState(15);
  const [schOt, setSchOt] = useState(15);
  const [schBreakType, setSchBreakType] = useState('AUTOMATICO');
  const [schBreakDur, setSchBreakDur] = useState(60);
  const [schTargetHrs, setSchTargetHrs] = useState(8);
  const [schExtHours, setSchExtHours] = useState(24);
  const [schColor, setSchColor] = useState('blue');

  // 2. CICLOS DE TURNOS (Weekly o Custom N-Days)
  const [shiftCycles, setShiftCycles] = useState([
    { 
      id: 'CYC-SEM-01', 
      name: 'Semanal Administrativo Estándar', 
      type: 'SEMANAL', 
      days: ['DF1', 'DF1', 'DF1', 'DF1', 'DF1', 'LIB', 'LIB'], // 7 días fijos
      desc: 'Lunes a Viernes Diurno, Sábado y Domingo Libres'
    },
    { 
      id: 'CYC-ROT-02', 
      name: 'Rotativo Vigilancia 12x24', 
      type: 'CUSTOM', 
      days: ['DF1', 'LIB', 'NOC', 'LIB'], // Ciclo de 4 días
      desc: 'Diurno, Libre, Nocturno, Libre (Ciclo continuo de 4 días)'
    },
    { 
      id: 'CYC-ROT-03', 
      name: 'Guardia Médica 24x48', 
      type: 'CUSTOM', 
      days: ['G24', 'LIB', 'LIB'], // Ciclo de 3 días
      desc: 'Guardia 24 horas, 48 horas de descanso continuo'
    }
  ]);

  // Formulario nuevo ciclo
  const [cycName, setCycName] = useState('');
  const [cycType, setCycType] = useState('SEMANAL');
  const [cycLength, setCycLength] = useState(7);
  const [cycDays, setCycDays] = useState(['DF1', 'DF1', 'DF1', 'DF1', 'DF1', 'LIB', 'LIB']);

  const handleLengthChange = (length) => {
    const newLen = Math.max(1, Math.min(14, length)); // máx 14 días para la secuencia
    setCycLength(newLen);
    
    const updated = [...cycDays];
    if (updated.length < newLen) {
      while (updated.length < newLen) {
        updated.push('LIB');
      }
    } else {
      updated.length = newLen;
    }
    setCycDays(updated);
  };

  const handleTypeChange = (type) => {
    setCycType(type);
    if (type === 'SEMANAL') {
      handleLengthChange(7);
    } else {
      handleLengthChange(4); // default para ciclos rotativos
    }
  };

  // 3. ASIGNACIONES ACTIVAS
  const [assignments, setAssignments] = useState([
    { id: 'ASG-101', mode: 'DEPARTAMENTO', target: 'Recursos Humanos', cycleId: 'CYC-SEM-01', startDate: '2026-07-01', endDate: '2026-07-31', isTemp: false },
    { id: 'ASG-102', mode: 'DEPARTAMENTO', target: 'Logística', cycleId: 'CYC-ROT-02', startDate: '2026-07-01', endDate: '2026-07-31', isTemp: false },
    { id: 'ASG-103', mode: 'EMPLEADO', target: 'Lucía Fernández', cycleId: 'CYC-ROT-03', startDate: '2026-07-01', endDate: '2026-07-31', isTemp: false },
    // Excepción temporal: María Gómez tiene guardia especial el 4 de Julio
    { id: 'EXC-201', mode: 'EMPLEADO', target: 'María Gómez', cycleId: 'CYC-ROT-03', startDate: '2026-07-04', endDate: '2026-07-04', isTemp: true, exceptionType: 'REEMPLAZAR' }
  ]);

  // Formulario nuevo asignador
  const [asgMode, setAsgMode] = useState('DEPARTAMENTO');
  const [asgTarget, setAsgTarget] = useState('Operaciones');
  const [asgCycleId, setAsgCycleId] = useState('CYC-SEM-01');
  const [asgStart, setAsgStart] = useState('2026-07-01');
  const [asgEnd, setAsgEnd] = useState('2026-07-14');
  const [asgIsTemp, setAsgIsTemp] = useState(false);
  const [asgExcType, setAsgExcType] = useState('REEMPLAZAR');

  // 4. ROSTER GRID STATE (14 días: del 1 al 14 de Julio de 2026)
  const rosterDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date('2026-07-01T00:00:00');
    d.setDate(d.getDate() + i);
    return d;
  });

  const [roster, setRoster] = useState({
    'Juan Pérez': { department: 'Operaciones', cycleId: 'CYC-ROT-02', shifts: ['DF1', 'LIB', 'NOC', 'LIB', 'DF1', 'LIB', 'NOC', 'LIB', 'DF1', 'LIB', 'NOC', 'LIB', 'DF1', 'LIB'] },
    'María Gómez': { department: 'Operaciones', cycleId: 'CYC-ROT-02', shifts: ['DF1', 'LIB', 'NOC', 'LIB', 'G24', 'LIB', 'NOC', 'LIB', 'DF1', 'LIB', 'NOC', 'LIB', 'DF1', 'LIB'] }, // 4 de Julio (Index 3) tiene G24 como excepción temporal
    'Carlos Díaz': { department: 'TI y Sistemas', cycleId: 'CYC-SEM-01', shifts: ['DF1', 'DF1', 'DF1', 'DF1', 'DF1', 'LIB', 'LIB', 'DF1', 'DF1', 'DF1', 'DF1', 'DF1', 'LIB', 'LIB'] },
    'Lucía Fernández': { department: 'TI y Sistemas', cycleId: 'CYC-ROT-03', shifts: ['G24', 'LIB', 'LIB', 'G24', 'LIB', 'LIB', 'G24', 'LIB', 'LIB', 'G24', 'LIB', 'LIB', 'G24', 'LIB'] },
    'Roberto Méndez': { department: 'Logística', cycleId: 'CYC-ROT-02', shifts: ['LIB', 'NOC', 'LIB', 'DF1', 'LIB', 'NOC', 'LIB', 'DF1', 'LIB', 'NOC', 'LIB', 'DF1', 'LIB', 'NOC'] },
    'Camila Silva': { department: 'Experiencia del Cliente', cycleId: null, shifts: Array(14).fill('SIN_ASIGNAR') }, // Empleado Sin Asignar para alertas
    'Alejandro Ruiz': { department: 'Experiencia del Cliente', cycleId: null, shifts: Array(14).fill('SIN_ASIGNAR') } // Empleado Sin Asignar
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterUnassigned, setFilterUnassigned] = useState(false);

  // Popover selector de celda
  const [activeCell, setActiveCell] = useState(null); // { employee, dayIndex }

  // Simulación del Algoritmo de Autoprogramación
  const [autoScheduling, setAutoScheduling] = useState(false);
  const [schedulerLogs, setSchedulerLogs] = useState([]);
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);

  const handleRunAutoScheduler = () => {
    setAutoScheduling(true);
    setSchedulerLogs([]);
    setShowSchedulerModal(true);

    const logSteps = [
      '🔍 Buscando empleados en el roster con estatus "SIN ASIGNAR"...',
      '🤖 Detectados: Camila Silva, Alejandro Ruiz.',
      '📋 Evaluando configuraciones de sucursal y contratos vigentes...',
      '🛠️ Aplicando ciclo predeterminado "CYC-SEM-01" (Semanal Estándar) al departamento de Experiencia del Cliente.',
      '⚖️ Validando límites de descanso obligatorio (mínimo 12h entre jornadas)...',
      '✔️ Comprobando que no existan colisiones de turnos nocturnos contiguos...',
      '📈 Generando cuadrante de 14 días para el personal detectado...',
      '💾 Escribiendo firmas criptográficas del nuevo cuadrante en el libro...'
    ];

    logSteps.forEach((step, index) => {
      setTimeout(() => {
        setSchedulerLogs(prev => [...prev, step]);
        if (index === logSteps.length - 1) {
          // Completar la asignación en el Roster State
          const updatedRoster = { ...roster };
          updatedRoster['Camila Silva'] = {
            ...updatedRoster['Camila Silva'],
            cycleId: 'CYC-SEM-01',
            shifts: ['DF1', 'DF1', 'DF1', 'DF1', 'DF1', 'LIB', 'LIB', 'DF1', 'DF1', 'DF1', 'DF1', 'DF1', 'LIB', 'LIB']
          };
          updatedRoster['Alejandro Ruiz'] = {
            ...updatedRoster['Alejandro Ruiz'],
            cycleId: 'CYC-SEM-01',
            shifts: ['DF1', 'DF1', 'DF1', 'DF1', 'DF1', 'LIB', 'LIB', 'DF1', 'DF1', 'DF1', 'DF1', 'DF1', 'LIB', 'LIB']
          };

          setRoster(updatedRoster);
          setAutoScheduling(false);
          onAddAuditLog(
            'Algoritmo Auto-Scheduler', 
            'AUTO_PROGRAMACION_ROSTER', 
            'DEPARTAMENTO_CLIENT_EXPERIENCE', 
            'SIN_ASIGNAR', 
            'CYC-SEM-01', 
            'Lanzado asistente de autoprogramación inteligente. Asignados Camila Silva y Alejandro Ruiz a ciclo Semanal Administrativo.'
          );
        }
      }, (index + 1) * 800);
    });
  };

  // Crear nuevo horario
  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!schCode || !schName) return;

    let bg = 'bg-blue-100 text-blue-800 border-blue-200';
    if (schColor === 'purple') bg = 'bg-purple-100 text-purple-800 border-purple-200';
    if (schColor === 'slate') bg = 'bg-slate-800 text-white border-slate-700';
    if (schColor === 'emerald') bg = 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (schColor === 'amber') bg = 'bg-amber-100 text-amber-800 border-amber-200';

    const newSch = {
      id: `SCH-USER-${Math.floor(100 + Math.random() * 900)}`,
      code: schCode.toUpperCase(),
      name: schName,
      type: schType,
      startTime: schType === 'FLEXIBLE' || schType === 'DESCANSO' ? 'Flexible' : schStart,
      endTime: schType === 'FLEXIBLE' || schType === 'DESCANSO' ? 'Flexible' : schEnd,
      checkInStart: schCheckInStart,
      checkInEnd: schCheckInEnd,
      checkOutStart: schCheckOutStart,
      checkOutEnd: schCheckOutEnd,
      gracePeriod: schGrace,
      otThreshold: schOt,
      breakType: schBreakType,
      breakDuration: schBreakDur,
      targetHours: schType === 'FLEXIBLE' ? schTargetHrs : undefined,
      durationHours: schType === 'EXTENSO' ? schExtHours : undefined,
      bg
    };

    setScheduleCatalog([...scheduleCatalog, newSch]);
    onAddAuditLog(
      'Planificador RRHH', 
      'CREAR_HORARIO_AVANZADO', 
      newSch.code, 
      'NINGUNO', 
      newSch.name, 
      `Creado horario avanzado [${newSch.code}] del tipo ${newSch.type}. Reglas de checada y tolerancia activadas.`
    );

    setSchCode('');
    setSchName('');
    triggerSaveToast();
  };

  // Crear nuevo ciclo
  const handleAddCycle = (e) => {
    e.preventDefault();
    if (!cycName) return;

    const daysArr = cycDays.slice(0, cycType === 'SEMANAL' ? 7 : cycLength);
    const newCyc = {
      id: `CYC-USER-${Math.floor(100 + Math.random() * 900)}`,
      name: cycName,
      type: cycType,
      days: daysArr,
      desc: `Secuencia: ${daysArr.join(' ➔ ')}`
    };

    setShiftCycles([...shiftCycles, newCyc]);
    onAddAuditLog(
      'Planificador RRHH', 
      'CREAR_CICLO_HORARIO', 
      newCyc.id, 
      'NINGUNO', 
      newCyc.name, 
      `Registrado ciclo de turnos [${newCyc.id}] con patrón de ${daysArr.length} días.`
    );

    setCycName('');
    triggerSaveToast();
  };

  // Crear Asignación o Excepción
  const handleAddAssignment = (e) => {
    e.preventDefault();
    const newAsg = {
      id: `ASG-${Math.floor(300 + Math.random() * 600)}`,
      mode: asgMode,
      target: asgTarget,
      cycleId: asgCycleId,
      startDate: asgStart,
      endDate: asgEnd,
      isTemp: asgIsTemp,
      exceptionType: asgIsTemp ? asgExcType : undefined
    };

    setAssignments([...assignments, newAsg]);

    // Aplicar al Roster si el target es un empleado individual
    if (asgMode === 'EMPLEADO') {
      const emp = roster[asgTarget];
      if (emp) {
        const cycle = shiftCycles.find(c => c.id === asgCycleId);
        if (cycle) {
          const updatedShifts = [...emp.shifts];
          // Asignar el primer código de turno del ciclo al día de la excepción
          // (Para demostración asignamos el primer día del ciclo en los días indicados)
          const startIdx = Math.max(0, Math.floor((new Date(asgStart + 'T00:00:00') - new Date('2026-07-01T00:00:00')) / (1000 * 60 * 60 * 24)));
          const endIdx = Math.min(13, Math.floor((new Date(asgEnd + 'T00:00:00') - new Date('2026-07-01T00:00:00')) / (1000 * 60 * 60 * 24)));

          for (let i = startIdx; i <= endIdx; i++) {
            updatedShifts[i] = cycle.days[0];
          }

          setRoster({
            ...roster,
            [asgTarget]: {
              ...emp,
              cycleId: asgIsTemp ? emp.cycleId : asgCycleId, // Conservar el recurrente si es temporal
              shifts: updatedShifts
            }
          });
        }
      }
    }

    onAddAuditLog(
      'Planificador RRHH', 
      asgIsTemp ? 'REGISTRAR_EXCEPCION_TEMPORAL' : 'ASIGNAR_CICLO_ROSTER', 
      newAsg.id, 
      'VACIO', 
      asgTarget, 
      `Asignado ciclo ${asgCycleId} a ${asgTarget} del ${asgStart} al ${asgEnd}. Excepción temporal: ${asgIsTemp ? 'SÍ' : 'NO'}`
    );

    triggerSaveToast();
  };

  // Sobrescribir turno en celda
  const handleCellOverride = (code) => {
    if (!activeCell) return;
    const { employee, dayIndex } = activeCell;

    const previousCode = roster[employee].shifts[dayIndex];
    const updatedShifts = [...roster[employee].shifts];
    updatedShifts[dayIndex] = code;

    setRoster({
      ...roster,
      [employee]: {
        ...roster[employee],
        shifts: updatedShifts
      }
    });

    onAddAuditLog(
      'Supervisor de Turno', 
      'CORRECCION_SOBREESCRITURA_ROSTER', 
      `${employee}_JULIO_${dayIndex + 1}`, 
      previousCode, 
      code, 
      `Modificado cuadrante manual de ${employee} el día ${dayIndex + 1} de Julio de [${previousCode}] a [${code}].`
    );

    setActiveCell(null);
  };

  const getShiftBadgeStyle = (code) => {
    if (code === 'SIN_ASIGNAR') return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-bold text-[9px] px-1';
    const shift = scheduleCatalog.find(s => s.code === code);
    return shift ? shift.bg : 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const [showToast, setShowToast] = useState(false);
  const triggerSaveToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Filtrado de Roster
  const filteredRosterKeys = Object.keys(roster).filter(empName => {
    const emp = roster[empName];
    const matchesSearch = empName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'ALL' || emp.department === filterDept;
    const matchesUnassigned = !filterUnassigned || emp.cycleId === null;
    return matchesSearch && matchesDept && matchesUnassigned;
  });

  return (
    <div className="space-y-6 relative animate-in fade-in duration-300">
      
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold border border-slate-800">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>Configuración guardada y auditada correctamente</span>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orquestador de Turnos y Calendarios</h1>
          <p className="text-slate-500 mt-1">Biblioteca de horarios fijos, flexibles, rotativos y de descanso. Asignaciones masivas y excepciones temporales.</p>
        </div>

        {/* Sub Navegación (Estilo BioTime Pro) */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 shadow-inner">
          {[
            { label: 'Roster Operativo', val: 'ROSTER', icon: Calendar },
            { label: 'Biblioteca Horarios', val: 'HORARIOS', icon: Sliders },
            { label: 'Ciclos de Turnos', val: 'CICLOS', icon: RotateCcw },
            { label: 'Asignador & Excepciones', val: 'ASIGNADOR', icon: ArrowRightLeft }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.val}
                onClick={() => setSubTab(tab.val)}
                className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  subTab === tab.val
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                    : 'hover:text-slate-900'
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB: ROSTER PLANIFICACIÓN */}
      {subTab === 'ROSTER' && (
        <div className="space-y-6">
          
          {/* Barra de Controles y Filtros */}
          <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm justify-between items-center">
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Buscador */}
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Buscar colaborador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-semibold"
                />
              </div>

              {/* Filtro Departamento */}
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 font-semibold focus:outline-none focus:ring-2"
              >
                <option value="ALL">Todos los Departamentos</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Checkbox Sin Turno */}
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer select-none border border-slate-200 px-3 py-2 rounded-lg bg-slate-50/50 hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={filterUnassigned}
                  onChange={(e) => setFilterUnassigned(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span className="text-rose-600 flex items-center gap-1">
                  <AlertCircle size={13} /> Mostrar Solo Sin Asignación
                </span>
              </label>
            </div>

            {/* Asignación Inteligente */}
            <button
              onClick={handleRunAutoScheduler}
              className="w-full lg:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} className="animate-pulse" /> Autoprogramar Personal Sin Turno
            </button>

          </div>

          {/* Tabla del Cuadrante */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-center">
                    <th className="py-4 px-4 text-left font-bold" style={{ minWidth: '170px' }}>Empleado</th>
                    <th className="py-4 px-2 font-bold" style={{ minWidth: '140px' }}>Ciclo Activo / Recurrente</th>
                    {rosterDays.map((day, i) => (
                      <th key={i} className="py-4 px-1 border-l text-center font-bold" style={{ minWidth: '52px' }}>
                        <div className="font-mono text-slate-700">{day.getDate()}</div>
                        <div className="text-[9px] font-medium text-slate-400 uppercase">{day.toLocaleString('es-ES', { weekday: 'short' }).substring(0,3)}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                  {filteredRosterKeys.length === 0 ? (
                    <tr>
                      <td colSpan={16} className="text-center py-8 text-slate-400 font-medium">
                        Ningún colaborador coincide con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredRosterKeys.map((empName) => {
                      const emp = roster[empName];
                      const activeCyc = shiftCycles.find(c => c.id === emp.cycleId);
                      return (
                        <tr key={empName} className="hover:bg-slate-50/30">
                          {/* Colaborador */}
                          <td className="py-4 px-4">
                            <div>
                              <span className="font-bold text-slate-800 block text-xs">{empName}</span>
                              <span className="text-[10px] text-slate-400 block font-medium">{emp.department}</span>
                            </div>
                          </td>

                          {/* Estatus del Turno */}
                          <td className="py-4 px-2">
                            {emp.cycleId ? (
                              <span className="bg-indigo-50 border border-indigo-100/50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">
                                {activeCyc?.name.split(' ')[0] || 'Personalizado'}
                              </span>
                            ) : (
                              <span className="bg-rose-50 border border-rose-200 text-rose-600 px-2.5 py-0.5 rounded text-[10px] font-bold animate-pulse flex items-center gap-1 w-fit">
                                <AlertCircle size={10} /> SIN ASIGNAR
                              </span>
                            )}
                          </td>

                          {/* Días */}
                          {emp.shifts.map((code, idx) => {
                            const isSelected = activeCell && activeCell.employee === empName && activeCell.dayIndex === idx;
                            return (
                              <td
                                key={idx}
                                onClick={() => setActiveCell({ employee: empName, dayIndex: idx })}
                                className={`py-4 px-1 border-l text-center relative cursor-pointer hover:bg-indigo-50/40 transition-colors ${
                                  isSelected ? 'bg-indigo-50 ring-2 ring-indigo-500/20' : ''
                                }`}
                              >
                                <span className={`w-9 py-1 rounded font-bold font-mono text-[10px] inline-block border text-center ${getShiftBadgeStyle(code)}`}>
                                  {code === 'SIN_ASIGNAR' ? 'S/A' : code}
                                </span>

                                {/* Popover de sobreescritura */}
                                {isSelected && (
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-2xl z-50 p-2 space-y-1.5 w-40 text-left animate-in fade-in duration-100">
                                    <div className="text-[9px] font-bold text-slate-400 uppercase text-center border-b pb-1">
                                      Modificar Turno
                                    </div>
                                    <div className="grid grid-cols-2 gap-1 text-[10px] font-bold">
                                      {scheduleCatalog.map((sc) => (
                                        <button
                                          key={sc.code}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCellOverride(sc.code);
                                          }}
                                          className={`py-1 rounded font-bold font-mono border hover:scale-105 transition-transform ${sc.bg}`}
                                          title={sc.name}
                                        >
                                          {sc.code}
                                        </button>
                                      ))}
                                    </div>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCellOverride('SIN_ASIGNAR');
                                      }}
                                      className="w-full text-center py-1 bg-slate-50 border border-slate-200 rounded text-[9px] font-bold hover:bg-slate-100 text-slate-500 cursor-pointer"
                                    >
                                      Remover Turno
                                    </button>
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Glosario de Horarios */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
            <span className="font-bold text-slate-700 uppercase">Leyenda de Horarios:</span>
            {scheduleCatalog.map((sc) => (
              <div key={sc.code} className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] border ${sc.bg}`}>{sc.code}</span>
                <span>{sc.name} ({sc.hours})</span>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* SUB-TAB: BIBLIOTECA DE HORARIOS */}
      {subTab === 'HORARIOS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulario nuevo Horario */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="text-indigo-500" size={18} />
              <h3 className="font-bold text-slate-800 text-sm">Configurador de Horarios</h3>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-4 text-xs font-semibold text-slate-600">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500">Tipo de Horario</label>
                  <select
                    value={schType}
                    onChange={(e) => setSchType(e.target.value)}
                    className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 w-full"
                  >
                    <option value="FIJO">Fijo (Normal)</option>
                    <option value="FLEXIBLE">Flexible (Acumulación)</option>
                    <option value="NOCTURNO">Nocturno Cruzado (+1)</option>
                    <option value="EXTENSO">Jornada Extensa (24h+)</option>
                    <option value="DESCANSO">Día Libre / Descanso</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-slate-500">Código Corto</label>
                  <input
                    type="text" required placeholder="Ej: DF2" value={schCode}
                    onChange={(e) => setSchCode(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500">Nombre del Perfil Horario</label>
                <input
                  type="text" required placeholder="Ej: Turno Tarde Operarios" value={schName}
                  onChange={(e) => setSchName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Parámetros condicionales por tipo */}
              {schType === 'FIJO' || schType === 'NOCTURNO' ? (
                <div className="space-y-3.5 bg-slate-50 p-3 rounded-lg border">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-slate-500">Hora de Entrada</label>
                      <input type="time" value={schStart} onChange={(e) => setSchStart(e.target.value)} className="w-full px-2 py-1.5 border rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-500">Hora de Salida</label>
                      <input type="time" value={schEnd} onChange={(e) => setSchEnd(e.target.value)} className="w-full px-2 py-1.5 border rounded" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 border-t pt-2.5">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400">Inicio de Checada</label>
                      <input type="time" value={schCheckInStart} onChange={(e) => setSchCheckInStart(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400">Fin de Checada</label>
                      <input type="time" value={schCheckInEnd} onChange={(e) => setSchCheckInEnd(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" />
                    </div>
                  </div>
                </div>
              ) : null}

              {schType === 'FLEXIBLE' && (
                <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                  <div className="space-y-1">
                    <label className="block text-slate-500">Horas Objetivo del Día</label>
                    <input type="number" step="0.5" value={schTargetHrs} onChange={(e) => setSchTargetHrs(parseFloat(e.target.value))} className="w-full px-2 py-1.5 border rounded" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                    <span className="text-[10px] text-slate-500">Permitir Checadas Múltiples (Entradas/Salidas)</span>
                  </div>
                </div>
              )}

              {schType === 'EXTENSO' && (
                <div className="bg-slate-50 p-3 rounded-lg border space-y-1">
                  <label className="block text-slate-500">Duración del Turno Continuo</label>
                  <select value={schExtHours} onChange={(e) => setSchExtHours(parseInt(e.target.value))} className="w-full px-2 py-1.5 border rounded">
                    <option value={24}>24 Horas</option>
                    <option value={36}>36 Horas</option>
                    <option value={48}>48 Horas</option>
                    <option value={72}>72 Horas</option>
                  </select>
                </div>
              )}

              {/* Tolerancias */}
              {schType !== 'DESCANSO' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-500">Gracia de Retraso (m)</label>
                    <input type="number" value={schGrace} onChange={(e) => setSchGrace(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500">Límite H. Extras (m)</label>
                    <input type="number" value={schOt} onChange={(e) => setSchOt(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg" />
                  </div>
                </div>
              )}

              {/* Configuración de Almuerzo */}
              {schType !== 'DESCANSO' && (
                <div className="bg-slate-50 p-3 rounded-lg border space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Regla de Almuerzo/Comida</span>
                    <select value={schBreakType} onChange={(e) => setSchBreakType(e.target.value)} className="text-[10px] border rounded px-1.5 py-0.5 bg-white">
                      <option value="AUTOMATICO">Automático</option>
                      <option value="REGISTRADO">Checada Requerida</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-slate-400">Duración del Almuerzo (minutos)</label>
                    <input type="number" value={schBreakDur} onChange={(e) => setSchBreakDur(parseInt(e.target.value))} className="w-full px-2 py-1 border rounded" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="space-y-1">
                  <label className="block text-slate-500">Color Tag</label>
                  <select value={schColor} onChange={(e) => setSchColor(e.target.value)} className="w-full px-2 py-1.5 border rounded-lg">
                    <option value="blue">Azul</option>
                    <option value="purple">Púrpura</option>
                    <option value="slate">Slate</option>
                    <option value="emerald">Verde</option>
                    <option value="amber">Ámbar</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus size={14} /> Registrar Horario
                </button>
              </div>

            </form>
          </div>

          {/* Listado de la Biblioteca */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
              <Layers size={18} className="text-violet-500" />
              Biblioteca de Horarios Registrados
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {scheduleCatalog.map((sch) => (
                <div key={sch.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3.5 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${sch.bg}`}>
                        {sch.code}
                      </span>
                      <h4 className="font-bold text-slate-800 text-xs mt-1.5">{sch.name}</h4>
                    </div>
                    <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">
                      {sch.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[9px]">JORNADA</span>
                      {sch.type === 'FIJO' || sch.type === 'NOCTURNO' ? (
                        <span className="text-slate-700 font-bold">{sch.startTime} - {sch.endTime}</span>
                      ) : sch.type === 'FLEXIBLE' ? (
                        <span className="text-slate-700 font-bold">{sch.targetHours}h Acumulativas</span>
                      ) : sch.type === 'EXTENSO' ? (
                        <span className="text-slate-700 font-bold">{sch.durationHours}h Continuas</span>
                      ) : (
                        <span className="text-slate-700 font-bold">Sin Labores</span>
                      )}
                    </div>

                    {sch.type !== 'DESCANSO' ? (
                      <div>
                        <span className="text-slate-400 block text-[9px]">ALMUERZO ({sch.breakType})</span>
                        <span className="text-slate-700 font-bold">{sch.breakDuration} minutos</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-slate-400 block text-[9px]">RECARGO TRABAJO</span>
                        <span className="text-emerald-700 font-bold">{sch.otMultiplier}x Tarifa Base</span>
                      </div>
                    )}
                  </div>

                  {sch.type !== 'DESCANSO' && (
                    <div className="bg-white p-2 rounded border border-slate-100 text-[9.5px] text-slate-400 font-semibold leading-relaxed">
                      {sch.type === 'FIJO' || sch.type === 'NOCTURNO' ? (
                        <span>Márgenes entrada: <code className="font-mono text-slate-700 font-bold">{sch.checkInStart}-{sch.checkInEnd}</code> &bull; Gracia: {sch.gracePeriod}m</span>
                      ) : (
                        <span>Límite de checadas: múltiples permitidas &bull; Sincronización en tiempo real</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB: CICLOS DE TURNOS */}
      {subTab === 'CICLOS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Creador de Ciclos */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <RotateCcw className="text-indigo-500" size={18} />
              <h3 className="font-bold text-slate-800 text-sm">Creador de Ciclos</h3>
            </div>

            <form onSubmit={handleAddCycle} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1">
                <label className="block text-slate-500">Nombre del Ciclo Rotativo</label>
                <input
                  type="text" required placeholder="Ej: Roster 24x48 Continuo" value={cycName}
                  onChange={(e) => setCycName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500">Tipo de Rotación</label>
                <select
                  value={cycType}
                  onChange={(e) => handleTypeChange(e.target.value)}
                  className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 cursor-pointer"
                >
                  <option value="SEMANAL">Semanal (7 días recurrentes)</option>
                  <option value="CUSTOM">Customizado (N-días)</option>
                </select>
              </div>

              {cycType === 'CUSTOM' && (
                <div className="space-y-1 animate-in fade-in duration-200">
                  <label className="block text-slate-500">Duración del Ciclo (Días)</label>
                  <input
                    type="number" 
                    min="1" 
                    max="14" 
                    value={cycLength}
                    onChange={(e) => handleLengthChange(parseInt(e.target.value) || 4)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-1 text-slate-700 font-bold"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-slate-500">Secuencia de Horarios por Día</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-slate-50">
                  {Array.from({ length: cycType === 'SEMANAL' ? 7 : cycLength }).map((_, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-xs flex flex-col gap-1">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Día {idx + 1}</span>
                      <select
                        value={cycDays[idx] || 'LIB'}
                        onChange={(e) => {
                          const updated = [...cycDays];
                          updated[idx] = e.target.value;
                          setCycDays(updated);
                        }}
                        className="w-full text-[11px] font-bold text-slate-700 bg-transparent border-none p-0 focus:outline-none focus:ring-0 cursor-pointer"
                      >
                        {scheduleCatalog.map(sc => (
                          <option key={sc.code} value={sc.code}>
                            {sc.code} ({sc.startTime})
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Registrar Ciclo Rotativo
              </button>
            </form>
          </div>

          {/* Listado de Ciclos */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100">Ciclos y Secuencias Activas</h3>
            
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {shiftCycles.map((cyc) => (
                <div key={cyc.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-slate-800">
                    <div>
                      <h4 className="font-bold text-xs">{cyc.name}</h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{cyc.desc}</span>
                    </div>
                    <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-bold">
                      {cyc.type} ({cyc.days.length} Días)
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    {cyc.days.map((code, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <div className="flex flex-col items-center">
                          <span className="text-[8px] text-slate-400 font-bold">DÍA {idx + 1}</span>
                          <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${getShiftBadgeStyle(code)}`}>
                            {code}
                          </span>
                        </div>
                        {idx < cyc.days.length - 1 && (
                          <span className="text-slate-300 font-bold self-end mb-1">➔</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB: ASIGNADOR & EXCEPCIONES */}
      {subTab === 'ASIGNADOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulario Asignador */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ArrowRightLeft className="text-indigo-500" size={18} />
              <h3 className="font-bold text-slate-800 text-sm">Asignar de Roster</h3>
            </div>

            <form onSubmit={handleAddAssignment} className="space-y-4 text-xs font-semibold text-slate-600">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500">Modo de Asignación</label>
                  <select
                    value={asgMode}
                    onChange={(e) => setAsgMode(e.target.value)}
                    className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 w-full"
                  >
                    <option value="DEPARTAMENTO">Por Departamento</option>
                    <option value="EMPLEADO">Por Empleado Individual</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-slate-500">Destinatario</label>
                  {asgMode === 'DEPARTAMENTO' ? (
                    <select
                      value={asgTarget}
                      onChange={(e) => setAsgTarget(e.target.value)}
                      className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 w-full"
                    >
                      {departments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={asgTarget}
                      onChange={(e) => setAsgTarget(e.target.value)}
                      className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 w-full"
                    >
                      {Object.keys(roster).map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500">Ciclo Rotativo a Aplicar</label>
                <select
                  value={asgCycleId}
                  onChange={(e) => setAsgCycleId(e.target.value)}
                  className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 w-full"
                >
                  {shiftCycles.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500">Fecha de Inicio</label>
                  <input
                    type="date" required value={asgStart}
                    onChange={(e) => setAsgStart(e.target.value)}
                    className="w-full px-2.5 py-2 border rounded-lg focus:ring-1"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500">Fecha de Fin</label>
                  <input
                    type="date" required value={asgEnd}
                    onChange={(e) => setAsgEnd(e.target.value)}
                    className="w-full px-2.5 py-2 border rounded-lg focus:ring-1"
                  />
                </div>
              </div>

              {/* Excepción Temporal */}
              <div className="bg-slate-50 p-3 rounded-lg border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">¿Es Excepción Temporal?</span>
                  <input
                    type="checkbox"
                    checked={asgIsTemp}
                    onChange={(e) => setAsgIsTemp(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                </div>
                
                {asgIsTemp && (
                  <div className="space-y-1 border-t pt-2.5">
                    <label className="block text-[10px] text-slate-400">Modo de Excepción</label>
                    <select
                      value={asgExcType}
                      onChange={(e) => setAsgExcType(e.target.value)}
                      className="w-full px-1.5 py-1 border rounded text-[11px]"
                    >
                      <option value="REEMPLAZAR">Reemplazar Horario Existente</option>
                      <option value="DOBLETE">Turno Adicional (Doblete en el Día)</option>
                    </select>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Aplicar Planificación
              </button>

            </form>
          </div>

          {/* Listado de Asignaciones y Excepciones */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100">Historial de Planificaciones y Excepciones Activas</h3>
            
            <div className="overflow-hidden border border-slate-100 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="py-2.5 px-4">Destinatario</th>
                    <th className="py-2.5 px-4">Ciclo</th>
                    <th className="py-2.5 px-4 font-mono">Vigencia</th>
                    <th className="py-2.5 px-4">Tipo</th>
                    <th className="py-2.5 px-4 text-right">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                  {assignments.map((asg) => {
                    const cycle = shiftCycles.find(c => c.id === asg.cycleId);
                    return (
                      <tr key={asg.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-4">
                          <div>
                            <span className="font-bold text-slate-800 block">{asg.target}</span>
                            <span className="text-[9px] text-slate-400 block font-medium">{asg.mode}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-indigo-600">{cycle?.name.split(' ')[0] || 'Desconocido'}</td>
                        <td className="py-2.5 px-4 font-mono">{asg.startDate} al {asg.endDate}</td>
                        <td className="py-2.5 px-4">
                          {asg.isTemp ? (
                            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded font-bold uppercase">
                              EXCEPCIÓN ({asg.exceptionType})
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-600 border px-2 py-0.5 rounded font-bold uppercase">
                              RECURRENTE
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <span className="text-emerald-600 font-bold flex items-center justify-end gap-1 text-[11px]">
                            <CheckCircle size={12} /> Vigente
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* MODAL SIMULADOR AUTOMÁTICO */}
      {showSchedulerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 text-indigo-300 w-full max-w-xl rounded-xl border border-slate-800 shadow-2xl p-5 space-y-4 font-mono text-xs max-h-[460px] flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <Sparkles size={14} className="animate-spin" />
                ASISTENTE DE AUTOPROGRAMACIÓN KRONO ENGINE
              </span>
              <button 
                onClick={() => setShowSchedulerModal(false)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Consola */}
            <div className="flex-1 overflow-y-auto space-y-2.5 bg-slate-900/40 p-4 rounded-lg border border-slate-900/80 shadow-inner h-64">
              {schedulerLogs.map((log, index) => (
                <div key={index} className="flex gap-2 items-start animate-in fade-in duration-200">
                  <span className="text-slate-600 font-bold">&gt;</span>
                  <span className={log.includes('✔️') || log.includes('successfully') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                    {log}
                  </span>
                </div>
              ))}
              {autoScheduling && (
                <div className="flex items-center gap-2 text-indigo-400">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></span>
                  <span>Evaluando cuadrantes y restricciones...</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowSchedulerModal(false)}
                disabled={autoScheduling}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white rounded font-bold cursor-pointer disabled:cursor-not-allowed text-xs transition-all"
              >
                {autoScheduling ? 'Procesando Roster...' : 'Aplicar y Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
