import React, { useState } from 'react';
import { 
  UserPlus, Link, QrCode, MapPin, Send, RefreshCw, CheckCircle, 
  Clock, Trash2, ShieldCheck, Clipboard
} from 'lucide-react';

export default function Visitors({ visitors, onAddVisitor, onUpdateVisitorStatus, onAddAuditLog }) {
  const [selectedVisitor, setSelectedVisitor] = useState(visitors[0] || null);

  // Estados de Formulario de Visita
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [host, setHost] = useState('Sofía Rodríguez');
  const [time, setTime] = useState('11:00 AM');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PRE_REGISTERED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'GEO_VERIFIED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ARRIVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ANNOUNCED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'EXPIRED':
        return 'bg-slate-50 text-slate-400 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleCreateVisitor = (e) => {
    e.preventDefault();
    const newId = `VIS-${Math.floor(700 + Math.random() * 299)}`;
    const newVis = {
      id: newId,
      name,
      company,
      host,
      appointmentTime: time,
      status: 'PRE_REGISTERED',
      geofenceDistance: `${(20 + Math.random() * 200).toFixed(1)}m`,
      qrCode: `KRN-VIS-${Math.floor(1000000 + Math.random() * 9000000)}`,
      notified: false
    };

    onAddVisitor(newVis);
    setSelectedVisitor(newVis);
    onAddAuditLog(
      'Recepcionista', 
      'REGISTRAR_VISITA', 
      newId, 
      'NINGUNO', 
      'PRE_REGISTERED', 
      `Pre-enrolada visita de ${name} (${company}) para el anfitrión ${host}`
    );

    setName('');
    setCompany('');
  };

  const handleNotifyHost = (vis) => {
    onUpdateVisitorStatus(vis.id, { notified: true, status: 'ANNOUNCED' });
    
    const updated = { ...vis, notified: true, status: 'ANNOUNCED' };
    setSelectedVisitor(updated);
    
    onAddAuditLog(
      'Kiosco de Accesos', 
      'NOTIFICAR_VISITA', 
      vis.id, 
      vis.status, 
      'ANNOUNCED', 
      `Notificación de arribo enviada al anfitrión ${vis.host}`
    );

    alert(`¡Notificación enviada! El anfitrión ${vis.host} fue alertado por Slack.`);
  };

  const handleGeoVerify = (vis) => {
    onUpdateVisitorStatus(vis.id, { status: 'GEO_VERIFIED', geofenceDistance: '4.2m' });
    
    const updated = { ...vis, status: 'GEO_VERIFIED', geofenceDistance: '4.2m' };
    setSelectedVisitor(updated);

    onAddAuditLog(
      'Móvil del Visitante', 
      'VALIDAR_GEOCERCA_VISITA', 
      vis.id, 
      vis.status, 
      'GEO_VERIFIED', 
      `Geocerca del visitante confirmada dentro de radio de tolerancia (4.2m). Pase habilitado.`
    );
  };

  const handleCopyLink = (vis) => {
    const linkText = `https://krono.app/invite/TNT-8942-X90/${vis.id.toLowerCase()}`;
    navigator.clipboard.writeText(linkText);
    alert('¡Enlace web de invitación temporal copiado al portapapeles!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Control de Visitantes</h1>
        <p className="text-slate-500 mt-1">Pre-enrole visitas corporativas, despache pases efímeros y audite la ubicación de arribo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Registro */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserPlus className="text-indigo-500" size={18} />
            <h3 className="font-bold text-slate-800 text-sm">Registro de Visita Nueva</h3>
          </div>

          <form onSubmit={handleCreateVisitor} className="space-y-4 text-xs font-semibold text-slate-600">
            <div className="space-y-1">
              <label className="block text-slate-500">Nombre de la Visita</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Juan Miller"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-500">Empresa / Procedencia</label>
              <input
                type="text"
                required
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Ej. Stripe Inc."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-slate-500">Anfitrión (Empleado)</label>
                <select
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2"
                >
                  <option value="Sofía Rodríguez">Sofía Rodríguez</option>
                  <option value="Juan Pérez">Juan Pérez</option>
                  <option value="Lucía Fernández">Lucía Fernández</option>
                  <option value="Carlos Díaz">Carlos Díaz</option>
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="block text-slate-500">Hora Agendada</label>
                <input
                  type="text"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
            >
              Generar Pase Temporal
            </button>
          </form>
        </div>

        {/* Listado de visitas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Bandeja de Visitas Agendadas</h3>
            <span className="text-xs font-semibold text-slate-400">
              Registros activos: {visitors.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Visitante</th>
                  <th className="py-3 px-4">Anfitrión</th>
                  <th className="py-3 px-4 font-mono">Cita</th>
                  <th className="py-3 px-4">Ubicación Teletrato</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                {visitors.map((vis) => (
                  <tr 
                    key={vis.id} 
                    onClick={() => setSelectedVisitor(vis)}
                    className={`cursor-pointer transition-colors ${
                      selectedVisitor && selectedVisitor.id === vis.id 
                        ? 'bg-slate-50 font-bold border-l-2 border-indigo-600' 
                        : 'hover:bg-slate-50/40'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-slate-800 block">{vis.name}</span>
                        <span className="text-[10px] text-slate-400 block font-medium">{vis.company}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{vis.host}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{vis.appointmentTime}</td>
                    <td className="py-3 px-4">
                      {vis.geofenceDistance !== 'Unknown' && vis.geofenceDistance !== 'Desconocido' ? (
                        <span className="flex items-center gap-1 font-mono">
                          <MapPin size={11} className={parseFloat(vis.geofenceDistance) < 15 ? "text-emerald-500" : "text-slate-400"} />
                          {vis.geofenceDistance}
                        </span>
                      ) : (
                        <span className="text-slate-300">--</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(vis.status)}`}>
                        {vis.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {vis.status === 'PRE_REGISTERED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGeoVerify(vis);
                          }}
                          className="px-2 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Confirmar Geo
                        </button>
                      )}
                      
                      {(vis.status === 'ARRIVED' || vis.status === 'GEO_VERIFIED') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotifyHost(vis);
                          }}
                          className="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold cursor-pointer"
                        >
                          Anunciar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Pase temporal detalle */}
      {selectedVisitor && (
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 shadow-inner grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          
          {/* Link */}
          <div className="space-y-3 bg-white p-4 rounded-xl border">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Link size={12} /> Enlace de Invitación Temporal
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Esta URL tokenizada expira automáticamente 2 horas después de la cita agendada.
            </p>
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={`krono.app/invite/TNT-8942-X90/${selectedVisitor.id.toLowerCase()}`}
                className="w-full text-[10px] bg-slate-50 border px-2 py-1.5 rounded font-mono text-slate-500 focus:outline-none"
              />
              <button 
                onClick={() => handleCopyLink(selectedVisitor)}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition-all cursor-pointer"
                title="Copiar enlace"
              >
                <Clipboard size={14} />
              </button>
            </div>
          </div>

          {/* QR */}
          <div className="space-y-4 bg-white p-4 rounded-xl border flex flex-col items-center justify-center">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 self-start">
              <QrCode size={12} /> Pase Peatonal QR
            </h4>
            
            <div className="p-3 bg-slate-50 border-2 border-slate-900 rounded-lg relative overflow-hidden group select-none flex items-center justify-center">
              <div className="w-24 h-24 bg-white grid grid-cols-8 gap-0 p-1">
                {Array.from({ length: 64 }).map((_, i) => {
                  const seed = selectedVisitor.qrCode.charCodeAt(i % selectedVisitor.qrCode.length);
                  const isDark = (i * seed) % 2 === 0 || i < 8 || i > 56;
                  return <div key={i} className={`w-full h-full ${isDark ? 'bg-slate-900' : 'bg-white'}`} />;
                })}
              </div>
            </div>
            
            <div className="text-center">
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border">
                {selectedVisitor.qrCode}
              </span>
            </div>
          </div>

          {/* Coordenadas */}
          <div className="space-y-3 bg-white p-4 rounded-xl border flex flex-col justify-between">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ShieldCheck size={12} /> Estado de Geocerca de Visita
              </h4>
              <div className="mt-3 text-xs space-y-2 font-semibold">
                <div className="flex justify-between">
                  <span className="text-slate-400">Visitante:</span>
                  <span className="text-slate-800 font-bold">{selectedVisitor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Validación:</span>
                  <span className="text-indigo-600">Geolocalización Web de Navegador</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coincidencia de Radio:</span>
                  <span className={parseFloat(selectedVisitor.geofenceDistance) < 15 ? "text-emerald-600" : "text-slate-800"}>
                    {parseFloat(selectedVisitor.geofenceDistance) < 15 ? 'VERIFICADO (Dentro de Rango)' : 'FUERA DEL RADIO'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              {selectedVisitor.status !== 'ANNOUNCED' && selectedVisitor.status !== 'EXPIRED' && (
                <button
                  onClick={() => handleNotifyHost(selectedVisitor)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-1.5 cursor-pointer text-xs transition-all"
                >
                  <Send size={12} /> Confirmar Notificación de Arribo
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
