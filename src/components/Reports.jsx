import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, Printer, Filter, Calendar, Users, Building, 
  ShieldCheck, TrendingUp, AlertTriangle, Clock, RefreshCw, BarChart2,
  CheckCircle, ArrowDownRight, ArrowUpRight, Search
} from 'lucide-react';

// Dataset histórico de asistencia (Junio 25 - Junio 27, 2026) que coincide con mockData.js
const HISTORICAL_ATTENDANCE = [
  // ── 25 DE JUNIO DE 2026 ──────────────────────────────────────────────────
  { date: '2026-06-25', empId: 'EMP-001', name: 'Juan Pérez', dept: 'Operaciones', shift: 'DF1', checkIn: '08:00:15', checkOut: '17:02:11', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0, device: 'Android', accuracy: '4.5m' },
  { date: '2026-06-25', empId: 'EMP-002', name: 'María Gómez', dept: 'Operaciones', shift: 'DF1', checkIn: '07:55:20', checkOut: '17:00:10', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0, device: 'iOS', accuracy: '8.2m' },
  { date: '2026-06-25', empId: 'EMP-003', name: 'Carlos Díaz', dept: 'TI y Sistemas', shift: 'DF1', checkIn: '08:58:10', checkOut: '18:00:30', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0, device: 'Android', accuracy: '12.0m' },
  { date: '2026-06-25', empId: 'EMP-004', name: 'Sofía Rodríguez', dept: 'Recursos Humanos', shift: 'DF1', checkIn: '08:52:10', checkOut: '18:05:11', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0.1, device: 'iOS', accuracy: '4.1m' },
  { date: '2026-06-25', empId: 'EMP-005', name: 'Alejandro Ruiz', dept: 'Operaciones', shift: 'NOC', checkIn: '21:54:10', checkOut: '06:03:15', status: 'FERIADO_TRABAJADO', lateMin: 0, earlyMin: 0, otHours: 0.1, device: 'Android', accuracy: '13.9m' },
  { date: '2026-06-25', empId: 'EMP-006', name: 'Camila Silva', dept: 'Experiencia del Cliente', shift: 'DF1', checkIn: '08:50:30', checkOut: '18:00:00', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0, device: 'iOS', accuracy: '5.5m' },
  { date: '2026-06-25', empId: 'EMP-007', name: 'Roberto Méndez', dept: 'Logística', shift: 'DF1', checkIn: '08:02:15', checkOut: '17:05:00', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0.1, device: 'Android', accuracy: '9.0m' },
  { date: '2026-06-25', empId: 'EMP-008', name: 'Lucía Fernández', dept: 'TI y Sistemas', shift: 'DF1', checkIn: '08:59:00', checkOut: '18:01:00', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0, device: 'iOS', accuracy: '2.1m' },

  // ── 26 DE JUNIO DE 2026 ──────────────────────────────────────────────────
  { date: '2026-06-26', empId: 'EMP-001', name: 'Juan Pérez', dept: 'Operaciones', shift: 'DF1', checkIn: '08:05:40', checkOut: '17:01:15', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0, device: 'Android', accuracy: '4.8m' },
  { date: '2026-06-26', empId: 'EMP-002', name: 'María Gómez', dept: 'Operaciones', shift: 'DF1', checkIn: '07:58:12', checkOut: '17:00:05', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0, device: 'iOS', accuracy: '6.4m' },
  { date: '2026-06-26', empId: 'EMP-003', name: 'Carlos Díaz', dept: 'TI y Sistemas', shift: 'DF1', checkIn: '09:12:44', checkOut: '18:00:00', status: 'TARDE', lateMin: 12, earlyMin: 0, otHours: 0, device: 'Android', accuracy: '14.1m' },
  { date: '2026-06-26', empId: 'EMP-004', name: 'Sofía Rodríguez', dept: 'Recursos Humanos', shift: 'DF1', checkIn: '08:50:00', checkOut: '18:00:10', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0, device: 'iOS', accuracy: '3.9m' },
  { date: '2026-06-26', empId: 'EMP-005', name: 'Alejandro Ruiz', dept: 'Operaciones', shift: 'LIB', checkIn: '--:--:--', checkOut: '--:--:--', status: 'LIBRE', lateMin: 0, earlyMin: 0, otHours: 0, device: '--', accuracy: '--' },
  { date: '2026-06-26', empId: 'EMP-006', name: 'Camila Silva', dept: 'Experiencia del Cliente', shift: 'DF1', checkIn: '08:55:00', checkOut: '18:05:40', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0.1, device: 'iOS', accuracy: '5.9m' },
  { date: '2026-06-26', empId: 'EMP-007', name: 'Roberto Méndez', dept: 'Logística', shift: 'DF1', checkIn: '08:15:30', checkOut: '17:00:00', status: 'TARDE', lateMin: 15, earlyMin: 0, otHours: 0, device: 'Android', accuracy: '10.5m' },
  { date: '2026-06-26', empId: 'EMP-008', name: 'Lucía Fernández', dept: 'TI y Sistemas', shift: 'DF1', checkIn: '09:05:12', checkOut: '18:00:00', status: 'TARDE', lateMin: 5, earlyMin: 0, otHours: 0, device: 'iOS', accuracy: '3.1m' },

  // ── 27 DE JUNIO DE 2026 (DÍA ACTUAL) ──────────────────────────────────────
  { date: '2026-06-27', empId: 'EMP-001', name: 'Juan Pérez', dept: 'Operaciones', shift: 'DF1', checkIn: '08:02:14', checkOut: '--:--:--', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0, device: 'Android', accuracy: '4.2m' },
  { date: '2026-06-27', empId: 'EMP-002', name: 'María Gómez', dept: 'Operaciones', shift: 'DF1', checkIn: '07:56:40', checkOut: '--:--:--', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0, device: 'Android', accuracy: '11.1m' },
  { date: '2026-06-27', empId: 'EMP-003', name: 'Carlos Díaz', dept: 'TI y Sistemas', shift: 'DF1', checkIn: '09:05:12', checkOut: '--:--:--', status: 'TARDE', lateMin: 5, earlyMin: 0, otHours: 0, device: '--', accuracy: '--' },
  { date: '2026-06-27', empId: 'EMP-004', name: 'Sofía Rodríguez', dept: 'Recursos Humanos', shift: 'DF1', checkIn: '08:52:10', checkOut: '18:05:11', status: 'PRESENTE', lateMin: 0, earlyMin: 0, otHours: 0.1, device: 'iOS', accuracy: '6.8m' },
  { date: '2026-06-27', empId: 'EMP-005', name: 'Alejandro Ruiz', dept: 'Operaciones', shift: 'NOC', checkIn: '21:54:10', checkOut: '06:03:15', status: 'FERIADO_TRABAJADO', lateMin: 0, earlyMin: 0, otHours: 0.1, device: 'Android', accuracy: '14.2m' },
  { date: '2026-06-27', empId: 'EMP-006', name: 'Camila Silva', dept: 'Experiencia del Cliente', shift: 'DF1', checkIn: '08:58:30', checkOut: '--:--:--', status: 'EN_DESCANSO', lateMin: 0, earlyMin: 0, otHours: 0, device: 'iOS', accuracy: '7.1m' },
  { date: '2026-06-27', empId: 'EMP-007', name: 'Roberto Méndez', dept: 'Logística', shift: 'DF1', checkIn: '--:--:--', checkOut: '--:--:--', status: 'AUSENTE', lateMin: 0, earlyMin: 0, otHours: 0, device: '--', accuracy: '--' },
  { date: '2026-06-27', empId: 'EMP-008', name: 'Lucía Fernández', dept: 'TI y Sistemas', shift: 'DF1', checkIn: '09:02:11', checkOut: '--:--:--', status: 'SIN_SALIDA', lateMin: 0, earlyMin: 0, otHours: 0, device: 'iOS', accuracy: '3.5m' }
];

