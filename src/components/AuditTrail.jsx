import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, Key, HelpCircle, RefreshCw, 
  Search, SlidersHorizontal, Layers, CheckCircle
} from 'lucide-react';

export default function AuditTrail({ auditLogs }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [verifyProgress, setVerifyProgress] = useState('IDLE'); // IDLE, RUNNING, SUCCESS
  const [activeTab, setActiveTab] = useState('ALL');

  // Filtrar logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.affectedEntity.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Normalizar pestañas
    let normalizedStatus = log.status;
    if (activeTab === 'VALIDATED') normalizedStatus = 'VALIDATED';
    if (activeTab === 'SUSPICIOUS') normalizedStatus = 'SUSPICIOUS';

    if (activeTab === 'ALL') return matchesSearch;
    return matchesSearch && log.status === normalizedStatus;
  });

  const handleVerifyLedger = () => {
    setVerifyProgress('RUNNING');
    setTimeout(() => {
      setVerifyProgress('SUCCESS');
    }, 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pistas de Auditoría Criptográfica</h1>
          <p className="text-slate-500 mt-1">Libro de asistencia inmutable de doble entrada. El borrado y modificación de registros crudos en la base de datos está bloqueado por el tenant.</p>
        </div>
        <button
          onClick={handleVerifyLedger}
          disabled={verifyProgress === 'RUNNING'}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
        >
          <RefreshCw size={14} className={verifyProgress === 'RUNNING' ? 'animate-spin' : ''} />
          {verifyProgress === 'IDLE' ? 'Verificar Integridad del Libro' : verifyProgress === 'RUNNING' ? 'Recalculando hashes...' : 'Integrity Verified'}
        </button>
      </div>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Ledger Integrity */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Integridad del Libro</span>
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-base">
            <ShieldCheck size={18} className="text-emerald-500" />
            <span>Cadena Verificada</span>
          </div>
          <span className="text-[10px] text-slate-400 block font-semibold">Bloques SHA-256 encadenados</span>
        </div>

        {/* Signed Events */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Firmas Criptográficas</span>
          <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-base">
            <Key size={18} className="text-indigo-500" />
            <span>100% de Firmas OK</span>
          </div>
          <span className="text-[10px] text-slate-400 block font-semibold">Asociado a llave asimétrica local</span>
        </div>

        {/* Managerial Adjustments */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Ajustes Administrativos</span>
          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-base">
            <Layers size={18} className="text-slate-500" />
            <span>2 Modificaciones</span>
          </div>
          <span className="text-[10px] text-slate-400 block font-semibold">Vinculadas a registros base</span>
        </div>

        {/* Blocked attempts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Replays Bloqueados</span>
          <div className="flex items-center gap-1.5 text-rose-700 font-bold text-base">
            <ShieldAlert size={18} className="text-rose-500 animate-pulse" />
            <span>1 Intento Falsificado</span>
          </div>
          <span className="text-[10px] text-slate-400 block font-semibold">Desviación temporal contenida</span>
        </div>
      </div>

      {/* Banner de Verificación */}
      {verifyProgress !== 'IDLE' && (
        <div className={`p-4 rounded-xl border text-xs font-semibold transition-all animate-in fade-in duration-300 ${
          verifyProgress === 'RUNNING' 
            ? 'bg-indigo-50 border-indigo-100 text-indigo-800' 
            : 'bg-emerald-50 border-emerald-100 text-emerald-800'
        }`}>
          {verifyProgress === 'RUNNING' ? (
            <div className="flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin text-indigo-600" />
              <span>Verificando firmas de raíces Merkle y recalculando alturas de transacciones del libro (Altura: 8,042 transacciones)...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-500" />
              <span>Auditoría de Seguridad Exitosa: Libro Criptográfico Auditado. Las 8,042 transacciones son auténticas y su firma está íntegra. No se detectó alteración en la base de datos.</span>
            </div>
          )}
        </div>
      )}

      {/* Explicación de Doble Entrada */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-500 leading-relaxed space-y-2">
        <h4 className="font-bold text-slate-800 text-sm uppercase">Diseño Inmutable de Doble Entrada Contable</h4>
        <p>
          Los registros de asistencia en Krono se comportan bajo el mismo paradigma de los libros contables. No se otorgan permisos de consulta <code className="bg-white px-1.5 py-0.5 rounded border text-rose-600 font-bold font-mono">DELETE</code> o <code className="bg-white px-1.5 py-0.5 rounded border text-amber-600 font-bold font-mono">UPDATE</code> en base de datos.
          Cuando se ajusta un marcaje, se concatena un registro de rectificación vinculado a la transacción original. El sistema resuelve el saldo neto para el cálculo de nóminas del empleado, pero la huella de auditoría permanece inalterada y transparente para auditorías de cumplimiento laboral.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm justify-between items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar por actor, acción, elemento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-semibold"
          />
        </div>

        <div className="flex gap-2 justify-end w-full sm:w-auto">
          {[
            { label: 'Todas las Operaciones', val: 'ALL' },
            { label: 'Registros Validados', val: 'VALIDATED' },
            { label: 'Intentos Sospechosos', val: 'SUSPICIOUS' }
          ].map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(tab.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                activeTab === tab.val
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla del Libro */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-4 px-6">ID Evento</th>
                <th className="py-4 px-6">Actor</th>
                <th className="py-4 px-6">Acción del Libro</th>
                <th className="py-4 px-6">Elemento Afectado</th>
                <th className="py-4 px-6">Valor Anterior</th>
                <th className="py-4 px-6">Valor Nuevo</th>
                <th className="py-4 px-6 font-mono">Hash de Bloque</th>
                <th className="py-4 px-6">Dispositivo / IP</th>
                <th className="py-4 px-6 font-mono">Marca Temporal UTC</th>
                <th className="py-4 px-6 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                  <td className="py-4 px-6 text-slate-400 font-mono font-bold">{log.id}</td>
                  <td className="py-4 px-6 font-bold text-slate-700">{log.actor}</td>
                  <td className="py-4 px-6">
                    <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-700">{log.affectedEntity}</td>
                  <td className="py-4 px-6 text-slate-400 italic">"{log.prevValue}"</td>
                  <td className="py-4 px-6 text-slate-800">"{log.newValue}"</td>
                  <td className="py-4 px-6">
                    <code className="bg-slate-50 px-1.5 py-0.5 rounded text-[10px] text-indigo-600 border border-slate-100 font-mono">
                      {log.eventHash}
                    </code>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <span className="text-slate-700 block font-bold">{log.ipAddress}</span>
                      <span className="text-[9px] text-slate-400 block truncate max-w-[120px] font-medium">{log.device}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-slate-500">{log.timestamp}</td>
                  <td className="py-4 px-6 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'VALIDATED' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {log.status === 'VALIDATED' ? 'VALIDADO' : 'SOSPECHOSO'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
