import React, { useState } from 'react';
import { 
  Users, UserCheck, Clock, UserX, AlertTriangle, FileText, Calendar, Compass, ShieldAlert,
  ArrowRight, Activity, TrendingUp, CheckCircle, BarChart3, PieChart, MapPin
} from 'lucide-react';

export default function Dashboard({ 
  employees, 
  incidents, 
  requests, 
  visitors, 
  rooms, 
  auditLogs,
  branches,
  setCurrentTab 
}) {
  const [selectedBranch, setSelectedBranch] = useState('ALL');

  // Filtrado reactivo multisucursal (Heurística 7 y 8)
  const filteredEmployees = selectedBranch === 'ALL' 
    ? employees 
    : employees.filter(e => e.branch === selectedBranch);

  const filteredIncidents = selectedBranch === 'ALL'
    ? incidents
    : incidents.filter(i => {
        const emp = employees.find(e => e.name === i.employee);
        return emp && emp.branch === selectedBranch;
      });

  const filteredVisitors = selectedBranch === 'ALL'
    ? visitors
    : visitors.filter(v => v.branch === selectedBranch);

  const filteredRooms = selectedBranch === 'ALL'
    ? rooms
    : rooms.filter(r => r.branch === selectedBranch);

  const filteredRequests = selectedBranch === 'ALL'
    ? requests
    : requests.filter(r => {
        const emp = employees.find(e => e.name === r.employee);
        return emp && emp.branch === selectedBranch;
      });

  const filteredAuditLogs = selectedBranch === 'ALL'
    ? auditLogs
    : auditLogs.filter(log => {
        const emp = employees.find(e => e.name === log.actor || e.name === log.affectedEntity);
        if (emp) return emp.branch === selectedBranch;
        const room = rooms.find(r => r.id === log.affectedEntity || r.name === log.affectedEntity);
        if (room) return room.branch === selectedBranch;
        return false;
      });

  // Computar KPIs dinámicamente sobre los datos filtrados
  const totalEmployees = filteredEmployees.length;
  const presentToday = filteredEmployees.filter(e => e.status === 'PRESENTE' || e.status === 'TARDE' || e.status === 'EN_DESCANSO' || e.status === 'FERIADO_TRABAJADO').length;
  const lateArrivals = filteredEmployees.filter(e => e.status === 'TARDE').length;
  const absences = filteredEmployees.filter(e => e.status === 'AUSENTE').length;
  const missingCheckouts = filteredEmployees.filter(e => e.status === 'SIN_SALIDA').length;
  const pendingRequests = filteredRequests.filter(r => r.status === 'PENDIENTE').length;
  const pendingSlaOverdue = filteredIncidents.filter(i => i.status === 'ESCALADO' || i.slaRemaining === 0).length;
  const expectedVisitors = filteredVisitors.filter(v => v.status === 'PRE_REGISTERED' || v.status === 'ARRIVED' || v.status === 'GEO_VERIFIED' || v.status === 'ANNOUNCED').length;
  const occupiedRooms = filteredRooms.filter(r => r.status === 'CHECKED_IN' || r.status === 'RESERVADO').length;

  const kpis = [
    { 
      title: 'Empleados Activos', 
      value: totalEmployees, 
      sub: 'En la sucursal seleccionada', 
      icon: Users, 
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      tab: 'Asistencia en Vivo'
    },
    { 
      title: 'Presentes Hoy', 
      value: presentToday, 
      sub: totalEmployees > 0 ? `${Math.round((presentToday / totalEmployees) * 100)}% de asistencia` : '0% de asistencia', 
      icon: UserCheck, 
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
      tab: 'Asistencia en Vivo'
    },
    { 
      title: 'Entradas Tardías', 
      value: lateArrivals, 
      sub: 'Fuera de tolerancia de 10m', 
      icon: Clock, 
      color: lateArrivals > 0 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-slate-500 bg-slate-50 border-slate-100',
      tab: 'Triage de Incidentes'
    },
    { 
      title: 'Ausencias Totales', 
      value: absences, 
      sub: 'Sin entrada registrada', 
      icon: UserX, 
      color: absences > 0 ? 'text-red-600 bg-red-50 border-red-100' : 'text-slate-500 bg-slate-50 border-slate-100',
      tab: 'Triage de Incidentes'
    },
    { 
      title: 'Sin Salida Registrada', 
      value: missingCheckouts, 
      sub: 'Límite de turno superado', 
      icon: ShieldAlert, 
      color: missingCheckouts > 0 ? 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse' : 'text-slate-500 bg-slate-50 border-slate-100',
      tab: 'Triage de Incidentes'
    },
    { 
      title: 'Excesos de SLA', 
      value: pendingSlaOverdue, 
      sub: 'Escalados a mesa corporativa', 
      icon: AlertTriangle, 
      color: pendingSlaOverdue > 0 ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-slate-500 bg-slate-50 border-slate-100',
      tab: 'Solicitudes ESS'
    },
    { 
      title: 'Visitas Esperadas', 
      value: expectedVisitors, 
      sub: 'Programadas para hoy', 
      icon: Calendar, 
      color: 'text-sky-600 bg-sky-50 border-sky-100',
      tab: 'Control de Visitantes'
    },
    { 
      title: 'Ocupación de Salas', 
      value: `${occupiedRooms}/${filteredRooms.length}`, 
      sub: 'Reservadas o en uso', 
      icon: Compass, 
      color: 'text-violet-600 bg-violet-50 border-violet-100',
      tab: 'Salas de Reunión'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Cabecera Adaptativa (Heurística 8: Estética y Minimalismo) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Panel General</h1>
          <p className="text-slate-500 mt-1">
            Resumen ejecutivo y telemetría operativa en tiempo real {selectedBranch !== 'ALL' && `para ${selectedBranch}`}.
          </p>
        </div>

        {branches && branches.length > 1 && (
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 border border-slate-200 rounded-xl shadow-xs text-xs font-bold">
            <span className="text-slate-500 flex items-center gap-1"><MapPin size={13} /> Sucursal:</span>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer font-bold focus:ring-0"
            >
              <option value="ALL">Todas las Sucursales</option>
              {branches.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Rejilla de KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <button
              key={idx}
              onClick={() => setCurrentTab(kpi.tab)}
              className="text-left bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex justify-between items-start cursor-pointer"
            >
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{kpi.title}</span>
                <div className="text-3xl font-bold text-slate-800 tracking-tight">{kpi.value}</div>
                <span className="text-xs text-slate-500 block">{kpi.sub}</span>
              </div>
              <div className={`p-3 rounded-lg border ${kpi.color} transition-transform group-hover:scale-105`}>
                <Icon size={20} className="stroke-[2px]" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Sección de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Tendencia de Asistencia */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-500" />
                Tendencia de Asistencia Semanal
              </h3>
              <p className="text-xs text-slate-400">Porcentaje de asistencia sobre la plantilla programada</p>
            </div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">Promedio: 94.2%</span>
          </div>

          <div className="relative h-64 w-full">
            <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="70" x2="500" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />
              <line x1="0" y1="170" x2="500" y2="170" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3" />

              <path
                d="M 10 170 L 90 60 L 170 80 L 250 40 L 330 30 L 410 70 L 490 25 L 490 170 Z"
                fill="url(#areaGrad)"
              />

              <path
                d="M 10 170 L 90 60 L 170 80 L 250 40 L 330 30 L 410 70 L 490 25"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <circle cx="10" cy="170" r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <circle cx="90" cy="60" r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <circle cx="170" cy="80" r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <circle cx="250" cy="40" r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <circle cx="330" cy="30" r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <circle cx="410" cy="70" r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <circle cx="490" cy="25" r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />

              <text x="10" y="192" fill="#94a3b8" fontSize="10" textAnchor="middle">Lun</text>
              <text x="90" y="192" fill="#94a3b8" fontSize="10" textAnchor="middle">Mar</text>
              <text x="170" y="192" fill="#94a3b8" fontSize="10" textAnchor="middle">Mié</text>
              <text x="250" y="192" fill="#94a3b8" fontSize="10" textAnchor="middle">Jue</text>
              <text x="330" y="192" fill="#94a3b8" fontSize="10" textAnchor="middle">Vie</text>
              <text x="410" y="192" fill="#94a3b8" fontSize="10" textAnchor="middle">Sáb</text>
              <text x="490" y="192" fill="#94a3b8" fontSize="10" textAnchor="middle">Dom</text>

              <text x="492" y="20" fill="#94a3b8" fontSize="9" textAnchor="start">100%</text>
              <text x="492" y="70" fill="#94a3b8" fontSize="9" textAnchor="start">95%</text>
              <text x="492" y="120" fill="#94a3b8" fontSize="9" textAnchor="start">90%</text>
              <text x="492" y="170" fill="#94a3b8" fontSize="9" textAnchor="start">85%</text>
            </svg>
          </div>
        </div>

        {/* Gráfico 2: Distribución de Estado de Asistencia */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <PieChart size={16} className="text-emerald-500" />
              Distribución de Asistencia Hoy
            </h3>
            <p className="text-xs text-slate-400">Proporciones sobre los colaboradores activos</p>
          </div>

          <div className="flex items-center justify-center py-2">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="3.2" strokeDasharray="62.5 37.5" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f59e0b" strokeWidth="3.2" strokeDasharray="12.5 87.5" strokeDashoffset="-62.5" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="3.2" strokeDasharray="12.5 87.5" strokeDashoffset="-75" />
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#fda4af" strokeWidth="3.2" strokeDasharray="12.5 87.5" strokeDashoffset="-87.5" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-5 shadow-inner">
                <span className="text-xl font-bold text-slate-800">{presentToday}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Activos</span>
              </div>
            </div>
          </div>

          {/* Leyendas */}
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span>Puntuales (62.5%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              <span>Tardíos (12.5%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
              <span>Ausentes (12.5%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-300 shrink-0"></span>
              <span>Sin Salida (12.5%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 3: Horas Extras por Departamento */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-5">
          <div>
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <BarChart3 size={16} className="text-indigo-500" />
              Horas Extras por Área (h)
            </h3>
            <p className="text-xs text-slate-400">Total acumulado de horas extras este período</p>
          </div>

          <div className="space-y-4">
            {[
              { dept: 'Operaciones', hours: selectedBranch === 'Planta Industrial Norte' ? 0.0 : 7.0, color: 'bg-indigo-500', max: 8 },
              { dept: 'TI y Sistemas', hours: selectedBranch === 'Planta Industrial Norte' ? 0.0 : 2.0, color: 'bg-indigo-400', max: 8 },
              { dept: 'Experiencia Cliente', hours: selectedBranch === 'Planta Industrial Norte' ? 0.0 : 1.25, color: 'bg-indigo-300', max: 8 },
              { dept: 'Recursos Humanos', hours: 0.0, color: 'bg-slate-200', max: 8 },
              { dept: 'Logística', hours: selectedBranch === 'Corporativo Central' ? 0.0 : 0.0, color: 'bg-slate-200', max: 8 },
            ].map((d, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-slate-600">{d.dept}</span>
                  <span className="font-bold text-slate-800">{d.hours}h</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`${d.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${(d.hours / d.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla de Actividades Recientes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Activity size={16} className="text-violet-500" />
              Flujo de Actividad en Vivo
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
              Telemetría Activa
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-64 pr-1">
            {filteredAuditLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-semibold">
                Sin actividad registrada en esta sucursal.
              </div>
            ) : (
              filteredAuditLogs.slice(0, 5).map((log, index) => {
                let badgeColor = 'bg-slate-100 text-slate-700';
                if (log.action === 'REGISTRO_ENTRADA') badgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                if (log.action === 'INTENTO_REPLAY') badgeColor = 'bg-red-50 text-red-700 border border-red-100';
                if (log.action === 'LIBERAR_SALA_AUTOMATICO') badgeColor = 'bg-amber-50 text-amber-700 border border-amber-100';
                if (log.action === 'AJUSTE_MARCAJE') badgeColor = 'bg-indigo-50 text-indigo-700 border border-indigo-100';

                return (
                  <div key={index} className="py-3.5 flex justify-between items-start text-xs group hover:bg-slate-50/50 px-2 rounded-lg transition-colors">
                    <div className="space-y-1 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">{log.actor}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${badgeColor}`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-500 font-medium">
                        Afectado: <span className="font-bold text-slate-600">{log.affectedEntity}</span> &bull; 
                        Cambio: <span className="italic text-slate-500">"{log.prevValue}"</span> a <span className="font-semibold text-slate-700">"{log.newValue}"</span>
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span>Hash de Bloque: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-500 font-mono">{log.eventHash}</code></span>
                        <span>&bull;</span>
                        <span>Disp: {log.device}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap pt-0.5">{log.timestamp.split(' ')[1]} {log.timestamp.split(' ')[2]}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-2">
            <button 
              onClick={() => setCurrentTab('Pistas de Auditoría')}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Ver Pistas de Auditoría Inmutable Completa
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
