import React, { useState } from 'react';
import { 
  Search, SlidersHorizontal, MapPin, Eye, Edit2, ShieldCheck, Check, X,
  Clock, Smartphone, RefreshCw, AlertCircle, FileText, ChevronRight
} from 'lucide-react';

export default function LiveAttendance({ 
  employees, 
  onAdjustPunch, 
  onApproveException,
  onAddAuditLog 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Estado del Formulario de Edición
  const [isEditing, setIsEditing] = useState(false);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Filtrar empleados
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && emp.status === statusFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRESENTE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'TARDE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'AUSENTE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'SIN_SALIDA':
        return 'bg-red-50 text-red-700 border-red-200 animate-pulse';
      case 'EN_DESCANSO':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'FERIADO_TRABAJADO':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleOpenDrawer = (emp) => {
    setSelectedEmployee(emp);
    setEditCheckIn(emp.checkIn);
    setEditCheckOut(emp.checkOut);
    setEditNotes('');
    setIsEditing(false);
  };

  const handleSaveAdjustment = (e) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    onAdjustPunch(selectedEmployee.id, editCheckIn, editCheckOut, editNotes);
    
    const updated = {
      ...selectedEmployee,
      checkIn: editCheckIn,
      checkOut: editCheckOut,
      status: editCheckOut !== '--:--:--' ? 'PRESENTE' : (editCheckIn !== '--:--:--' ? 'PRESENTE' : 'AUSENTE'),
      timeline: [
        ...selectedEmployee.timeline,
        { time: new Date().toLocaleTimeString(), event: `Ajuste manual de marcaje: In[${editCheckIn}] Out[${editCheckOut}]`, type: 'adjustment' }
      ],
      adjustments: [
        ...selectedEmployee.adjustments,
        { timestamp: new Date().toISOString().replace('T', ' ').substring(0,19), actor: 'Admin de RRHH', action: 'Ajuste de Marcaje', detail: `Entrada: ${editCheckIn}, Salida: ${editCheckOut}. Motivo: ${editNotes}` }
      ]
    };
    setSelectedEmployee(updated);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 relative animate-in fade-in duration-300">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Asistencia en Vivo</h1>
          <p className="text-slate-500 mt-1">Control de entradas y salidas en tiempo real con validaciones de telemetría y geolocalización.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          Enlaces de Telemetría: ONLINE
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por empleado, área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-semibold"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          {[
            { label: 'Todo el Personal', val: 'ALL' },
            { label: 'Presentes', val: 'PRESENTE' },
            { label: 'Tardías', val: 'TARDE' },
            { label: 'Ausentes', val: 'AUSENTE' },
            { label: 'Sin Salida', val: 'SIN_SALIDA' },
            { label: 'En Descanso', val: 'EN_DESCANSO' },
            { label: 'Feriado', val: 'FERIADO_TRABAJADO' }
          ].map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setStatusFilter(tab.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                statusFilter === tab.val
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-4 px-6">Empleado</th>
                <th className="py-4 px-6">Área / Depto</th>
                <th className="py-4 px-6">Turno Asignado</th>
                <th className="py-4 px-6">Hora Entrada</th>
                <th className="py-4 px-6">Hora Salida</th>
                <th className="py-4 px-6">Método de Marcaje</th>
                <th className="py-4 px-6">Telemetría</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-600 font-semibold">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400 font-medium">
                    No se encontraron marcajes activos.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/30 transition-colors">
                    {/* Perfil */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={emp.avatar} 
                          alt={emp.name} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm shrink-0" 
                        />
                        <div>
                          <span className="font-bold text-slate-800 block">{emp.name}</span>
                          <span className="text-xs text-slate-400 block font-medium">{emp.role}</span>
                        </div>
                      </div>
                    </td>

                    {/* Departamento */}
                    <td className="py-4 px-6 text-slate-700">
                      {emp.department}
                    </td>

                    {/* Turno */}
                    <td className="py-4 px-6">
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        {emp.shift}
                      </span>
                    </td>

                    {/* Marcaje Entrada */}
                    <td className="py-4 px-6 font-mono font-bold">
                      {emp.checkIn}
                    </td>

                    {/* Marcaje Salida */}
                    <td className="py-4 px-6 font-mono font-bold">
                      {emp.checkOut}
                    </td>

                    {/* Método */}
                    <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                      {emp.method}
                    </td>

                    {/* Telemetría */}
                    <td className="py-4 px-6 text-xs">
                      {emp.gpsDistance ? (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-emerald-500 shrink-0" />
                          <span className="text-slate-700 font-bold">Verificado ({emp.gpsDistance}m)</span>
                        </div>
                      ) : (
                        <span className="text-slate-300">--</span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(emp.status)}`}>
                        {emp.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-6 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenDrawer(emp)}
                        className="p-1.5 bg-slate-50 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 rounded-lg transition-colors cursor-pointer"
                        title="Ver detalles criptográficos"
                      >
                        <Eye size={14} />
                      </button>
                      
                      {emp.status === 'SIN_SALIDA' || emp.status === 'TARDE' ? (
                        <button
                          onClick={() => {
                            onApproveException(emp.id);
                            onAddAuditLog('Admin de RRHH', 'APROBAR_EXCEPCION', emp.id, emp.status, 'PRESENTE (AUTO_APROBADO)', `Eximido retraso para ${emp.name}`);
                          }}
                          className="p-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer text-xs font-bold"
                          title="Aprobar dispensa"
                        >
                          <Check size={14} />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalle Lateral (Drawer) */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs cursor-pointer"
            onClick={() => setSelectedEmployee(null)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-slate-200 animate-in slide-in-from-right duration-300">
            {/* Cabecera Drawer */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <img 
                  src={selectedEmployee.avatar} 
                  alt={selectedEmployee.name} 
                  className="w-10 h-10 rounded-full border object-cover shadow-sm"
                />
                <div>
                  <h3 className="font-bold text-slate-800">{selectedEmployee.name}</h3>
                  <span className="text-xs text-slate-500 font-medium">{selectedEmployee.role}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEmployee(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido Drawer */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Telemetría */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Telemetría Criptográfica</h4>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-semibold">Vector de Marcaje</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Smartphone size={13} className="text-indigo-500" />
                      {selectedEmployee.method}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-semibold">Validación GPS</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <MapPin size={13} className={selectedEmployee.gpsDistance ? "text-emerald-500" : "text-slate-400"} />
                      {selectedEmployee.gpsDistance ? `Precisión ${selectedEmployee.gpsDistance}m` : 'No Disponible'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-0.5 font-semibold">Firma del Dispositivo</span>
                    <code className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded block text-slate-600 truncate font-mono">
                      {selectedEmployee.deviceFingerprint}
                    </code>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-semibold">Biometría Local</span>
                    <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${selectedEmployee.biometricVerified ? 'text-emerald-700' : 'text-slate-400'}`}>
                      {selectedEmployee.biometricVerified ? (
                        <>
                          <ShieldCheck size={13} /> Biometría Aprobada
                        </>
                      ) : 'Sin Verificar'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-0.5 font-semibold">Estado de Jornada</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(selectedEmployee.status)}`}>
                      {selectedEmployee.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ajustar marcaje */}
              <div className="border border-slate-200 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Ajuste Manual de Horarios</h4>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={12} /> Modificar Horas
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <form onSubmit={handleSaveAdjustment} className="space-y-4 text-xs font-semibold">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 mb-1">Hora Entrada</label>
                        <input
                          type="text"
                          value={editCheckIn}
                          onChange={(e) => setEditCheckIn(e.target.value)}
                          placeholder="hh:mm:ss"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-700 font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 mb-1">Hora Salida</label>
                        <input
                          type="text"
                          value={editCheckOut}
                          onChange={(e) => setEditCheckOut(e.target.value)}
                          placeholder="hh:mm:ss"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-700 font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1">Razón del Ajuste</label>
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="Justifique los motivos de este ajuste manual..."
                        required
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-700 focus:outline-none focus:border-indigo-500 h-16 resize-none"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border text-slate-600 rounded cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded cursor-pointer"
                      >
                        Aplicar Horario
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/50 p-3 rounded-lg border border-slate-100 font-semibold">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Entrada Registrada</span>
                      <span className="font-mono font-bold text-slate-800">{selectedEmployee.checkIn}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Salida Registrada</span>
                      <span className="font-mono font-bold text-slate-800">{selectedEmployee.checkOut}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bitácora de Telemetría */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Bitácora de Telemetría Diaria</h4>
                <div className="relative border-l border-slate-200 pl-4 ml-1.5 space-y-4">
                  {selectedEmployee.timeline.map((event, i) => (
                    <div key={i} className="relative text-xs">
                      <span className="absolute -left-[21px] top-1 bg-white p-0.5 border border-slate-300 rounded-full w-2.5 h-2.5 shrink-0" />
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-slate-400 font-mono">{event.time}</span>
                        <span className="font-bold text-slate-700">{event.event}</span>
                      </div>
                      {event.details && <p className="text-slate-400 mt-0.5 text-[10px] font-semibold">{event.details}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Ajustes inmutables */}
              {selectedEmployee.adjustments.length > 0 && (
                <div className="space-y-3 border-t border-slate-100 pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Historial de Ajustes Inmutables</h4>
                  <div className="space-y-3">
                    {selectedEmployee.adjustments.map((adj, i) => (
                      <div key={i} className="bg-amber-50/40 border border-amber-100 p-3 rounded-lg text-xs space-y-1 font-semibold">
                        <div className="flex justify-between items-center font-bold text-amber-800">
                          <span>{adj.action}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{adj.timestamp}</span>
                        </div>
                        <p className="text-slate-600">{adj.detail}</p>
                        <span className="text-[10px] block text-slate-400">Ejecutado por: {adj.actor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Drawer */}
            <div className="p-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50/50">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
