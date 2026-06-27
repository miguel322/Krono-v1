import React, { useState } from 'react';
import { 
  AlertTriangle, ShieldAlert, Clock, Check, X, Send,
  SlidersHorizontal, Search, FileDown, CheckCircle2, UserCheck
} from 'lucide-react';

export default function Incidents({ 
  incidents, 
  onResolveIncident, 
  onAddAuditLog 
}) {
  const [filterType, setFilterType] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar incidentes
  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = inc.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inc.caseName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Normalizar tipos
    let normalizedType = inc.type;
    if (filterType === 'LATE') normalizedType = 'TARDE';
    if (filterType === 'ABSENT') normalizedType = 'AUSENTE';
    if (filterType === 'MISSING_CHECKOUT') normalizedType = 'SIN_SALIDA';
    if (filterType === 'ESCALATED') normalizedType = 'ESCALADO';

    if (filterType === 'ALL') return matchesSearch;
    return matchesSearch && inc.type === normalizedType;
  });

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'WARNING':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'INFO':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getSlaGauge = (hours) => {
    if (hours === 0) {
      return (
        <div className="w-full space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-rose-600">
            <span>SLA INCUMPLIDO</span>
            <span>0h</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-600 h-full rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      );
    }

    let barColor = 'bg-emerald-500';
    let textColor = 'text-emerald-700';
    if (hours <= 8) {
      barColor = 'bg-red-500';
      textColor = 'text-red-600';
    } else if (hours <= 20) {
      barColor = 'bg-amber-500';
      textColor = 'text-amber-600';
    }

    const pct = Math.min((hours / 24) * 100, 100);

    return (
      <div className="w-full space-y-1">
        <div className={`flex justify-between text-[10px] font-bold ${textColor}`}>
          <span>{hours}h restantes</span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div className={`${barColor} h-full rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Triage de Incidentes</h1>
          <p className="text-slate-500 mt-1">Gestione excepciones de entrada tardía, ausencias no justificadas y salidas omitidas antes de exportar a nómina.</p>
        </div>

        {/* Leyenda SLA */}
        <div className="flex gap-4 text-[10px] font-bold text-slate-500 bg-white p-3 rounded-lg border shadow-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            <span>Holgado (&gt;20h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
            <span>Advertencia (8h-20h)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500 animate-pulse"></span>
            <span>Crítico (&lt;8h)</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por caso, empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-semibold"
          />
        </div>

        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto justify-end">
          {[
            { label: 'Todos los Incidentes', val: 'ALL' },
            { label: 'Entradas Tardías', val: 'LATE' },
            { label: 'Ausencias', val: 'ABSENT' },
            { label: 'Sin Salida', val: 'MISSING_CHECKOUT' },
            { label: 'Escalados a RRHH', val: 'ESCALATED' }
          ].map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setFilterType(tab.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                filterType === tab.val
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rejilla de la Tabla */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Caso de Incidente</th>
                <th className="py-4 px-6">Empleado</th>
                <th className="py-4 px-6">Área / Depto</th>
                <th className="py-4 px-6">Categoría</th>
                <th className="py-4 px-6">Severidad</th>
                <th className="py-4 px-6" style={{ width: '160px' }}>Límite SLA</th>
                <th className="py-4 px-6">Responsable</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-slate-400 font-medium">
                    ¡Sin incidentes abiertos. Todas las excepciones de asistencia se encuentran resueltas!
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {inc.severity === 'CRITICAL' ? (
                          <ShieldAlert size={14} className="text-rose-500" />
                        ) : (
                          <AlertTriangle size={14} className="text-amber-500" />
                        )}
                        <div>
                          <span className="font-bold text-slate-800 block">{inc.caseName}</span>
                          <span className="text-[10px] text-slate-400 font-mono block">ID: {inc.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-700">
                      {inc.employee}
                    </td>

                    <td className="py-4 px-6">
                      {inc.department}
                    </td>

                    <td className="py-4 px-6">
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                        {inc.type}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getSeverityStyle(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      {getSlaGauge(inc.slaRemaining)}
                    </td>

                    <td className="py-4 px-6 text-slate-500 font-bold">
                      {inc.owner}
                    </td>

                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      {/* Waive / Aprobado */}
                      <button
                        onClick={() => {
                          onResolveIncident(inc.id, 'APPROVED');
                          onAddAuditLog('Admin de RRHH', 'EXIMIR_INCIDENTE', inc.id, 'INCIDENTE_ABIERTO', 'EXIMIDO', `Eximido incidente de asistencia para ${inc.employee}`);
                        }}
                        className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                        title="Eximir de penalización"
                      >
                        <Check size={12} /> Eximir
                      </button>

                      {/* Escalar */}
                      {inc.status !== 'ESCALADO' && (
                        <button
                          onClick={() => {
                            onResolveIncident(inc.id, 'ESCALADO');
                            onAddAuditLog('Supervisor Daemon', 'ESCALAR_INCIDENTE', inc.id, 'INCIDENTE_ABIERTO', 'ESCALADO_RRHH', `Incidente escalado a RRHH Corporativo por retraso en resolución.`);
                          }}
                          className="p-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                          title="Escalar a RRHH Corporativo"
                        >
                          <Send size={12} /> Escalar
                        </button>
                      )}

                      {/* Evidencias */}
                      <button
                        onClick={() => {
                          alert(`Notificación de solicitud de comprobantes enviada al móvil de ${inc.employee}.`);
                          onAddAuditLog('Admin de RRHH', 'SOLICITUD_EVIDENCIA', inc.id, 'PENDIENTE', 'ESPERANDO_EVIDENCIA', `Solicitada documentación justificativa al empleado ${inc.employee}`);
                        }}
                        className="p-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold"
                      >
                        Comprobante
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
