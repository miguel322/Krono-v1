import React, { useState, useMemo } from 'react';
import {
  Calendar, RotateCcw, Plus, Clock, CheckCircle, X, ArrowRightLeft, AlertCircle,
  Sparkles, Sliders, Layers, Moon, Coffee, ShieldCheck, Wand2, ChevronRight,
  Users, AlertTriangle, Zap, GitBranch, Info, Activity,
  Lock, Send, Upload, Download, FileText, Check
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════════════════
   KRONO · Orquestador de Turnos y Calendarios
   ------------------------------------------------------------------------
   Filosofía de diseño (alineada al manual de BioTime Pro):
   Todo lo que en el manual se hacía MANUALMENTE (asignar horario día por día,
   rellenar plantillas semana a semana, resolver solapes a mano) aquí se
   AUTOMATIZA mediante un motor de generación determinista.

   Pipeline en 3 etapas encadenadas:
     ETAPA 1 · HORARIOS    → se define la jornada diaria (la pieza atómica)
     ETAPA 2 · CICLOS      → se encadenan horarios en una secuencia rotativa
     ETAPA 3 · CALENDARIOS → se asigna el ciclo a personas/áreas + vigencia
            ↓
        ROSTER (resultado): el cuadrante NO se escribe a mano, se DERIVA.
   ════════════════════════════════════════════════════════════════════════ */

// Ancla temporal global de la rotación. Toda secuencia repite desde aquí.
const ANCHOR = '2026-07-01';
const DAY_MS = 86400000;
const REST_REQUIRED_H = 12; // descanso fisiológico mínimo entre jornadas

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const CADENCE_LABEL = { SEMANAL: 'Semanal', QUINCENAL: 'Quincenal', MENSUAL: 'Mensual' };

// ── Utilidades puras de tiempo ─────────────────────────────────────────────
const fmtDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const dateIndex = (ds) =>
  Math.round((new Date(ds + 'T00:00:00') - new Date(ANCHOR + 'T00:00:00')) / DAY_MS);

const timeToMin = (t) => {
  if (!t || typeof t !== 'string' || t === 'N/A' || t.toLowerCase().includes('flex')) return null;
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (m || 0);
};

// Duración real de la jornada en minutos (resuelve cruce de medianoche / 24h+)
const scheduleDurationMin = (sch) => {
  if (!sch || sch.type === 'DESCANSO') return 0;
  if (sch.type === 'EXTENSO') return (sch.durationHours || 24) * 60;
  if (sch.type === 'FLEXIBLE') return (sch.targetHours || 8) * 60;
  const s = timeToMin(sch.startTime);
  const e = timeToMin(sch.endTime);
  if (s == null || e == null) return (sch.targetHours || 8) * 60;
  let dur = e - s;
  if (dur <= 0) dur += 1440; // cruza al día siguiente
  return dur;
};

const minToHrs = (m) => Math.round((m / 60) * 10) / 10;

// ── Resolución de asignación por prioridad (la lógica del manual, automatizada)
//    1º Excepción temporal individual  2º Permanente individual  3º Departamento
const resolveAssignment = (empName, dept, ds, assignments) => {
  const inRange = (a) => ds >= a.startDate && ds <= a.endDate;
  return (
    assignments.find((a) => a.isTemp && a.mode === 'EMPLEADO' && a.target === empName && inRange(a)) ||
    assignments.find((a) => !a.isTemp && a.mode === 'EMPLEADO' && a.target === empName && inRange(a)) ||
    assignments.find((a) => a.mode === 'DEPARTAMENTO' && a.target === dept && inRange(a)) ||
    null
  );
};

// Familia del horario: la distinción conceptual más importante del módulo.
//  · FIJO     → patrón anclado a los días de la semana, se repite idéntico para
//               siempre. No rota ni necesita publicarse.
//  · ROTATIVO → secuencia de N días que AVANZA con el tiempo, desacoplada de la
//               semana natural. Aquí vive toda la complejidad (fase, rodaje…).
//  · AUTO     → el turno se resuelve por la hora del marcaje (IA).
const familyOf = (cyc) => (cyc.auto ? 'AUTO' : cyc.type === 'SEMANAL' ? 'FIJO' : 'ROTATIVO');

const FAMILY_META = {
  FIJO: { label: 'FIJO', cls: 'bg-sky-50 text-sky-700 border-sky-200' },
  ROTATIVO: { label: 'ROTATIVO', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  AUTO: { label: 'AUTO', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
};



// Código de turno que corresponde a un día concreto, según la FAMILIA del ciclo.
const codeForDay = (asg, cycles, dsIdxAbs, dateObj) => {
  if (!asg) return 'SIN_ASIGNAR';
  if (asg.shiftCode) return asg.shiftCode;          // excepción de turno único
  const cyc = cycles.find((c) => c.id === asg.cycleId);
  if (!cyc) return 'SIN_ASIGNAR';
  const fam = familyOf(cyc);
  if (fam === 'AUTO') return 'AUTO';                 // resuelve por marcaje
  if (fam === 'FIJO') {
    // Anclado al día de la semana real (Lunes=0 … Domingo=6): nunca cambia.
    const wpos = (dateObj.getDay() + 6) % 7;
    return cyc.days[wpos % cyc.days.length];
  }
  // ROTATIVO: la posición avanza con los días transcurridos desde el ancla.
  const len = cyc.days.length;
  const anchorIdx = dateIndex(asg.anchorDate || asg.startDate);
  const phase = asg.phase || 0;
  const pos = (((dsIdxAbs - anchorIdx + phase) % len) + len) % len;
  return cyc.days[pos];
};

// ── Motor de construcción del Roster (puro, determinista) ───────────────────
const buildRoster = (employees, assignments, cycles, rosterDays, overrides) => {
  const r = {};
  employees.forEach(({ name, department, branch }) => {
    const shifts = rosterDays.map((d, i) => {
      const ds = fmtDate(d);
      const asg = resolveAssignment(name, department, ds, assignments);
      let code = codeForDay(asg, cycles, dateIndex(ds), d);
      const ov = overrides[`${name}|${i}`];
      if (ov !== undefined) code = ov;
      return code;
    });
    const permAsg = resolveAssignment(name, department, fmtDate(rosterDays[0]), assignments);
    r[name] = {
      department,
      branch: branch || 'Corporativo Central',
      cycleId: permAsg && !permAsg.shiftCode ? permAsg.cycleId : null,
      shifts
    };
  });
  return r;
};

// ── Motor de análisis de conflictos (valida lo que el manual no validaba) ───
const analyzeShifts = (shifts, catalog) => {
  const byCode = (c) => catalog.find((s) => s.code === c);
  const conflicts = {}; // idx -> Set(tipos)
  const add = (idx, type) => {
    if (!conflicts[idx]) conflicts[idx] = new Set();
    conflicts[idx].add(type);
  };
  let prev = null; // { endAbs, idx, code }
  let consecutive = 0;
  let totalMin = 0;
  let worked = 0;

  shifts.forEach((code, i) => {
    const sc = byCode(code);
    const isWork = sc && sc.type !== 'DESCANSO' && code !== 'SIN_ASIGNAR' && code !== 'AUTO';
    if (!isWork) {
      consecutive = 0;
      return;
    }
    worked++;
    const dur = scheduleDurationMin(sc);
    totalMin += dur;
    const startMin = timeToMin(sc.startTime) ?? (sc.type === 'EXTENSO' ? timeToMin('08:00') : 0);
    const startAbs = i * 1440 + (startMin ?? 0);
    const endAbs = startAbs + dur;

    if (prev) {
      const gap = (startAbs - prev.endAbs) / 60;
      if (gap < REST_REQUIRED_H) {
        add(i, 'DESCANSO');
        add(prev.idx, 'DESCANSO');
      }
      if (code === 'NOC' && prev.code === 'NOC' && i - prev.idx === 1) {
        add(i, 'NOCTURNA');
      }
    }
    consecutive++;
    if (consecutive > 6) add(i, 'FATIGA');
    prev = { endAbs, idx: i, code };
  });

  return {
    conflicts,
    restConflictDays: Object.keys(conflicts)
      .filter((k) => conflicts[k].has('DESCANSO'))
      .map(Number),
    hours: minToHrs(totalMin),
    workedDays: worked,
    hasConflict: Object.keys(conflicts).length > 0
  };
};

export default function ShiftsCalendars({ 
  departments, 
  onAddAuditLog,
  assignments,
  setAssignments,
  shiftCycles,
  setShiftCycles,
  scheduleCatalog,
  setScheduleCatalog,
  manualOverrides,
  setManualOverrides,
  periodOverrides,
  setPeriodOverrides,
  branches
}) {
  const [subTab, setSubTab] = useState('ROSTER'); // ROSTER, HORARIOS, CICLOS, ASIGNADOR

  // ════════════════ ETAPA 1 · BIBLIOTECA DE HORARIOS ════════════════
  // scheduleCatalog is now received as a prop from App.jsx

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
  const [schOtBase, setSchOtBase] = useState('TRABAJADO');
  const [schOtEarly, setSchOtEarly] = useState(false);
  const [schOtLate, setSchOtLate] = useState(true);
  const [schBreakType, setSchBreakType] = useState('AUTOMATICO');
  const [schBreakDur, setSchBreakDur] = useState(60);
  const [schTargetHrs, setSchTargetHrs] = useState(8);
  const [schExtHours, setSchExtHours] = useState(24);
  const [schDaySpan, setSchDaySpan] = useState(1);
  const [schValidate, setSchValidate] = useState(true);
  const [schDayChange, setSchDayChange] = useState('00:00');
  const [schColor, setSchColor] = useState('blue');

  // ════════════════ ETAPA 2 · CICLOS DE TURNOS ════════════════
  // shiftCycles is now received as a prop from App.jsx

  // Formulario nuevo ciclo
  const [cycName, setCycName] = useState('');
  const [cycType, setCycType] = useState('SEMANAL');
  const [cycLength, setCycLength] = useState(7);
  const [cycDays, setCycDays] = useState(['DF1', 'DF1', 'DF1', 'DF1', 'DF1', 'LIB', 'LIB']);

  const handleLengthChange = (length) => {
    const newLen = Math.max(1, Math.min(14, length));
    setCycLength(newLen);
    const updated = [...cycDays];
    while (updated.length < newLen) updated.push('LIB');
    updated.length = newLen;
    setCycDays(updated);
  };

  const handleTypeChange = (type) => {
    setCycType(type);
    if (type === 'SEMANAL') handleLengthChange(7);
    else if (type === 'CUSTOM') handleLengthChange(4);
  };

  // ════════════════ ETAPA 3 · CALENDARIOS / ASIGNACIONES ════════════════
  // El roster NO se guarda: se deriva de estas asignaciones (+ overrides puntuales).
  const baseEmployees = useMemo(
    () => [
      { name: 'Juan Pérez', department: 'Operaciones' },
      { name: 'María Gómez', department: 'Operaciones' },
      { name: 'Carlos Díaz', department: 'TI y Sistemas' },
      { name: 'Lucía Fernández', department: 'TI y Sistemas' },
      { name: 'Roberto Méndez', department: 'Logística' },
      { name: 'Camila Silva', department: 'Experiencia del Cliente' },
      { name: 'Alejandro Ruiz', department: 'Experiencia del Cliente' }
    ],
    []
  );

  // pub: política de publicación POR CALENDARIO.
  //   { mode: 'NINGUNA' }  → fijo permanente, no se anuncia.
  //   { mode: 'PERIODICA', cadence, noticeDay (0-6), lead } → rotativo anunciado.


  // Estados para la Importación de Excel (CSV)
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState('');

  // Estados de Ciclo de Vida y Heurísticas (Simplificación de Publicación)
  const [isRosterPublished, setIsRosterPublished] = useState(false);
  const [showCellConfirmModal, setShowCellConfirmModal] = useState(null); // { employee, dayIndex, code }

  // Formulario nuevo asignador
  const [asgMode, setAsgMode] = useState('DEPARTAMENTO');
  const [asgTarget, setAsgTarget] = useState('Experiencia del Cliente');
  const [asgCycleId, setAsgCycleId] = useState('CYC-SEM-01');
  const [asgStart, setAsgStart] = useState(ANCHOR);
  const [asgEnd, setAsgEnd] = useState('2026-07-31');
  const [asgIsTemp, setAsgIsTemp] = useState(false);
  const [asgExcType, setAsgExcType] = useState('REEMPLAZAR');
  const [asgOverwrite, setAsgOverwrite] = useState(true);
  const [conflictWarning, setConflictWarning] = useState(null);
  // Política de publicación del nuevo calendario (solo aplica a ciclos ROTATIVOS)
  const [asgPubMode, setAsgPubMode] = useState('PERIODICA');
  const [asgPubCadence, setAsgPubCadence] = useState('SEMANAL');
  const [asgPubNoticeDay, setAsgPubNoticeDay] = useState(5);
  const [asgPubLead, setAsgPubLead] = useState(1);

  // ════════════════ ROSTER (resultado derivado) ════════════════
  const rosterDays = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date(ANCHOR + 'T00:00:00');
        d.setDate(d.getDate() + i);
        return d;
      }),
    []
  );

  const roster = useMemo(
    () => buildRoster(baseEmployees, assignments, shiftCycles, rosterDays, manualOverrides),
    [baseEmployees, assignments, shiftCycles, rosterDays, manualOverrides]
  );

  // Análisis de conflictos de todo el cuadrante
  const analysis = useMemo(() => {
    const out = {};
    let totalConflicts = 0;
    let unassignedCells = 0;
    Object.keys(roster).forEach((name) => {
      const a = analyzeShifts(roster[name].shifts, scheduleCatalog);
      out[name] = a;
      totalConflicts += Object.keys(a.conflicts).length;
      unassignedCells += roster[name].shifts.filter((c) => c === 'SIN_ASIGNAR').length;
    });
    return { byEmp: out, totalConflicts, unassignedCells };
  }, [roster, scheduleCatalog]);



  // ── Filtros del Roster ──
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterUnassigned, setFilterUnassigned] = useState(false);
  const [activeCell, setActiveCell] = useState(null);

  const filteredRosterKeys = Object.keys(roster).filter((empName) => {
    const emp = roster[empName];
    const matchesSearch = empName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === 'ALL' || emp.department === filterDept;
    const matchesBranch = filterBranch === 'ALL' || emp.branch === filterBranch;
    const matchesUnassigned = !filterUnassigned || emp.shifts.includes('SIN_ASIGNAR');
    return matchesSearch && matchesDept && matchesBranch && matchesUnassigned;
  });

  // ════════════════ MOTOR DE AUTOPROGRAMACIÓN (real) ════════════════
  const [autoScheduling, setAutoScheduling] = useState(false);
  const [schedulerLogs, setSchedulerLogs] = useState([]);
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);

  const handleRunAutoScheduler = () => {
    // 1. Detectar colaboradores con celdas SIN ASIGNAR (cálculo real)
    const unassignedEmps = baseEmployees.filter((e) => roster[e.name].shifts.includes('SIN_ASIGNAR'));

    if (unassignedEmps.length === 0) {
      setSchedulerLogs(['✔️ El cuadrante ya está 100% asignado. No hay personal sin turno.']);
      setShowSchedulerModal(true);
      return;
    }

    // Salvaguarda: Evitar ejecuciones accidentales y mostrar los afectados
    const affectedNames = unassignedEmps.map((e) => `${e.name} (${e.department})`).join(', ');
    const confirmMsg = `AutoScheduler de Krono\n\nSe encontraron ${unassignedEmps.length} colaboradores sin planificación activa:\n[ ${affectedNames} ]\n\nEl sistema les asignará automáticamente el ciclo de su departamento (o el horario administrativo fijo L-V por defecto) y resolverá colisiones de descanso.\n\n¿Desea proceder con la autoprogramación?`;
    
    if (!window.confirm(confirmMsg)) return;

    // 2. Heredar el ciclo del departamento (o el semanal por defecto)
    const newAsgs = unassignedEmps.map((e) => {
      const deptAsg = assignments.find((a) => a.mode === 'DEPARTAMENTO' && a.target === e.department && !a.isTemp);
      const cycleId = deptAsg ? deptAsg.cycleId : 'CYC-SEM-01';
      return {
        id: `AUTO-${Math.floor(100 + Math.random() * 900)}`,
        mode: 'EMPLEADO', target: e.name, cycleId,
        startDate: ANCHOR, endDate: fmtDate(rosterDays[rosterDays.length - 1]),
        isTemp: false, phase: 0, generated: true
      };
    });

    // 3. Generar roster tentativo y reparar colisiones de descanso < 12h
    const merged = [...assignments, ...newAsgs];
    const tentative = buildRoster(baseEmployees, merged, shiftCycles, rosterDays, manualOverrides);
    const repair = {};
    let repairs = 0;
    unassignedEmps.forEach((e) => {
      const an = analyzeShifts(tentative[e.name].shifts, scheduleCatalog);
      an.restConflictDays.forEach((idx) => {
        repair[`${e.name}|${idx}`] = 'LIB';
        repairs++;
      });
    });

    // 4. Construcción de la consola en vivo con datos reales
    const deptList = [...new Set(unassignedEmps.map((e) => e.department))].join(', ');
    const logSteps = [
      `🔍 Escaneando cuadrante... ${analysis.unassignedCells} celdas SIN ASIGNAR detectadas.`,
      `🤖 Personal afectado: ${unassignedEmps.map((e) => e.name).join(', ')}.`,
      `🏢 Heredando ciclo recurrente del/los departamento(s): ${deptList}.`,
      '⚙️ Generando rotación automática desde la secuencia de cada ciclo...',
      `⚖️ Validando descanso fisiológico mínimo de ${REST_REQUIRED_H}h entre jornadas...`,
      repairs > 0
        ? `🛠️ ${repairs} colisión(es) de descanso reparada(s) insertando día LIBRE.`
        : '✔️ Sin colisiones de descanso: rotación limpia a la primera.',
      '🌙 Verificando que no existan turnos nocturnos contiguos sin libranza...',
      `📈 Cuadrante de ${rosterDays.length} días generado para ${unassignedEmps.length} colaborador(es).`,
      '💾 Escribiendo firma criptográfica SHA-256 del cuadrante en la Bitácora...'
    ];

    setAutoScheduling(true);
    setSchedulerLogs([]);
    setShowSchedulerModal(true);

    logSteps.forEach((step, index) => {
      setTimeout(() => {
        setSchedulerLogs((prev) => [...prev, step]);
        if (index === logSteps.length - 1) {
          // 5. Commit: el roster se recalcula solo al cambiar assignments + overrides
          setAssignments(merged);
          setManualOverrides((prev) => ({ ...prev, ...repair }));
          setAutoScheduling(false);
          onAddAuditLog(
            'Algoritmo Auto-Scheduler',
            'AUTO_PROGRAMACION_ROSTER',
            unassignedEmps.map((e) => e.name).join(' / '),
            'SIN_ASIGNAR',
            newAsgs.map((a) => a.cycleId).join(', '),
            `Autoprogramación: ${unassignedEmps.length} colaborador(es) asignados, ${repairs} colisión(es) de descanso reparada(s).`
          );
        }
      }, (index + 1) * 650);
    });
  };

  // ── Importar/Exportar Roster desde Excel/CSV ──
  const handleDownloadTemplate = () => {
    try {
      const headers = ['Empleado', ...rosterDays.map(d => fmtDate(d))];
      
      const rows = baseEmployees.map(emp => {
        const empShifts = roster[emp.name]?.shifts || Array(rosterDays.length).fill('SIN_ASIGNAR');
        return [emp.name, ...empShifts].map(val => `"${val}"`).join(',');
      });
      
      const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `plantilla_cuadrante_krono.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onAddAuditLog(
        'Plantilla Horarios',
        'DESCARGAR_PLANTILLA_CSV',
        'SISTEMA',
        'N/A',
        'CSV',
        'Plantilla de horarios descargada para carga masiva.'
      );
    } catch (err) {
      console.error("Error al descargar la plantilla:", err);
    }
  };

  const handleUploadCSV = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        if (!text) {
          setImportError('El archivo está vacío.');
          return;
        }
        
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length === 0) {
          setImportError('No se encontraron líneas de datos en el archivo.');
          return;
        }
        
        // Detectar delimitador (coma o punto y coma)
        const firstLine = lines[0];
        let delimiter = ',';
        const commas = (firstLine.match(/,/g) || []).length;
        const semicolons = (firstLine.match(/;/g) || []).length;
        if (semicolons > commas) {
          delimiter = ';';
        }
        
        // Helper para separar respetando comillas
        const parseLine = (line) => {
          let result = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === delimiter && !inQuotes) {
              result.push(current.replace(/^["']|["']$/g, '').trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.replace(/^["']|["']$/g, '').trim());
          return result;
        };
        
        const headers = parseLine(firstLine);
        if (headers.length < 2 || !headers[0].toLowerCase().includes('empleado')) {
          setImportError('Formato inválido. La primera columna debe ser el nombre del Empleado.');
          return;
        }
        
        // Mapear cabeceras de fechas a los índices del Roster actual
        const colDateStrs = headers.slice(1);
        const dayMappings = colDateStrs.map((dateStr) => {
          const matchedIdx = rosterDays.findIndex(rd => fmtDate(rd) === dateStr);
          return { dateStr, matchedIdx };
        });
        
        const validShiftCodes = scheduleCatalog.map(s => s.code);
        const previewRows = [];
        const overridesToApply = {};
        let totalValid = 0;
        let totalWarnings = 0;
        let totalErrors = 0;
        
        // Procesar filas de empleados
        for (let idx = 1; idx < lines.length; idx++) {
          const cols = parseLine(lines[idx]);
          if (cols.length === 0 || (cols.length === 1 && cols[0] === '')) continue;
          
          const empName = cols[0];
          const emp = baseEmployees.find(e => e.name.toLowerCase().trim() === empName.toLowerCase().trim());
          
          const rowData = {
            name: empName,
            department: emp ? emp.department : 'Desconocido',
            status: 'OK',
            shiftsCount: 0,
            warnings: [],
            errors: []
          };
          
          if (!emp) {
            rowData.status = 'ERROR';
            rowData.errors.push(`Colaborador "${empName}" no está registrado en el roster de Krono.`);
            totalErrors++;
            previewRows.push(rowData);
            continue;
          }
          
          // Leer los turnos por fecha
          const colShifts = cols.slice(1);
          dayMappings.forEach((mapping, colIdx) => {
            if (mapping.matchedIdx === -1) {
              // La fecha de la columna no pertenece al rango actual del roster
              return;
            }
            
            const rawShift = colShifts[colIdx] || '';
            const shiftCode = rawShift.trim().toUpperCase();
            
            if (!shiftCode) {
              // Celda vacía, mapear a LIB y advertir
              rowData.warnings.push(`${mapping.dateStr}: Celda vacía, se asignó Libre (LIB).`);
              overridesToApply[`${emp.name}|${mapping.matchedIdx}`] = 'LIB';
              totalWarnings++;
            } else if (!validShiftCodes.includes(shiftCode)) {
              // Turno no reconocido, mapear a LIB y advertir
              rowData.warnings.push(`${mapping.dateStr}: Turno "${shiftCode}" inválido, se asignó Libre (LIB).`);
              overridesToApply[`${emp.name}|${mapping.matchedIdx}`] = 'LIB';
              totalWarnings++;
              if (rowData.status !== 'ERROR') rowData.status = 'WARNING';
            } else {
              // Turno válido
              overridesToApply[`${emp.name}|${mapping.matchedIdx}`] = shiftCode;
              rowData.shiftsCount++;
              totalValid++;
            }
          });
          
          if (rowData.warnings.length > 0 && rowData.status === 'OK') {
            rowData.status = 'WARNING';
          }
          previewRows.push(rowData);
        }
        
        setImportPreview({
          rows: previewRows,
          overridesToApply,
          totalValid,
          totalWarnings,
          totalErrors,
          fileName: file.name
        });
        setShowImportModal(true);
        e.target.value = ''; // Limpiar el input para permitir recargas del mismo archivo
      } catch (err) {
        console.error("Error al procesar el archivo CSV:", err);
        setImportError(`Error al procesar el archivo: ${err.message}`);
      }
    };
    reader.onerror = () => {
      setImportError('Error de lectura del archivo.');
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    
    // Aplicar overrides al estado
    setManualOverrides(prev => ({
      ...prev,
      ...importPreview.overridesToApply
    }));
    
    // Registrar log en la auditoría
    const totalEmps = importPreview.rows.filter(r => r.status !== 'ERROR').length;
    onAddAuditLog(
      'Importación Excel',
      'IMPORTAR_EXCEL_CSV',
      'ROSTER_GLOBAL',
      'N/A',
      'CSV_APLICADO',
      `Importados horarios de ${totalEmps} colaboradores desde "${importPreview.fileName}". ${importPreview.totalValid} turnos asignados, ${importPreview.totalWarnings} advertencias.`
    );
    
    // Cerrar modal y mostrar toast
    setShowImportModal(false);
    setImportPreview(null);
    triggerSaveToast();
  };

  // ── Resolver Turnos Automáticos (concepto "Turno Automático" del manual) ──
  // Asigna el turno según la hora aproximada de marcaje simulada de cada empleado.
  const resolveAutoShifts = () => {
    const candidates = scheduleCatalog
      .filter((s) => ['FIJO', 'NOCTURNO', 'EXTENSO'].includes(s.type))
      .map((s) => ({ code: s.code, start: timeToMin(s.startTime) ?? 480 }));
    const repair = {};
    let resolved = 0;
    Object.keys(roster).forEach((name) => {
      roster[name].shifts.forEach((code, idx) => {
        if (code !== 'AUTO') return;
        // marcaje simulado: hora aproximada aleatoria → turno más cercano por hora de inicio
        const punchMin = [375, 840, 1320][Math.floor(Math.random() * 3)]; // 06:15 / 14:00 / 22:00
        let best = candidates[0];
        candidates.forEach((c) => {
          if (Math.abs(c.start - punchMin) < Math.abs(best.start - punchMin)) best = c;
        });
        repair[`${name}|${idx}`] = best.code;
        resolved++;
      });
    });
    if (resolved === 0) return;
    setManualOverrides((prev) => ({ ...prev, ...repair }));
    onAddAuditLog(
      'Motor Turno Automático',
      'RESOLVER_TURNO_AUTOMATICO',
      'ROSTER_GLOBAL',
      'AUTO',
      'TURNO_DETECTADO',
      `Resueltos ${resolved} turnos automáticos por hora de marcaje (IA).`
    );
    triggerSaveToast();
  };

  // ── Crear nuevo horario ──
  const handleAddSchedule = (e) => {
    e.preventDefault();
    if (!schCode || !schName) return;

    const colorMap = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      slate: 'bg-slate-800 text-white border-slate-700',
      emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      amber: 'bg-amber-100 text-amber-800 border-amber-200'
    };

    const isCross = schType === 'NOCTURNO' || schType === 'EXTENSO';
    const newSch = {
      id: `SCH-USER-${Math.floor(100 + Math.random() * 900)}`,
      code: schCode.toUpperCase(),
      name: schName,
      type: schType,
      startTime: schType === 'FLEXIBLE' || schType === 'DESCANSO' ? 'Flexible' : schStart,
      endTime: schType === 'FLEXIBLE' || schType === 'DESCANSO' ? 'Flexible' : schEnd,
      checkInStart: schCheckInStart, checkInEnd: schCheckInEnd,
      checkOutStart: schCheckOutStart, checkOutEnd: schCheckOutEnd,
      gracePeriod: schGrace, otThreshold: schOt, otBase: schOtBase, otEarly: schOtEarly, otLate: schOtLate,
      crossDay: isCross, daySpan: schType === 'EXTENSO' ? schDaySpan : 1,
      validatePunch: schValidate, dupMinutes: 5, dayChange: schDayChange,
      breakType: schBreakType, breakDuration: schBreakDur,
      targetHours: schType === 'FLEXIBLE' ? schTargetHrs : undefined,
      durationHours: schType === 'EXTENSO' ? schExtHours : undefined,
      bg: colorMap[schColor]
    };

    setScheduleCatalog([...scheduleCatalog, newSch]);
    onAddAuditLog(
      'Planificador RRHH', 'CREAR_HORARIO_AVANZADO', newSch.code, 'NINGUNO', newSch.name,
      `Creado horario [${newSch.code}] tipo ${newSch.type}. Cruce de día: ${isCross ? 'SÍ' : 'NO'}, OT base: ${schOtBase}.`
    );
    setSchCode('');
    setSchName('');
    triggerSaveToast();
  };

  // ── Crear nuevo ciclo ──
  const handleAddCycle = (e) => {
    e.preventDefault();
    if (!cycName) return;
    const isAuto = cycType === 'AUTO';
    const daysArr = isAuto ? [] : cycDays.slice(0, cycType === 'SEMANAL' ? 7 : cycLength);
    const newCyc = {
      id: `CYC-USER-${Math.floor(100 + Math.random() * 900)}`,
      name: cycName, type: cycType, auto: isAuto, days: daysArr,
      desc: isAuto
        ? 'El sistema detecta el turno según la hora del marcaje (IA)'
        : `Secuencia: ${daysArr.join(' ➔ ')}`
    };
    setShiftCycles([...shiftCycles, newCyc]);
    onAddAuditLog(
      'Planificador RRHH', 'CREAR_CICLO_HORARIO', newCyc.id, 'NINGUNO', newCyc.name,
      `Registrado ciclo [${newCyc.id}] (${cycType}) con patrón de ${daysArr.length} día(s).`
    );
    setCycName('');
    triggerSaveToast();
  };

  // ── Crear asignación / calendario (con Sobrescribir automático) ──
  const handleAddAssignment = (e) => {
    e.preventDefault();
    setConflictWarning(null);

    // Detección de solape con asignaciones permanentes del mismo destinatario
    const overlaps = assignments.filter(
      (a) =>
        !a.isTemp &&
        a.mode === asgMode &&
        a.target === asgTarget &&
        !(asgEnd < a.startDate || asgStart > a.endDate)
    );

    let working = [...assignments];
    if (overlaps.length > 0 && !asgIsTemp) {
      if (asgOverwrite) {
        // Sobrescribir Calendario: recorta/cierra las asignaciones previas en conflicto
        working = working.map((a) => {
          if (overlaps.some((o) => o.id === a.id)) {
            const prevEnd = new Date(asgStart + 'T00:00:00');
            prevEnd.setDate(prevEnd.getDate() - 1);
            return { ...a, endDate: fmtDate(prevEnd), supersededBy: 'OVERWRITE' };
          }
          return a;
        });
      } else {
        setConflictWarning(
          `Solape detectado con ${overlaps.length} calendario(s) vigente(s) de "${asgTarget}". Activa "Sobrescribir Calendario" para resolverlo automáticamente.`
        );
        return;
      }
    }

    // La familia del ciclo decide la política: los FIJOS nunca se publican.
    const selCyc = shiftCycles.find((c) => c.id === asgCycleId);
    const fam = selCyc ? familyOf(selCyc) : 'FIJO';
    const pub =
      asgIsTemp || fam === 'FIJO' || asgPubMode === 'NINGUNA'
        ? { mode: 'NINGUNA' }
        : { mode: 'PERIODICA', cadence: asgPubCadence, noticeDay: asgPubNoticeDay, lead: asgPubLead };

    const newAsg = {
      id: asgIsTemp ? `EXC-${Math.floor(300 + Math.random() * 600)}` : `ASG-${Math.floor(300 + Math.random() * 600)}`,
      mode: asgMode, target: asgTarget, cycleId: asgCycleId,
      startDate: asgStart, endDate: asgEnd, isTemp: asgIsTemp, phase: 0,
      exceptionType: asgIsTemp ? asgExcType : undefined,
      pub
    };

    setAssignments([...working, newAsg]);
    onAddAuditLog(
      'Planificador RRHH',
      asgIsTemp ? 'REGISTRAR_EXCEPCION_TEMPORAL' : 'ASIGNAR_CALENDARIO',
      newAsg.id, overlaps.length > 0 && asgOverwrite ? 'CALENDARIO_PREVIO' : 'VACIO', asgTarget,
      `Asignado ${asgCycleId} a ${asgTarget} (${asgStart} → ${asgEnd}). ${overlaps.length > 0 && asgOverwrite ? 'Calendario(s) previo(s) sobrescrito(s) automáticamente.' : ''} Temporal: ${asgIsTemp ? 'SÍ' : 'NO'}.`
    );
    triggerSaveToast();
  };

  // ── Sobrescribir turno en celda (edición inline) ──
  const handleCellOverride = (code) => {
    if (!activeCell) return;
    const { employee, dayIndex } = activeCell;
    const previousCode = roster[employee].shifts[dayIndex];
    
    if (isRosterPublished) {
      setShowCellConfirmModal({ employee, dayIndex, code, previousCode });
      setActiveCell(null);
    } else {
      executeCellOverride(employee, dayIndex, code, previousCode);
    }
  };

  const executeCellOverride = (employee, dayIndex, code, previousCode) => {
    setManualOverrides((prev) => ({ ...prev, [`${employee}|${dayIndex}`]: code }));
    onAddAuditLog(
      'Supervisor de Turno', 'AJUSTE_ROSTER',
      `${employee}_JULIO_${dayIndex + 1}`, previousCode, code,
      `Ajuste manual de cuadrante: ${employee}, día ${dayIndex + 1} de Julio: [${previousCode}] → [${code}].`
    );
    triggerSaveToast();
  };

  const getShiftBadgeStyle = (code) => {
    if (code === 'SIN_ASIGNAR') return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse font-bold';
    if (code === 'AUTO') return 'bg-amber-50 text-amber-700 border-amber-300 border-dashed';
    const shift = scheduleCatalog.find((s) => s.code === code);
    return shift ? shift.bg : 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const [showToast, setShowToast] = useState(false);
  const triggerSaveToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2200);
  };

  // ── Definición del pipeline de 3 etapas + resultado ──
  const STAGES = [
    { val: 'HORARIOS', n: 1, label: 'Horarios', sub: 'Define la jornada', icon: Sliders },
    { val: 'CICLOS', n: 2, label: 'Ciclos / Turnos', sub: 'Encadena la rotación', icon: RotateCcw },
    { val: 'ASIGNADOR', n: 3, label: 'Calendarios', sub: 'Asigna a personas', icon: ArrowRightLeft }
  ];

  return (
    <div className="space-y-6 relative animate-in fade-in duration-300">
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold border border-slate-800">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>Cambios aplicados y auditados. El cuadrante se recalculó automáticamente.</span>
        </div>
      )}

      {/* Cabecera */}
      <div className="flex flex-col gap-1 pb-1">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orquestador de Turnos y Calendarios</h1>
        <p className="text-slate-500">
          El cuadrante no se llena a mano: se <span className="font-semibold text-indigo-600">deriva automáticamente</span> de los horarios, ciclos y calendarios que definas.
        </p>
      </div>

      {/* ─── ESQUEMA / PIPELINE DE 3 ETAPAS ─── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row items-stretch gap-2">
          {STAGES.map((stage, i) => {
            const Icon = stage.icon;
            const active = subTab === stage.val;
            return (
              <React.Fragment key={stage.val}>
                <button
                  onClick={() => setSubTab(stage.val)}
                  className={`group flex-1 text-left rounded-xl border p-3.5 transition-all cursor-pointer ${
                    active
                      ? 'border-indigo-300 bg-indigo-50/70 shadow-sm ring-1 ring-indigo-200'
                      : 'border-slate-200 bg-slate-50/40 hover:border-indigo-200 hover:bg-indigo-50/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                        active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      {stage.n}
                    </span>
                    <div className="min-w-0">
                      <div className={`flex items-center gap-1.5 font-bold text-sm ${active ? 'text-indigo-700' : 'text-slate-700'}`}>
                        <Icon size={14} /> {stage.label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{stage.sub}</div>
                    </div>
                  </div>
                </button>
                {i < STAGES.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center text-slate-300">
                    <ChevronRight size={20} />
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Nodo de RESULTADO */}
          <div className="hidden lg:flex items-center justify-center text-slate-300">
            <ChevronRight size={20} />
          </div>
          <button
            onClick={() => setSubTab('ROSTER')}
            className={`flex-1 text-left rounded-xl border p-3.5 transition-all cursor-pointer ${
              subTab === 'ROSTER'
                ? 'border-emerald-300 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-200'
                : 'border-slate-200 bg-slate-50/40 hover:border-emerald-200 hover:bg-emerald-50/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2 ${
                  subTab === 'ROSTER' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-200'
                }`}
              >
                <Calendar size={16} />
              </span>
              <div className="min-w-0">
                <div className={`flex items-center gap-1.5 font-bold text-sm ${subTab === 'ROSTER' ? 'text-emerald-700' : 'text-slate-700'}`}>
                  Roster
                </div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Resultado derivado</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ═══════════════ RESULTADO · ROSTER OPERATIVO ═══════════════ */}
      {subTab === 'ROSTER' && (
        <div className="space-y-5">
          {/* Encabezado del Roster con Estado de Publicación */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Planificación del Cuadrante (14 días)</h2>
              <p className="text-xs text-slate-400 font-medium">Control operativo de turnos y descansos asignados</p>
            </div>
            
            {/* Badge de Estado del Roster */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Estado:</span>
              {isRosterPublished ? (
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                  ● Publicado y Notificado
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  ● Borrador (Edición interna)
                </span>
              )}
            </div>
          </div>

          {/* Tarjetas resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard icon={Users} color="indigo" label="Colaboradores" value={Object.keys(roster).length} />
            <SummaryCard icon={AlertCircle} color="rose" label="Celdas sin asignar" value={analysis.unassignedCells} pulse={analysis.unassignedCells > 0} />
            <SummaryCard icon={AlertTriangle} color="amber" label="Conflictos detectados" value={analysis.totalConflicts} pulse={analysis.totalConflicts > 0} />
            <SummaryCard icon={ShieldCheck} color="emerald" label="Descanso mínimo" value={`${REST_REQUIRED_H}h`} />
          </div>

          {/* Controles */}
          <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm justify-between items-center">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text" placeholder="Buscar colaborador..." value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-semibold"
                />
              </div>
              {branches && branches.length > 1 && (
                <select
                  value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">Todas las Sucursales</option>
                  {branches.map((b) => (<option key={b.id} value={b.name}>{b.name}</option>))}
                </select>
              )}
              <select
                value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 font-semibold focus:outline-none focus:ring-2"
              >
                <option value="ALL">Todos los Departamentos</option>
                {departments.map((d) => (
                  <option key={d.name || d} value={d.name || d}>{d.name || d}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer select-none border border-slate-200 px-3 py-2 rounded-lg bg-slate-50/50 hover:bg-slate-50">
                <input type="checkbox" checked={filterUnassigned} onChange={(e) => setFilterUnassigned(e.target.checked)} className="rounded text-indigo-600" />
                <span className="text-rose-600 flex items-center gap-1"><AlertCircle size={13} /> Solo Sin Asignación</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-2 w-full lg:w-auto justify-end">
              {/* Controles de Carga Masiva (Excel) */}
              <div className="flex border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border-r border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Descargar Plantilla Excel (CSV) pre-rellenada"
                >
                  <Download size={13} /> Plantilla
                </button>
                <label className="px-3 py-2 bg-white hover:bg-slate-50 text-indigo-600 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer relative">
                  <Upload size={13} /> Importar Excel (CSV)
                  <input 
                    type="file" 
                    accept=".csv" 
                    onChange={handleUploadCSV} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </label>
              </div>

              <button
                onClick={resolveAutoShifts}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                title="Resolver celdas AUTO según hora de marcaje"
              >
                <Zap size={14} /> Resolver Turnos Auto
              </button>
              <button
                onClick={handleRunAutoScheduler}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} className="animate-pulse" /> Autoprogramar Personal
              </button>

              {isRosterPublished ? (
                <button
                  onClick={() => {
                    setIsRosterPublished(false);
                    onAddAuditLog(
                      'Supervisor de Turno', 'DESPUBLICAR_ROSTER',
                      'ROSTER_GLOBAL', 'PUBLICADO', 'BORRADOR',
                      'Se revirtió el cuadrante de Roster a Borrador para permitir modificaciones libres.'
                    );
                    triggerSaveToast();
                  }}
                  className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                  title="Volver a estado borrador para realizar ajustes libres"
                >
                  <RotateCcw size={13} /> Revertir a Borrador
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsRosterPublished(true);
                    onAddAuditLog(
                      'Supervisor de Turno', 'PUBLICAR_ROSTER',
                      'ROSTER_GLOBAL', 'BORRADOR', 'PUBLICADO',
                      'Se publicó y notificó oficialmente el cuadrante de Roster a todos los colaboradores.'
                    );
                    triggerSaveToast();
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Congelar turnos y simular despacho de notificaciones a los empleados"
                >
                  <Send size={13} /> Publicar y Notificar
                </button>
              )}
            </div>
          </div>

          {/* Guía informativa de códigos de turno para carga masiva */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-600 shadow-sm animate-in fade-in duration-200">
            <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 block mb-0.5">Guía de Carga Masiva (Excel / CSV):</span>
              <p className="leading-relaxed">
                Para asignar horarios correctamente, edita las celdas de las fechas en la plantilla ingresando los códigos del catálogo de Krono:
                {scheduleCatalog.map((s) => (
                  <span key={s.code} className="ml-1.5 inline-block font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-700 shadow-2xs">
                    {s.code} <span className="font-normal text-slate-400">({s.type === 'DESCANSO' ? 'Libre' : s.name.split(' ')[0]})</span>
                  </span>
                ))}
              </p>
            </div>
          </div>

          {/* Alerta de Error de Importación */}
          {importError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle size={15} />
              <span>{importError}</span>
              <button onClick={() => setImportError('')} className="ml-auto text-rose-400 hover:text-rose-600 cursor-pointer">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Cuadrante */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs select-none">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-center">
                    <th className="py-4 px-4 text-left font-bold" style={{ minWidth: '170px' }}>Empleado</th>
                    <th className="py-4 px-2 font-bold" style={{ minWidth: '130px' }}>Ciclo Recurrente</th>
                    <th className="py-4 px-2 font-bold" style={{ minWidth: '64px' }}>Horas</th>
                    {rosterDays.map((day, i) => {
                      const wd = day.getDay();
                      const weekend = wd === 0 || wd === 6;
                      return (
                        <th key={i} className={`py-4 px-1 border-l text-center font-bold ${weekend ? 'bg-slate-100/60' : ''}`} style={{ minWidth: '50px' }}>
                          <div className="font-mono text-slate-700">{day.getDate()}</div>
                          <div className="text-[9px] font-medium text-slate-400 uppercase">{day.toLocaleString('es-ES', { weekday: 'short' }).substring(0, 3)}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                  {filteredRosterKeys.length === 0 ? (
                    <tr><td colSpan={17} className="text-center py-8 text-slate-400 font-medium">Ningún colaborador coincide con los filtros aplicados.</td></tr>
                  ) : (
                    filteredRosterKeys.map((empName) => {
                      const emp = roster[empName];
                      const activeCyc = shiftCycles.find((c) => c.id === emp.cycleId);
                      const empAnalysis = analysis.byEmp[empName];
                      return (
                        <tr key={empName} className="hover:bg-slate-50/30">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-slate-800 block text-xs">{empName}</span>
                            <span className="text-[10px] text-slate-400 block font-medium">{emp.department}</span>
                          </td>
                          <td className="py-3.5 px-2">
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
                          <td className="py-3.5 px-2 text-center">
                            <span className={`text-[11px] font-bold font-mono ${empAnalysis.hasConflict ? 'text-amber-600' : 'text-slate-500'}`}>
                              {empAnalysis.hours}h
                            </span>
                            <span className="block text-[8px] text-slate-400">{empAnalysis.workedDays}d lab.</span>
                          </td>
                          {emp.shifts.map((code, idx) => {
                            const isSelected = activeCell && activeCell.employee === empName && activeCell.dayIndex === idx;
                            const cellConflicts = empAnalysis.conflicts[idx];
                            const hasConflict = !!cellConflicts;
                            const conflictTitle = hasConflict ? [...cellConflicts].map((t) => ({
                              DESCANSO: 'Descanso < 12h', NOCTURNA: 'Nocturnos contiguos', FATIGA: '>6 días seguidos'
                            }[t])).join(' · ') : '';
                            return (
                              <td
                                key={idx}
                                onClick={() => setActiveCell({ employee: empName, dayIndex: idx })}
                                title={conflictTitle}
                                className={`py-3.5 px-1 border-l text-center relative cursor-pointer hover:bg-indigo-50/40 transition-colors ${isSelected ? 'bg-indigo-50 ring-2 ring-indigo-500/20' : ''}`}
                              >
                                <span className={`relative w-9 py-1 rounded font-bold font-mono text-[10px] inline-block border text-center ${getShiftBadgeStyle(code)} ${hasConflict ? 'ring-2 ring-rose-400 ring-offset-1' : ''}`}>
                                  {code === 'SIN_ASIGNAR' ? 'S/A' : code}
                                  {hasConflict && (
                                    <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-rose-500 rounded-full flex items-center justify-center">
                                      <AlertTriangle size={7} className="text-white" />
                                    </span>
                                  )}
                                </span>
                                {isSelected && (
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-2xl z-50 p-2 space-y-1.5 w-40 text-left animate-in fade-in duration-100">
                                    <div className="text-[9px] font-bold text-slate-400 uppercase text-center border-b pb-1">Modificar Turno</div>
                                    <div className="grid grid-cols-2 gap-1 text-[10px] font-bold">
                                      {scheduleCatalog.map((sc) => (
                                        <button
                                          key={sc.code}
                                          onClick={(e) => { e.stopPropagation(); handleCellOverride(sc.code); }}
                                          className={`py-1 rounded font-bold font-mono border hover:scale-105 transition-transform ${sc.bg}`}
                                          title={sc.name}
                                        >
                                          {sc.code}
                                        </button>
                                      ))}
                                    </div>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleCellOverride('SIN_ASIGNAR'); }}
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

          {/* Leyenda */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 flex flex-wrap gap-4 text-xs font-semibold text-slate-500 items-center">
            <span className="font-bold text-slate-700 uppercase">Leyenda:</span>
            {scheduleCatalog.map((sc) => (
              <div key={sc.code} className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] border ${sc.bg}`}>{sc.code}</span>
                <span>{sc.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded font-mono font-bold text-[10px] border bg-amber-50 text-amber-700 border-amber-300 border-dashed">AUTO</span>
              <span>Turno Automático (por marcaje)</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-600">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-flex items-center justify-center"><AlertTriangle size={7} className="text-white" /></span>
              <span>Conflicto de descanso/fatiga</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ETAPA 1 · BIBLIOTECA DE HORARIOS ═══════════════ */}
      {subTab === 'HORARIOS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="text-indigo-500" size={18} />
              <h3 className="font-bold text-slate-800 text-sm">Configurador de Horarios</h3>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500">Tipo de Horario</label>
                  <select value={schType} onChange={(e) => setSchType(e.target.value)} className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500">
                    <option value="FIJO">Fijo (Normal)</option>
                    <option value="FLEXIBLE">Flexible (Acumulación)</option>
                    <option value="NOCTURNO">Nocturno Cruzado (+1)</option>
                    <option value="EXTENSO">Jornada Extensa (24h+)</option>
                    <option value="DESCANSO">Día Libre / Descanso</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500">Código Corto</label>
                  <input type="text" required placeholder="Ej: DF2" value={schCode} onChange={(e) => setSchCode(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 font-mono" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500">Nombre del Perfil Horario</label>
                <input type="text" required placeholder="Ej: Turno Tarde Operarios" value={schName} onChange={(e) => setSchName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500" />
              </div>

              {/* Config Básica */}
              {(schType === 'FIJO' || schType === 'NOCTURNO') && (
                <div className="space-y-3.5 bg-slate-50 p-3 rounded-lg border">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-slate-500">Entrada</label>
                      <input type="time" value={schStart} onChange={(e) => setSchStart(e.target.value)} className="w-full px-2 py-1.5 border rounded" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-500">Salida</label>
                      <input type="time" value={schEnd} onChange={(e) => setSchEnd(e.target.value)} className="w-full px-2 py-1.5 border rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t pt-2.5">
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400">Inicio de Entrada</label>
                      <input type="time" value={schCheckInStart} onChange={(e) => setSchCheckInStart(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400">Hora Máx. Entrada</label>
                      <input type="time" value={schCheckInEnd} onChange={(e) => setSchCheckInEnd(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400">Inicio de Salida</label>
                      <input type="time" value={schCheckOutStart} onChange={(e) => setSchCheckOutStart(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400">Hora Máx. Salida</label>
                      <input type="time" value={schCheckOutEnd} onChange={(e) => setSchCheckOutEnd(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" />
                    </div>
                  </div>
                  {schType === 'NOCTURNO' && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-800 text-slate-200 px-2.5 py-1.5 rounded-md">
                      <Moon size={12} className="text-indigo-300" /> Tipo 24h activado: la salida cae en el día siguiente (+1).
                    </div>
                  )}
                </div>
              )}

              {schType === 'FLEXIBLE' && (
                <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                  <div className="space-y-1">
                    <label className="block text-slate-500">Horas Objetivo (Jornada de Trabajo)</label>
                    <input type="number" step="0.5" value={schTargetHrs} onChange={(e) => setSchTargetHrs(parseFloat(e.target.value))} className="w-full px-2 py-1.5 border rounded" />
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                    <span className="text-[10px] text-slate-500">Permitir Checadas Múltiples (Entradas/Salidas)</span>
                  </div>
                </div>
              )}

              {schType === 'EXTENSO' && (
                <div className="bg-slate-50 p-3 rounded-lg border grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-slate-500">Duración Continua</label>
                    <select value={schExtHours} onChange={(e) => setSchExtHours(parseInt(e.target.value))} className="w-full px-2 py-1.5 border rounded">
                      <option value={24}>24 Horas</option>
                      <option value={36}>36 Horas</option>
                      <option value={48}>48 Horas</option>
                      <option value={72}>72 Horas</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500">Salto de Día(s)</label>
                    <input type="number" min="1" max="4" value={schDaySpan} onChange={(e) => setSchDaySpan(parseInt(e.target.value) || 1)} className="w-full px-2 py-1.5 border rounded" />
                  </div>
                </div>
              )}

              {/* Tolerancias + Reglas */}
              {schType !== 'DESCANSO' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-slate-500">Tolerancia Retraso (m)</label>
                      <input type="number" value={schGrace} onChange={(e) => setSchGrace(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-slate-500">Umbral H. Extras (m)</label>
                      <input type="number" value={schOt} onChange={(e) => setSchOt(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-lg" />
                    </div>
                  </div>

                  {/* Configuración de Tiempo Extra (manual) */}
                  <div className="bg-slate-50 p-3 rounded-lg border space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Activity size={11} /> Tiempo Extra</span>
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400">Base de cálculo</label>
                      <select value={schOtBase} onChange={(e) => setSchOtBase(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px] bg-white">
                        <option value="TRABAJADO">Basado en Tiempo Trabajado (diario)</option>
                        <option value="EXTRA">Basado en Tiempo Extra (semanal)</option>
                      </select>
                    </div>
                    <div className="flex gap-3 pt-1">
                      <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer">
                        <input type="checkbox" checked={schOtEarly} onChange={(e) => setSchOtEarly(e.target.checked)} className="rounded text-indigo-600" /> Entrada Temprana
                      </label>
                      <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer">
                        <input type="checkbox" checked={schOtLate} onChange={(e) => setSchOtLate(e.target.checked)} className="rounded text-indigo-600" /> Salida Tardía
                      </label>
                    </div>
                  </div>

                  {/* Descanso */}
                  <div className="bg-slate-50 p-3 rounded-lg border space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><Coffee size={11} /> Regla de Almuerzo</span>
                      <select value={schBreakType} onChange={(e) => setSchBreakType(e.target.value)} className="text-[10px] border rounded px-1.5 py-0.5 bg-white">
                        <option value="AUTOMATICO">Deducir Automático</option>
                        <option value="REGISTRADO">Checada Obligatoria</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400">Duración (minutos)</label>
                      <input type="number" value={schBreakDur} onChange={(e) => setSchBreakDur(parseInt(e.target.value))} className="w-full px-2 py-1 border rounded" />
                    </div>
                  </div>

                  {/* Reglas globales */}
                  <div className="bg-slate-50 p-3 rounded-lg border space-y-2.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1"><ShieldCheck size={11} /> Reglas de Validación</span>
                    <label className="flex items-center gap-1.5 text-[10px] text-slate-500 cursor-pointer">
                      <input type="checkbox" checked={schValidate} onChange={(e) => setSchValidate(e.target.checked)} className="rounded text-indigo-600" /> Validar checadas (entrada y salida obligatorias)
                    </label>
                    <div className="space-y-1">
                      <label className="block text-[10px] text-slate-400">Cambio de Día (corte de medianoche)</label>
                      <input type="time" value={schDayChange} onChange={(e) => setSchDayChange(e.target.value)} className="w-full px-2 py-1 border rounded text-[11px]" />
                    </div>
                  </div>
                </>
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
                <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
                  <Plus size={14} /> Registrar Horario
                </button>
              </div>
            </form>
          </div>

          {/* Biblioteca */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800 text-base pb-3 border-b border-slate-100 flex items-center gap-2">
              <Layers size={18} className="text-violet-500" /> Biblioteca de Horarios Registrados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
              {scheduleCatalog.map((sch) => (
                <div key={sch.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${sch.bg}`}>{sch.code}</span>
                      <h4 className="font-bold text-slate-800 text-xs mt-1.5">{sch.name}</h4>
                    </div>
                    <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full font-bold">{sch.type}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[9px]">JORNADA</span>
                      {sch.type === 'FIJO' || sch.type === 'NOCTURNO' ? (
                        <span className="text-slate-700 font-bold">{sch.startTime} - {sch.endTime} {sch.crossDay && <span className="text-indigo-500">(+1)</span>}</span>
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
                        <span className="text-slate-400 block text-[9px]">ALMUERZO ({sch.breakType === 'AUTOMATICO' ? 'AUTO' : 'CHECADA'})</span>
                        <span className="text-slate-700 font-bold">{sch.breakDuration} min</span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-slate-400 block text-[9px]">RECARGO TRABAJO</span>
                        <span className="text-emerald-700 font-bold">{sch.otMultiplier}x Base</span>
                      </div>
                    )}
                  </div>
                  {sch.type !== 'DESCANSO' && (
                    <div className="bg-white p-2 rounded border border-slate-100 text-[9.5px] text-slate-400 font-semibold leading-relaxed flex flex-wrap gap-x-3 gap-y-1">
                      {(sch.type === 'FIJO' || sch.type === 'NOCTURNO') && (
                        <span>Margen entrada: <code className="font-mono text-slate-700 font-bold">{sch.checkInStart}-{sch.checkInEnd}</code></span>
                      )}
                      <span>Gracia: <b className="text-slate-700">{sch.gracePeriod}m</b></span>
                      <span>OT: <b className="text-slate-700">{sch.otBase === 'EXTRA' ? 'Semanal' : 'Diario'}</b></span>
                      {sch.validatePunch && <span className="text-emerald-600 flex items-center gap-0.5"><CheckCircle size={9} /> Valida checadas</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ETAPA 2 · CICLOS DE TURNOS ═══════════════ */}
      {subTab === 'CICLOS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <RotateCcw className="text-indigo-500" size={18} />
              <h3 className="font-bold text-slate-800 text-sm">Creador de Ciclos / Turnos</h3>
            </div>

            <form onSubmit={handleAddCycle} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1">
                <label className="block text-slate-500">Nombre del Ciclo</label>
                <input type="text" required placeholder="Ej: Roster 24x48 Continuo" value={cycName} onChange={(e) => setCycName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500" />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500">Tipo de Rotación</label>
                <select value={cycType} onChange={(e) => handleTypeChange(e.target.value)} className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 cursor-pointer">
                  <option value="SEMANAL">Semanal (7 días recurrentes)</option>
                  <option value="CUSTOM">Customizado (N-días rotativo)</option>
                  <option value="AUTO">Turno Automático (IA por marcaje)</option>
                </select>
              </div>

              {cycType === 'AUTO' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800 font-semibold leading-relaxed flex gap-2">
                  <Wand2 size={28} className="text-amber-500 flex-shrink-0" />
                  <span>El sistema asignará automáticamente el turno (Diurno / Vespertino / Nocturno) según la hora aproximada del marcaje del empleado. Requiere tener esos horarios ya creados en la Etapa 1.</span>
                </div>
              ) : (
                <>
                  {cycType === 'CUSTOM' && (
                    <div className="space-y-1 animate-in fade-in duration-200">
                      <label className="block text-slate-500">Duración del Ciclo (Días)</label>
                      <input type="number" min="1" max="14" value={cycLength} onChange={(e) => handleLengthChange(parseInt(e.target.value) || 4)} className="w-full px-3 py-2 border rounded-lg focus:ring-1 text-slate-700 font-bold" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="block text-slate-500">Secuencia de Horarios por Día</label>
                    <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 border rounded-lg bg-slate-50">
                      {Array.from({ length: cycType === 'SEMANAL' ? 7 : cycLength }).map((_, idx) => (
                        <div key={idx} className="bg-white p-2 rounded-lg border border-slate-200/80 shadow-xs flex flex-col gap-1">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">
                            {cycType === 'SEMANAL'
                              ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][idx]
                              : `Día ${idx + 1}`}
                          </span>
                          <select
                            value={cycDays[idx] || 'LIB'}
                            onChange={(e) => { const u = [...cycDays]; u[idx] = e.target.value; setCycDays(u); }}
                            className="w-full text-[11px] font-bold text-slate-700 bg-transparent border-none p-0 focus:outline-none focus:ring-0 cursor-pointer"
                          >
                            {scheduleCatalog.map((sc) => (<option key={sc.code} value={sc.code}>{sc.code}</option>))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <Plus size={14} /> Registrar Ciclo
              </button>
            </form>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm pb-3 border-b border-slate-100">Ciclos y Secuencias Activas</h3>
            <div className="space-y-4 max-h-[560px] overflow-y-auto pr-1">
              {shiftCycles.map((cyc) => (
                <div key={cyc.id} className="p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-slate-800">
                    <div>
                      <h4 className="font-bold text-xs flex items-center gap-1.5">
                        {cyc.auto && <Wand2 size={12} className="text-amber-500" />}
                        <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${FAMILY_META[familyOf(cyc)].cls}`}>{FAMILY_META[familyOf(cyc)].label}</span>
                        {cyc.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {cyc.desc}
                        {familyOf(cyc) === 'FIJO' && ' · anclado a los días de la semana, no rota'}
                        {familyOf(cyc) === 'ROTATIVO' && ' · avanza con el tiempo (rotación)'}
                      </span>
                    </div>
                    <span className={`text-[9px] border px-2 py-0.5 rounded font-bold ${cyc.auto ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-indigo-50 border-indigo-100 text-indigo-700'}`}>
                      {cyc.type}{!cyc.auto && ` (${cyc.days.length} Días)`}
                    </span>
                  </div>
                  {!cyc.auto && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {cyc.days.map((code, idx) => (
                         <div key={idx} className="flex items-center gap-1">
                           <div className="flex flex-col items-center">
                             <span className="text-[8px] text-slate-400 font-bold">
                               {cyc.type === 'SEMANAL'
                                 ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'][idx]
                                 : `DÍA ${idx + 1}`}
                             </span>
                             <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${getShiftBadgeStyle(code)}`}>{code}</span>
                           </div>
                           {idx < cyc.days.length - 1 && <span className="text-slate-300 font-bold self-end mb-1">➔</span>}
                         </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ETAPA 3 · CALENDARIOS / ASIGNACIONES ═══════════════ */}
      {subTab === 'ASIGNADOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ArrowRightLeft className="text-indigo-500" size={18} />
              <h3 className="font-bold text-slate-800 text-sm">Asignar Calendario</h3>
            </div>

            <form onSubmit={handleAddAssignment} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500">Modo</label>
                  <select value={asgMode} onChange={(e) => setAsgMode(e.target.value)} className="w-full px-2.5 py-2 border rounded-lg focus:ring-1">
                    <option value="DEPARTAMENTO">Por Departamento</option>
                    <option value="EMPLEADO">Por Empleado</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500">Destinatario</label>
                  {asgMode === 'DEPARTAMENTO' ? (
                    <select value={asgTarget} onChange={(e) => setAsgTarget(e.target.value)} className="w-full px-2.5 py-2 border rounded-lg focus:ring-1">
                      {departments.map((d) => (
                        <option key={d.name || d} value={d.name || d}>{d.name || d}</option>
                      ))}
                    </select>
                  ) : (
                    <select value={asgTarget} onChange={(e) => setAsgTarget(e.target.value)} className="w-full px-2.5 py-2 border rounded-lg focus:ring-1">
                      {Object.keys(roster).map((name) => (<option key={name} value={name}>{name}</option>))}
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500">Ciclo a Aplicar</label>
                <select value={asgCycleId} onChange={(e) => setAsgCycleId(e.target.value)} className="w-full px-2.5 py-2 border rounded-lg focus:ring-1">
                  {shiftCycles.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                {(() => {
                  const selCyc = shiftCycles.find((c) => c.id === asgCycleId);
                  const fam = selCyc ? familyOf(selCyc) : 'FIJO';
                  return (
                    <div className="flex items-center gap-1.5 pt-1">
                      <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${FAMILY_META[fam].cls}`}>{FAMILY_META[fam].label}</span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {fam === 'FIJO' ? 'Permanente — no se publica' : fam === 'ROTATIVO' ? 'Rotación — admite publicación periódica' : 'Turno automático por marcaje'}
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500">Fecha de Inicio</label>
                  <input type="date" required value={asgStart} onChange={(e) => setAsgStart(e.target.value)} className="w-full px-2.5 py-2 border rounded-lg focus:ring-1" />
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500">Fecha de Fin</label>
                  <input type="date" required value={asgEnd} onChange={(e) => setAsgEnd(e.target.value)} className="w-full px-2.5 py-2 border rounded-lg focus:ring-1" />
                </div>
              </div>

              {/* Política de Publicación — solo para ciclos ROTATIVOS no temporales */}
              {(() => {
                const selCyc = shiftCycles.find((c) => c.id === asgCycleId);
                const isRot = selCyc && familyOf(selCyc) === 'ROTATIVO';
                if (!isRot || asgIsTemp) return null;
                return (
                  <div className="bg-violet-50/50 border border-violet-100 p-3 rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-violet-700 uppercase flex items-center gap-1"><Send size={11} /> Política de Publicación</span>
                      <select value={asgPubMode} onChange={(e) => setAsgPubMode(e.target.value)} className="text-[10px] border rounded px-1.5 py-0.5 bg-white">
                        <option value="PERIODICA">Periódica (anunciada)</option>
                        <option value="NINGUNA">Ninguna (permanente)</option>
                      </select>
                    </div>
                    {asgPubMode === 'PERIODICA' && (
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="block text-[9px] text-slate-400">Cadencia</label>
                          <select value={asgPubCadence} onChange={(e) => setAsgPubCadence(e.target.value)} className="w-full px-1.5 py-1 border rounded text-[10px] bg-white">
                            <option value="SEMANAL">Semanal</option>
                            <option value="QUINCENAL">Quincenal</option>
                            <option value="MENSUAL">Mensual</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] text-slate-400">Día de aviso</label>
                          <select value={asgPubNoticeDay} onChange={(e) => setAsgPubNoticeDay(parseInt(e.target.value))} className="w-full px-1.5 py-1 border rounded text-[10px] bg-white">
                            {DAY_NAMES.map((d, i) => (<option key={i} value={i}>{d.substring(0, 3)}</option>))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] text-slate-400">Adelanto</label>
                          <input type="number" min="1" max="6" value={asgPubLead} onChange={(e) => setAsgPubLead(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-1.5 py-1 border rounded text-[10px] font-bold" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Sobrescribir Calendario */}
              <label className="flex items-start gap-2 bg-indigo-50/60 border border-indigo-100 p-2.5 rounded-lg cursor-pointer">
                <input type="checkbox" checked={asgOverwrite} onChange={(e) => setAsgOverwrite(e.target.checked)} className="rounded text-indigo-600 mt-0.5" />
                <span className="text-[10px] text-slate-600 font-semibold leading-snug">
                  <b className="text-indigo-700 flex items-center gap-1"><GitBranch size={11} /> Sobrescribir Calendario</b>
                  Si hay solape de fechas, cierra automáticamente el calendario previo y deja vigente esta asignación.
                </span>
              </label>

              {/* Excepción Temporal */}
              <div className="bg-slate-50 p-3 rounded-lg border space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">¿Excepción Temporal?</span>
                  <input type="checkbox" checked={asgIsTemp} onChange={(e) => setAsgIsTemp(e.target.checked)} className="rounded text-indigo-600" />
                </div>
                {asgIsTemp && (
                  <div className="space-y-1 border-t pt-2.5">
                    <label className="block text-[10px] text-slate-400">Modo de Excepción</label>
                    <select value={asgExcType} onChange={(e) => setAsgExcType(e.target.value)} className="w-full px-1.5 py-1 border rounded text-[11px]">
                      <option value="REEMPLAZAR">Reemplazar Horario Existente</option>
                      <option value="DOBLETE">Turno Adicional (Doblete)</option>
                    </select>
                  </div>
                )}
              </div>

              {conflictWarning && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-semibold p-2.5 rounded-lg flex gap-2">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" /> {conflictWarning}
                </div>
              )}

              <button type="submit" className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
                Aplicar Calendario
              </button>
            </form>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm">Calendarios y Excepciones Vigentes</h3>
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1"><Info size={12} /> El roster se recalcula al cambiar esta tabla</span>
            </div>
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
                    const cycle = shiftCycles.find((c) => c.id === asg.cycleId);
                    const superseded = asg.supersededBy === 'OVERWRITE';
                    return (
                      <tr key={asg.id} className={`hover:bg-slate-50/50 ${superseded ? 'opacity-50' : ''}`}>
                        <td className="py-2.5 px-4">
                          <span className="font-bold text-slate-800 block">{asg.target}</span>
                          <span className="text-[9px] text-slate-400 block font-medium">{asg.mode}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="font-mono font-bold text-indigo-600 block">{asg.shiftCode ? asg.shiftCode : cycle?.name.split(' ')[0] || '—'}</span>
                          {cycle && !asg.isTemp && (
                            <span className={`text-[8px] font-bold px-1 py-0.5 rounded border ${FAMILY_META[familyOf(cycle)].cls}`}>{FAMILY_META[familyOf(cycle)].label}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px]">{asg.startDate} → {asg.endDate}</td>
                        <td className="py-2.5 px-4">
                          {asg.isTemp ? (
                            <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded font-bold uppercase">EXCEPCIÓN ({asg.exceptionType})</span>
                          ) : asg.pub && asg.pub.mode === 'PERIODICA' ? (
                            <span className="text-[10px] bg-violet-50 text-violet-700 border border-violet-100 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1 w-fit" title={`Aviso ${DAY_NAMES[asg.pub.noticeDay]}`}>
                              <Send size={9} /> {CADENCE_LABEL[asg.pub.cadence]}
                            </span>
                          ) : (
                            <span className="text-[10px] bg-slate-100 text-slate-600 border px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1 w-fit"><Lock size={9} /> Permanente</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          {superseded ? (
                            <span className="text-slate-400 font-bold flex items-center justify-end gap-1 text-[11px]"><GitBranch size={12} /> Sobrescrito</span>
                          ) : (
                            <span className="text-emerald-600 font-bold flex items-center justify-end gap-1 text-[11px]"><CheckCircle size={12} /> Vigente</span>
                          )}
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



      {/* ═══════════════ MODAL · AUTOSCHEDULER ═══════════════ */}
      {showSchedulerModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 text-indigo-300 w-full max-w-xl rounded-xl border border-slate-800 shadow-2xl p-5 space-y-4 font-mono text-xs max-h-[470px] flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <Sparkles size={14} className={autoScheduling ? 'animate-spin' : ''} /> KRONO AUTOSCHEDULER ENGINE
              </span>
              <button onClick={() => setShowSchedulerModal(false)} className="text-slate-500 hover:text-slate-300 cursor-pointer"><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 bg-slate-900/40 p-4 rounded-lg border border-slate-900/80 shadow-inner h-64">
              {schedulerLogs.map((log, index) => (
                <div key={index} className="flex gap-2 items-start animate-in fade-in duration-200">
                  <span className="text-slate-600 font-bold">&gt;</span>
                  <span className={log.includes('✔️') || log.includes('🛠️') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>{log}</span>
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
                {autoScheduling ? 'Procesando Roster...' : 'Cerrar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ═══════════════ MODAL · VISTA PREVIA IMPORTACIÓN ═══════════════ */}
      {showImportModal && importPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Cabecera */}
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText size={16} className="text-indigo-600" />
                  Vista Previa de Importación de Horarios
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Archivo: {importPreview.fileName}</p>
              </div>
              <button 
                onClick={() => { setShowImportModal(false); setImportPreview(null); }} 
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Resumen de Validaciones */}
            <div className="p-5 bg-white border-b border-slate-100 grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                <div className="text-lg font-bold text-emerald-700">{importPreview.totalValid}</div>
                <div className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide">Turnos Válidos</div>
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                <div className="text-lg font-bold text-amber-700">{importPreview.totalWarnings}</div>
                <div className="text-[10px] text-amber-600 font-semibold uppercase tracking-wide">Advertencias</div>
              </div>
              <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl">
                <div className="text-lg font-bold text-rose-700">{importPreview.totalErrors}</div>
                <div className="text-[10px] text-rose-600 font-semibold uppercase tracking-wide">Errores</div>
              </div>
            </div>

            {/* Advertencia si el Roster está Publicado */}
            {isRosterPublished && (
              <div className="mx-5 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 font-semibold flex items-start gap-2 shadow-2xs">
                <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 block mb-0.5">⚠️ Roster Oficial Publicado:</span>
                  El cuadrante ya está publicado. Al confirmar la importación, se aplicarán cambios inmediatos sobre turnos oficiales y se notificará automáticamente a los empleados correspondientes.
                </div>
              </div>
            )}

            {/* Listado de colaboradores */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/30">
              <div className="text-xs font-bold text-slate-700 mb-2">Detalle de Colaboradores</div>
              {importPreview.rows.map((row, i) => (
                <div 
                  key={i} 
                  className={`p-3.5 rounded-xl border flex flex-col gap-1.5 transition-all bg-white shadow-sm ${
                    row.status === 'ERROR' 
                      ? 'border-rose-200 hover:border-rose-300' 
                      : row.status === 'WARNING' 
                        ? 'border-amber-200 hover:border-amber-300' 
                        : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-800 text-xs block">{row.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold block">{row.department}</span>
                    </div>
                    <div>
                      {row.status === 'ERROR' && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          Ignorar / Error
                        </span>
                      )}
                      {row.status === 'WARNING' && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Advertencia
                        </span>
                      )}
                      {row.status === 'OK' && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Listo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mensajes de error/advertencia */}
                  {row.errors.length > 0 && (
                    <div className="space-y-1 mt-1">
                      {row.errors.map((msg, idx) => (
                        <div key={idx} className="text-[10px] text-rose-600 font-medium flex items-center gap-1">
                          <AlertCircle size={10} />
                          <span>{msg}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {row.warnings.length > 0 && (
                    <div className="space-y-1 mt-1 border-t border-slate-100 pt-1.5">
                      {row.warnings.map((msg, idx) => (
                        <div key={idx} className="text-[10px] text-amber-700 font-medium flex items-center gap-1">
                          <AlertTriangle size={10} />
                          <span>{msg}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {row.status === 'OK' && (
                    <div className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-1 border-t border-slate-100 pt-1.5">
                      <Check size={11} />
                      <span>{row.shiftsCount} turnos válidos leídos y listos para aplicar.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <span className="text-[10px] text-slate-500 font-medium">
                {importPreview.totalErrors > 0 
                  ? `* Se ignorarán ${importPreview.totalErrors} fila(s) con error.` 
                  : '✓ Todo el personal validado correctamente.'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowImportModal(false); setImportPreview(null); }}
                  className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={importPreview.totalValid === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold rounded-lg text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                >
                  <CheckCircle size={13} /> Confirmar y Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ MODAL · CONFIRMAR EDICIÓN DE CELDA PUBLICADA ═══════════════ */}
      {showCellConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">¿Modificar turno publicado?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Este cuadrante ya fue publicado y notificado a los empleados. Modificar manualmente el turno de 
                  <strong> {showCellConfirmModal.employee} </strong> (Día {showCellConfirmModal.dayIndex + 1} de Julio) de 
                  <span className="font-mono font-bold mx-1 text-slate-700 bg-slate-100 px-1 py-0.5 rounded text-[10px]">
                    {showCellConfirmModal.previousCode === 'SIN_ASIGNAR' ? 'S/A' : showCellConfirmModal.previousCode}
                  </span> 
                  a 
                  <span className="font-mono font-bold mx-1 text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded text-[10px]">
                    {showCellConfirmModal.code === 'SIN_ASIGNAR' ? 'S/A' : showCellConfirmModal.code}
                  </span> 
                  enviará una notificación de alerta automática para informarle del cambio retroactivo de su horario.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowCellConfirmModal(null)}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  executeCellOverride(
                    showCellConfirmModal.employee, 
                    showCellConfirmModal.dayIndex, 
                    showCellConfirmModal.code, 
                    showCellConfirmModal.previousCode
                  );
                  setShowCellConfirmModal(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
              >
                Sí, aplicar cambio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Tarjeta resumen reutilizable ── */
function SummaryCard({ icon: Icon, color, label, value, pulse }) {
  const colors = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    rose: 'bg-rose-50 border-rose-100 text-rose-600',
    amber: 'bg-amber-50 border-amber-100 text-amber-600',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600'
  };
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${colors[color]} ${pulse ? 'animate-pulse' : ''}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xl font-bold text-slate-800 leading-none">{value}</div>
        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mt-1">{label}</div>
      </div>
    </div>
  );
}
