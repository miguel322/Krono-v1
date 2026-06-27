import React, { useState } from 'react';
import { 
  FileText, MapPin, Calendar, Clock, User, ShieldAlert, Check, X,
  ExternalLink, ArrowRight, ShieldCheck, ChevronRight
} from 'lucide-react';

export default function EssRequests({ requests, onResolveRequest, onAddAuditLog }) {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDIENTE':
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'APROBADO':
      case 'APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'RECHAZADO':
      case 'REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleResolve = (id, newStatus) => {
    onResolveRequest(id, newStatus);
    if (selectedRequest && selectedRequest.id === id) {
      setSelectedRequest({ ...selectedRequest, status: newStatus === 'APPROVED' ? 'APROBADO' : 'RECHAZADO' });
    }
    onAddAuditLog(
      'Admin de RRHH', 
      newStatus === 'APPROVED' ? 'APROBAR_SOLICITUD_ESS' : 'RECHAZAR_SOLICITUD_ESS', 
      id, 
      'PENDIENTE', 
      newStatus === 'APPROVED' ? 'APROBADO' : 'RECHAZADO', 
      `Resuelta solicitud ESS ${id} para ${selectedRequest?.employee || 'Colaborador'} como ${newStatus === 'APPROVED' ? 'APROBADO' : 'RECHAZADO'}`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Solicitudes ESS y Aprobaciones</h1>
        <p className="text-slate-500 mt-1">Revise solicitudes de corrección, justificaciones de inasistencia y registros retroactivos cargados por los empleados.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bandeja de solicitudes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Bandeja de Entrada ESS</h3>
            <span className="text-xs font-semibold text-slate-400">
              Pendientes: {requests.filter(r => r.status === 'PENDIENTE' || r.status === 'PENDING').length} solicitudes
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {requests.map((req) => (
              <div 
                key={req.id} 
                onClick={() => setSelectedRequest(req)}
                className={`py-4 px-3 flex justify-between items-center cursor-pointer transition-all rounded-lg ${
                  selectedRequest && selectedRequest.id === req.id 
                    ? 'bg-slate-50 border border-slate-200/80 shadow-inner' 
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{req.employee}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-xs text-slate-400 font-semibold">{req.department}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold text-[10px] uppercase">
                      {req.type}
                    </span>
                    <span className="text-slate-400 truncate max-w-sm block font-medium">{req.details}</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                    <span>Enviado: {req.requestDate}</span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={10} /> Distancia: {req.distance}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 space-y-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(req.status)}`}>
                    {req.status}
                  </span>
                  <div className="text-[10px] text-slate-400 font-bold flex items-center justify-end gap-1">
                    <Clock size={10} /> {req.sla}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Auditoría de telemetría */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="text-indigo-500" size={18} />
            <h3 className="font-bold text-slate-800 text-sm">Auditoría de Telemetría</h3>
          </div>

          {selectedRequest ? (
            <div className="space-y-6 text-xs font-semibold text-slate-600">
              
              <div className="bg-slate-50 p-4 rounded-xl border space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{selectedRequest.employee}</h4>
                    <span className="text-slate-400 block mt-0.5 font-medium">{selectedRequest.department}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${getStatusBadge(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <p className="text-slate-600 text-xs italic bg-white border p-2.5 rounded-lg leading-relaxed mt-2 font-medium">
                  "{selectedRequest.details}"
                </p>
              </div>

              {/* Mapa de validación */}
              {selectedRequest.type === 'Marcaje Retroactivo' || selectedRequest.type === 'Retroactive Clock-In' || selectedRequest.type === 'Corrección de Marcaje' || selectedRequest.type === 'Punch Correction' ? (
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ubicación Georreferenciada</h4>
                  
                  <div className="w-full h-32 bg-slate-100 rounded-xl border relative overflow-hidden flex items-center justify-center select-none shadow-inner">
                    <div className="absolute inset-0 opacity-15" style={{ 
                      backgroundImage: 'radial-gradient(circle, #4f46e5 1.5px, transparent 1.5px)', 
                      backgroundSize: '16px 16px' 
                    }} />
                    
                    <svg className="absolute inset-0 w-full h-full">
                      <circle cx="50%" cy="50%" r="35" fill="#4f46e5" fillOpacity="0.08" stroke="#4f46e5" strokeWidth="1" strokeDasharray="3" />
                      <circle cx="50%" cy="50%" r="4" fill="#4f46e5" />
                      
                      {selectedRequest.distance.includes('185m') ? (
                        <>
                          <line x1="50%" y1="50%" x2="78%" y2="25%" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="2" />
                          <circle cx="78%" cy="25%" r="6" fill="#ef4444" className="animate-pulse" />
                        </>
                      ) : (
                        <>
                          <line x1="50%" y1="50%" x2="55%" y2="42%" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2" />
                          <circle cx="55%" cy="42%" r="6" fill="#10b981" />
                        </>
                      )}
                    </svg>

                    <div className="absolute bottom-2.5 left-2.5 bg-slate-900/90 text-white px-2 py-0.5 rounded font-mono text-[9px]">
                      {selectedRequest.gps}
                    </div>

                    <div className="absolute top-2.5 right-2.5 bg-white border border-slate-200 px-2 py-0.5 rounded text-[9px] font-bold text-slate-700">
                      Margen: {selectedRequest.distance}
                    </div>
                  </div>

                  {/* Documento adjunto */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-indigo-500" />
                      <div>
                        <span className="font-bold text-slate-700 block truncate max-w-[160px]">{selectedRequest.evidence}</span>
                        <span className="text-[9px] text-slate-400 block font-mono">Comprobante Integrado (SHA-256)</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => alert(`Visualizando documento simulado: ${selectedRequest.evidence}`)}
                      className="text-indigo-600 hover:text-indigo-800 p-1 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                      title="Ver adjunto"
                    >
                      <ExternalLink size={14} />
                    </button>
                  </div>
                </div>
              ) : null}

              {/* SLA de flujo */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Línea de Aprobación y SLA</h4>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 border p-3 rounded-lg bg-slate-50/50">
                  <div className="flex items-center gap-1">
                    <User size={13} className="text-slate-400" />
                    <span>Empleado</span>
                  </div>
                  <ChevronRight size={12} className="text-slate-300" />
                  <div className="flex items-center gap-1">
                    <User size={13} className="text-indigo-600" />
                    <span className="text-indigo-700">Supervisor</span>
                  </div>
                  <ChevronRight size={12} className="text-slate-300" />
                  <div className="flex items-center gap-1">
                    <ShieldAlert size={13} className={selectedRequest.sla.includes('Vencido') ? "text-rose-600 animate-pulse" : "text-slate-400"} />
                    <span className={selectedRequest.sla.includes('Vencido') ? "text-rose-700 font-bold" : "text-slate-400"}>Mesa RRHH</span>
                  </div>
                </div>
                {selectedRequest.sla.includes('Vencido') && (
                  <div className="text-[9px] text-rose-600 bg-rose-50 border border-rose-100/50 px-2 py-1.5 rounded-md font-bold uppercase">
                    Escalación Activa: Asignado automáticamente a RRHH Corporativo por vencimiento de plazo del supervisor (&gt;24h)
                  </div>
                )}
              </div>

              {/* Acciones */}
              {selectedRequest.status === 'PENDIENTE' || selectedRequest.status === 'PENDING' ? (
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleResolve(selectedRequest.id, 'REJECTED')}
                    className="flex-1 py-2 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <X size={14} /> Rechazar
                  </button>
                  <button
                    onClick={() => handleResolve(selectedRequest.id, 'APPROVED')}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check size={14} /> Aprobar
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 border p-3 rounded-lg flex items-center gap-2 justify-center text-slate-500 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>Solicitud Resuelta</span>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-medium">
              Seleccione una solicitud activa de la bandeja de entrada para verificar la telemetría geográfica y el estado del SLA.
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