const CRYPTO_KEY = 'SHA-256: 8f3c7d2b1a9e...KRONO-SECURE-AUDIT';

export default function Reports({ employees, departments, onAddAuditLog, branches }) {
  // Configuración de Filtros
  const [reportType, setReportType] = useState('ASISTENCIA_DIARIA'); // ASISTENCIA_DIARIA, TARDANZAS_SALIDAS, AUSENCIAS, HORAS_EXTRAS, CONSOLIDADO
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedEmp, setSelectedEmp] = useState('ALL');
  const [startDate, setStartDate] = useState('2026-06-25');
  const [endDate, setEndDate] = useState('2026-06-27');
  
  // Feedback visual de descarga
  const [downloading, setDownloading] = useState(null); // 'excel' o 'pdf' o null
  const [successToast, setSuccessToast] = useState(null);

  // Filtrado de empleados en base a la sucursal y departamento seleccionados
  const filteredEmployeesList = useMemo(() => {
    return employees.filter(e => {
      const matchesDept = selectedDept === 'ALL' || e.department === selectedDept;
      const matchesBranch = selectedBranch === 'ALL' || e.branch === selectedBranch;
      return matchesDept && matchesBranch;
    });
  }, [employees, selectedDept, selectedBranch]);

  // Dataset filtrado final
  const reportDataset = useMemo(() => {
    return HISTORICAL_ATTENDANCE.filter(item => {
      const matchDate = item.date >= startDate && item.date <= endDate;
      const matchDept = selectedDept === 'ALL' || item.dept === selectedDept;
      const matchEmp = selectedEmp === 'ALL' || item.name === selectedEmp;
      
      let matchBranch = true;
      if (selectedBranch !== 'ALL') {
        const emp = employees.find(e => e.name === item.name);
        matchBranch = emp && emp.branch === selectedBranch;
      }
      
      let matchType = true;
      if (reportType === 'TARDANZAS_SALIDAS') {
        matchType = item.lateMin > 0 || item.earlyMin > 0 || item.status === 'TARDE';
      } else if (reportType === 'AUSENCIAS') {
        matchType = item.status === 'AUSENTE';
      } else if (reportType === 'HORAS_EXTRAS') {
        matchType = item.otHours > 0 || item.status === 'FERIADO_TRABAJADO';
      }

      return matchDate && matchDept && matchEmp && matchBranch && matchType;
    });
  }, [reportType, selectedDept, selectedEmp, selectedBranch, startDate, endDate, employees]);

  // Cálculo de KPIs rápidos en base a los datos filtrados
  const stats = useMemo(() => {
    const totalRecords = reportDataset.length;
    if (totalRecords === 0) return { presenceRate: 0, totalLates: 0, totalAbsences: 0, totalOt: 0 };
    
    const absences = reportDataset.filter(item => item.status === 'AUSENTE').length;
    const lates = reportDataset.filter(item => item.lateMin > 0 || item.status === 'TARDE').length;
    const totalOt = reportDataset.reduce((sum, item) => sum + item.otHours, 0);
    const workedDays = reportDataset.filter(item => item.status !== 'AUSENTE' && item.status !== 'LIBRE').length;
    
    const presenceRate = workedDays > 0 ? Math.round(((workedDays - lates) / workedDays) * 100) : 100;
    
    return {
      presenceRate,
      totalLates: lates,
      totalAbsences: absences,
      totalOt: Math.round(totalOt * 10) / 10
    };
  }, [reportDataset]);

  // Generador de Excel simulado mediante descarga de CSV
  const handleExportCSV = () => {
    setDownloading('excel');
    
    setTimeout(() => {
      // Cabecera del archivo
      let csvContent = "data:text/csv;charset=utf-8,";
      
      if (reportType === 'ASISTENCIA_DIARIA') {
        csvContent += "Fecha,ID Colaborador,Nombre,Departamento,Turno,Hora Entrada,Hora Salida,Estatus,GPS precision\n";
        reportDataset.forEach(r => {
          csvContent += `${r.date},${r.empId},"${r.name}","${r.dept}",${r.shift},${r.checkIn},${r.checkOut},${r.status},${r.accuracy}\n`;
        });
      } else if (reportType === 'TARDANZAS_SALIDAS') {
        csvContent += "Fecha,ID Colaborador,Nombre,Departamento,Hora Entrada,Minutos de Retardo,Estatus\n";
        reportDataset.forEach(r => {
          csvContent += `${r.date},${r.empId},"${r.name}","${r.dept}",${r.checkIn},${r.lateMin},${r.status}\n`;
        });
      } else if (reportType === 'AUSENCIAS') {
        csvContent += "Fecha,ID Colaborador,Nombre,Departamento,Estatus\n";
        reportDataset.forEach(r => {
          csvContent += `${r.date},${r.empId},"${r.name}","${r.dept}",${r.status}\n`;
        });
      } else if (reportType === 'HORAS_EXTRAS') {
        csvContent += "Fecha,ID Colaborador,Nombre,Departamento,Horas Extras,Estatus\n";
        reportDataset.forEach(r => {
          csvContent += `${r.date},${r.empId},"${r.name}","${r.dept}",${r.otHours},${r.status}\n`;
        });
      } else {
        csvContent += "Fecha,Colaborador,Departamento,Entrada,Salida,Estatus\n";
        reportDataset.forEach(r => {
          csvContent += `${r.date},"${r.name}","${r.dept}",${r.checkIn},${r.checkOut},${r.status}\n`;
        });
      }

      // Descargar archivo
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `krono_reporte_${reportType.toLowerCase()}_${startDate}_a_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloading(null);
      triggerToast('Reporte de Excel (CSV) exportado con éxito y firmado criptográficamente.');
      onAddAuditLog(
        'Admin de RRHH', 
        'EXPORTAR_REPORTE_EXCEL', 
        `REPORTE_${reportType}`, 
        '—', 
        `GENERADO: ${reportDataset.length} registros`, 
        `Filtros: Dept: ${selectedDept} | Rango: ${startDate} al ${endDate}. Sello: ${CRYPTO_KEY}`
      );
    }, 1200);
  };

  // Impresión PDF con hoja de estilos print dedicada
  const handlePrintPDF = () => {
    setDownloading('pdf');
    setTimeout(() => {
      setDownloading(null);
      onAddAuditLog(
        'Admin de RRHH', 
        'EXPORTAR_REPORTE_PDF', 
        `REPORTE_${reportType}`, 
        '—', 
        `IMPRESO: ${reportDataset.length} registros`, 
        `Filtros: Dept: ${selectedDept} | Rango: ${startDate} al ${endDate}.`
      );
      window.print();
    }, 800);
  };

  const triggerToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 print:p-0 print:space-y-4">
      {/* Estilos CSS específicos de impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          aside, header, nav, button, .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Cabecera */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="text-indigo-600" size={24} />
            Centro de Reportes y Telemetría
          </h1>
          <p className="text-slate-500 text-xs mt-1 font-medium">
            Genere, audite y exporte informes firmados digitalmente para el control de horas de trabajo y cumplimiento laboral.
          </p>
        </div>
        
        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportCSV}
            disabled={downloading !== null || reportDataset.length === 0}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} className={downloading === 'excel' ? 'animate-bounce' : ''} />
            {downloading === 'excel' ? 'Procesando...' : 'Exportar Excel (CSV)'}
          </button>
          
          <button 
            onClick={handlePrintPDF}
            disabled={downloading !== null || reportDataset.length === 0}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer size={14} className={downloading === 'pdf' ? 'animate-spin' : ''} />
            {downloading === 'pdf' ? 'Preparando...' : 'Imprimir PDF'}
          </button>
        </div>
      </div>

      {/* Toast de Éxito */}
      {successToast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-300 border border-slate-800">
          <ShieldCheck className="text-emerald-400 shrink-0" size={16} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Panel de Control y Filtros */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4 no-print">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-xs border-b pb-2">
          <Filter size={14} className="text-indigo-500" />
          <span>Filtros Avanzados de Consulta</span>
        </div>

        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-${branches && branches.length > 1 ? '6' : '5'} gap-3 text-xs font-semibold text-slate-600`}>
          {/* Tipo de Reporte */}
          <div className="space-y-1">
            <label htmlFor="report-type" className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Tipo de Reporte</label>
            <select 
              id="report-type"
              value={reportType} 
              onChange={(e) => { setReportType(e.target.value); setSelectedEmp('ALL'); }}
              className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ASISTENCIA_DIARIA">Asistencia Diaria & Marcajes</option>
              <option value="TARDANZAS_SALIDAS">Tardanzas y Salidas Temp.</option>
              <option value="AUSENCIAS">Excepciones de Ausencia</option>
              <option value="HORAS_EXTRAS">Reporte de Horas Extras</option>
              <option value="CONSOLIDADO">Resumen Consolidado</option>
            </select>
          </div>

          {/* Sucursal (Multisucursal mode) */}
          {branches && branches.length > 1 && (
            <div className="space-y-1">
              <label htmlFor="report-branch" className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Sucursal</label>
              <select 
                id="report-branch"
                value={selectedBranch} 
                onChange={(e) => { setSelectedBranch(e.target.value); setSelectedDept('ALL'); setSelectedEmp('ALL'); }}
                className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none font-bold text-indigo-700 bg-white"
              >
                <option value="ALL">Todas las Sucursales</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Departamento */}
          <div className="space-y-1">
            <label htmlFor="report-dept" className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Departamento</label>
            <select 
              id="report-dept"
              value={selectedDept} 
              onChange={(e) => { setSelectedDept(e.target.value); setSelectedEmp('ALL'); }}
              className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Todos los Departamentos</option>
              {departments.map((d) => (
                <option key={d.name || d} value={d.name || d}>{d.name || d}</option>
              ))}
            </select>
          </div>

          {/* Colaborador */}
          <div className="space-y-1">
            <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Colaborador</label>
            <select 
              value={selectedEmp} 
              onChange={(e) => setSelectedEmp(e.target.value)}
              className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">Todos los Colaboradores</option>
              {filteredEmployeesList.map((e) => (
                <option key={e.id} value={e.name}>{e.name}</option>
              ))}
            </select>
          </div>

          {/* Rango Desde */}
          <div className="space-y-1">
            <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Desde</label>
            <input 
              type="date" 
              value={startDate} 
              min="2026-06-25"
              max="2026-06-27"
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2.5 py-2 border rounded-lg font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Rango Hasta */}
          <div className="space-y-1">
            <label className="block text-slate-400 text-[10px] uppercase font-bold tracking-wider">Hasta</label>
            <input 
              type="date" 
              value={endDate} 
              min="2026-06-25"
              max="2026-06-27"
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2.5 py-2 border rounded-lg font-mono focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Sección Imprimible / Vista del Reporte */}
      <div className="print-section space-y-6">
        
        {/* Header Exclusivo para Print PDF */}
        <div className="hidden print:flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-wider uppercase text-slate-900">KRONO INTEGRATED PLATFORM</h1>
            <p className="text-[9px] text-slate-500 font-mono mt-0.5">INFORME DE TELEMETRÍA DE ASISTENCIA Y CONTROL LABORAL</p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-800">Fecha de Emisión: {new Date().toLocaleDateString()}</div>
            <div className="text-[8px] font-mono text-slate-400">HASH: {CRYPTO_KEY}</div>
          </div>
        </div>

        {/* KPIs Consolidados del Reporte */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Puntualidad */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tasa de Puntualidad</span>
              <span className="text-xl font-bold text-slate-800 tracking-tight mt-0.5 block">{stats.presenceRate}%</span>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
              <TrendingUp size={16} />
            </div>
          </div>

          {/* Card 2: Retardos */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Retardos</span>
              <span className="text-xl font-bold text-slate-800 tracking-tight mt-0.5 block">{stats.totalLates}</span>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
              <Clock size={16} />
            </div>
          </div>

          {/* Card 3: Ausencias */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ausencias Registradas</span>
              <span className="text-xl font-bold text-slate-800 tracking-tight mt-0.5 block">{stats.totalAbsences}</span>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
              <AlertTriangle size={16} />
            </div>
          </div>

          {/* Card 4: Horas Extras */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Horas Extras Acumuladas</span>
              <span className="text-xl font-bold text-slate-800 tracking-tight mt-0.5 block">{stats.totalOt} hrs</span>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <BarChart2 size={16} />
            </div>
          </div>
        </div>

        {/* Tabla Principal */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between no-print">
            <span className="text-slate-800 font-bold text-xs">
              Detalle del Reporte ({reportDataset.length} registros cargados)
            </span>
            <span className="text-[10px] text-slate-400 font-semibold font-mono flex items-center gap-1">
              <ShieldCheck size={11} className="text-emerald-500 animate-pulse" /> Sello de Integridad: {CRYPTO_KEY.substring(0, 16)}...
            </span>
          </div>

          <div className="overflow-x-auto">
            {reportDataset.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-semibold space-y-2">
                <Search size={32} className="mx-auto text-slate-300" />
                <p>No se encontraron registros de telemetría para los filtros seleccionados.</p>
                <p className="text-[10px] text-slate-300">Intente expandir el rango de fechas o cambiar el departamento.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-center">
                    <th className="py-3 px-4 text-left">Fecha</th>
                    <th className="py-3 px-3 text-left">Nombre</th>
                    <th className="py-3 px-3 text-left">Departamento</th>
                    <th className="py-3 px-2">Turno</th>
                    <th className="py-3 px-2">Entrada</th>
                    <th className="py-3 px-2">Salida</th>
                    <th className="py-3 px-2">Detalles</th>
                    <th className="py-3 px-4 text-right">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-600">
                  {reportDataset.map((row, index) => {
                    const statusBadgeClass = {
                      PRESENTE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      TARDE: 'bg-amber-50 text-amber-700 border-amber-100',
                      AUSENTE: 'bg-rose-50 text-rose-700 border-rose-100',
                      FERIADO_TRABAJADO: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                      EN_DESCANSO: 'bg-sky-50 text-sky-700 border-sky-100',
                      SIN_SALIDA: 'bg-orange-50 text-orange-700 border-orange-100',
                      LIBRE: 'bg-slate-50 text-slate-400 border-slate-100'
                    }[row.status] || 'bg-slate-100 text-slate-600 border-slate-200';

                    return (
                      <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-700 whitespace-nowrap">{row.date}</td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-800 text-xs">{row.name}</div>
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5">{row.empId}</div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 font-medium">{row.dept}</td>
                        <td className="py-3.5 px-2 text-center">
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded font-mono font-bold text-[9px] border">
                            {row.shift}
                          </span>
                        </td>
                        <td className="py-3.5 px-2 text-center font-mono text-xs">{row.checkIn}</td>
                        <td className="py-3.5 px-2 text-center font-mono text-xs">{row.checkOut}</td>
                        <td className="py-3.5 px-2 text-slate-400 font-medium text-[10px]">
                          {row.status === 'AUSENTE' && 'Sin marcajes recibidos'}
                          {row.lateMin > 0 && `+${row.lateMin} min tarde`}
                          {row.otHours > 0 && `+${row.otHours} hr extras`}
                          {row.status === 'PRESENTE' && row.checkOut !== '--:--:--' && 'Sesión completa'}
                          {row.status === 'PRESENTE' && row.checkOut === '--:--:--' && `GPS: ${row.accuracy} | WiFi OK`}
                          {row.status === 'FERIADO_TRABAJADO' && 'Pago incremental 1.75x'}
                          {row.status === 'SIN_SALIDA' && 'Alerta: Sin marcaje de fin'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${statusBadgeClass}`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Bloque Criptográfico de Auditoría */}
        <div className="bg-slate-950 text-slate-400 rounded-xl p-4 border border-slate-800 font-mono text-[9px] space-y-2">
          <div className="flex justify-between items-center text-indigo-400 font-bold border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={11} /> SELLO DE AUDITABILIDAD CRIPTOGRÁFICA
            </span>
            <span>KRONO CRYPTO-VAULT SECURE v1.2</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 leading-relaxed">
            <div>
              <span className="text-slate-500 font-semibold block">INTEGRIDAD REFERENCIAL</span>
              <span className="text-slate-300 block break-all font-bold">{CRYPTO_KEY}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">AUDITORÍA ADMINISTRATIVA</span>
              <span className="text-slate-300 block">
                Operador: Diana Prince (Director RRHH) | IP: 198.51.100.12 | UTC: {new Date().toISOString()}
              </span>
            </div>
          </div>
        </div>

        {/* Firma de Autorización en Print PDF */}
        <div className="hidden print:grid grid-cols-2 gap-8 pt-12 text-center text-[10px] font-bold text-slate-800">
          <div>
            <div className="border-b border-slate-400 w-48 mx-auto h-12" />
            <div className="mt-1">Firma de Supervisor / Autorizador</div>
            <div className="text-[8px] text-slate-400 font-medium">Responsable del Departamento</div>
          </div>
          <div>
            <div className="border-b border-slate-400 w-48 mx-auto h-12" />
            <div className="mt-1">Diana Prince</div>
            <div className="text-[8px] text-slate-400 font-medium">Director de Recursos Humanos</div>
          </div>
        </div>

      </div>
    </div>
  );
}
