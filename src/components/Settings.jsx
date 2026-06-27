import React, { useState } from 'react';
import { 
  Building2, ShieldCheck, Key, Wifi, MapPin, Clock, DollarSign, 
  HelpCircle, CheckCircle, Save, Bell, RefreshCw, EyeOff
} from 'lucide-react';

export default function Settings({ settingsState, onUpdateSettings, onAddAuditLog }) {
  const [activeTab, setActiveTab] = useState('TENANT');
  const [settings, setSettings] = useState(settingsState);

  const [showToast, setShowToast] = useState(false);

  const handleToggle = (category, key) => {
    const updated = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: !settings[category][key]
      }
    };
    setSettings(updated);
    onUpdateSettings(updated);
    onAddAuditLog('Admin de RRHH', 'CAMBIAR_AJUSTE', `${category.toUpperCase()}_${key.toUpperCase()}`, 'TOGGLE', updated[category][key] ? 'TRUE' : 'FALSE', `Cambiado parámetro: ${category}.${key}`);
    triggerToast();
  };

  const handleChange = (category, key, value) => {
    const updated = {
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    };
    setSettings(updated);
    onUpdateSettings(updated);
    triggerToast();
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    onAddAuditLog('Admin de RRHH', 'GUARDAR_CONFIGURACION_GLOBAL', 'TENANT_RULES', 'MUTADO', 'SUCCESS', `Confirmada configuración global del tenant en el libro`);
    triggerToast();
  };

  const getTabStyle = (tab) => {
    return activeTab === tab
      ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50'
      : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50';
  };

  return (
    <div className="space-y-6 relative animate-in fade-in duration-300">
      {/* Mensaje flotante de guardado */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold border border-slate-800 animate-bounce">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>Configuración del Tenant Guardada Correctamente</span>
        </div>
      )}

      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configuración del Sistema</h1>
          <p className="text-slate-500 mt-1">Configure geocercas, enlaces de biometría asimétrica local, márgenes de tolerancia y sincronizaciones HRIS.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Selector de pestañas */}
        <div className="w-full md:w-60 border-r border-slate-100 bg-slate-50/50 p-4 space-y-1">
          {[
            { label: 'Datos del Tenant', val: 'TENANT', icon: Building2 },
            { label: 'Seguridad y Enclave', val: 'SECURITY', icon: ShieldCheck },
            { label: 'Vectores de Marcaje', val: 'VECTORS', icon: Key },
            { label: 'BSSIDs Autorizados', val: 'BSSID', icon: Wifi },
            { label: 'Geocercas de Oficina', val: 'GEOFENCE', icon: MapPin },
            { label: 'Políticas de Tolerancia', val: 'TOLERANCES', icon: Clock },
            { label: 'Fórmulas de Salarios', val: 'SALARY', icon: DollarSign },
            { label: 'Tolerancia de Plazos (SLA)', val: 'SLA', icon: Bell },
            { label: 'Integraciones HRIS', val: 'INTEGRATIONS', icon: RefreshCw }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.val}
                onClick={() => setActiveTab(tab.val)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-bold text-left border flex items-center gap-2 transition-all cursor-pointer ${getTabStyle(tab.val)}`}
              >
                <Icon size={14} className="shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Panel de inputs */}
        <div className="flex-1 p-6">
          <form onSubmit={handleSave} className="space-y-6 max-w-xl text-xs font-semibold text-slate-600">
            
            {/* TENANT */}
            {activeTab === 'TENANT' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Datos del Tenant</h3>
                <div className="space-y-1">
                  <label className="block text-slate-500">Nombre de la Razón Social</label>
                  <input
                    type="text"
                    value={settings.tenant.name}
                    onChange={(e) => handleChange('tenant', 'name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-500">Sector Industrial / Giro</label>
                    <input
                      type="text"
                      value={settings.tenant.industry}
                      onChange={(e) => handleChange('tenant', 'industry', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500">Huso Horario Corporativo</label>
                    <select
                      value={settings.tenant.timezone}
                      onChange={(e) => handleChange('tenant', 'timezone', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="America/Chicago">America/Chicago (CST)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-slate-500">Identificador Multi-Tenant (Inmutable)</label>
                  <input
                    type="text"
                    readOnly
                    value={settings.tenant.multiTenantId}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50 text-slate-400 font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {/* SECURITY */}
            {activeTab === 'SECURITY' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Seguridad y Firma</h3>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                  <div className="space-y-0.5">
                    <span className="text-slate-800 font-bold block">Encriptación Criptográfica Doble</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">Cifrar marcas temporales con llaves asimétricas antes de almacenar</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.doubleEncryption}
                    onChange={() => handleToggle('security', 'doubleEncryption')}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                  <div className="space-y-0.5">
                    <span className="text-slate-800 font-bold block">Exclusividad de Biometría Local</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">Validación forzada en el hardware Enclave Seguro del dispositivo del usuario</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.localBiometricOnly}
                    onChange={() => handleToggle('security', 'localBiometricOnly')}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-500">Tolerancia de Retraso de TOTP (s)</label>
                    <input
                      type="number"
                      value={settings.security.antiReplaySkew}
                      onChange={(e) => handleChange('security', 'antiReplaySkew', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500">Límite de Intentos de Lectura Fallidos</label>
                    <input
                      type="number"
                      value={settings.security.allowedFailedScans}
                      onChange={(e) => handleChange('security', 'allowedFailedScans', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* VECTORS */}
            {activeTab === 'VECTORS' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Vectores de Marcaje</h3>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                  <div className="space-y-0.5">
                    <span className="text-slate-800 font-bold block">Marcajes por TOTP-QR Dinámico</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">Habilitar entradas por escaneo de QR dinámico rotativo</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.clockInMethods.totpQr}
                    onChange={() => handleToggle('clockInMethods', 'totpQr')}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                  <div className="space-y-0.5">
                    <span className="text-slate-800 font-bold block">Presencia Ambiental Zero-Touch</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">Detectar al personal mediante balizas de red Wi-Fi y GPS corporativos</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.clockInMethods.zeroTouch}
                    onChange={() => handleToggle('clockInMethods', 'zeroTouch')}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 border rounded-lg">
                  <div className="space-y-0.5">
                    <span className="text-slate-800 font-bold block">Modo Quiosco en Accesos</span>
                    <span className="text-[10px] text-slate-400 font-semibold block">Permitir marcación en terminales comunes o tablets fijas</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.clockInMethods.kioskMode}
                    onChange={() => handleToggle('clockInMethods', 'kioskMode')}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </div>
              </div>
            )}

            {/* BSSID */}
            {activeTab === 'BSSID' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Direcciones BSSID Wi-Fi Autorizadas</h3>
                <p className="text-slate-500 leading-relaxed font-semibold">
                  Los escaneos Zero-Touch comparan los BSSID físicos del router para mitigar suplantaciones de ubicación.
                </p>

                <div className="space-y-3">
                  {settings.bssids.map((wifi, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border rounded-lg text-xs font-semibold">
                      <div>
                        <span className="text-slate-800 font-bold block">{wifi.name}</span>
                        <code className="text-[10px] text-slate-400 font-mono block mt-0.5">{wifi.bssid}</code>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        wifi.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {wifi.status === 'Active' ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GEOFENCE */}
            {activeTab === 'GEOFENCE' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Geocercas de Oficina</h3>
                <p className="text-slate-500 leading-relaxed font-semibold">
                  Defina los radios de tolerancia en metros dentro de los cuales se permite el marcaje web.
                </p>

                <div className="space-y-4">
                  {settings.geofences.map((geo, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border rounded-lg space-y-3">
                      <div className="flex justify-between items-center font-bold text-slate-800">
                        <span>{geo.name}</span>
                        <span className="text-indigo-600 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded text-[10px]">
                          {geo.status === 'Active' ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-slate-400 block text-[9px] mb-0.5 font-bold">LATITUD, LONGITUD</span>
                          <span className="font-mono text-slate-600">{geo.latitude}, {geo.longitude}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[9px] mb-0.5 font-bold">RADIO GEOFENCE</span>
                          <span className="text-slate-600">{geo.radius} metros</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TOLERANCES */}
            {activeTab === 'TOLERANCES' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Políticas de Tolerancia y Asistencia</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-500">Período de Gracia de Entrada (minutos)</label>
                    <input
                      type="number"
                      value={settings.tolerances.entryTolerance}
                      onChange={(e) => handleChange('tolerances', 'entryTolerance', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500">Umbral de Entrada Tardía (minutos)</label>
                    <input
                      type="number"
                      value={settings.tolerances.lateThreshold}
                      onChange={(e) => handleChange('tolerances', 'lateThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500">Ausencia Parcial (excede m)</label>
                    <input
                      type="number"
                      value={settings.tolerances.partialAbsence}
                      onChange={(e) => handleChange('tolerances', 'partialAbsence', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500">Falta de Salida (turno + horas)</label>
                    <input
                      type="number"
                      value={settings.tolerances.missingCheckoutTrigger}
                      onChange={(e) => handleChange('tolerances', 'missingCheckoutTrigger', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SALARY */}
            {activeTab === 'SALARY' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Fórmulas de Salarios</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-slate-500">Tarifa Base Ordinaria ($/h)</label>
                    <input
                      type="number"
                      value={settings.salaryRules.baseRate}
                      onChange={(e) => handleChange('salaryRules', 'baseRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500">Factor H. Extra Diurna</label>
                    <input
                      type="number"
                      step="0.05"
                      value={settings.salaryRules.daytimeOtFactor}
                      onChange={(e) => handleChange('salaryRules', 'daytimeOtFactor', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500">Factor H. Extra Nocturna</label>
                    <input
                      type="number"
                      step="0.05"
                      value={settings.salaryRules.nighttimeOtFactor}
                      onChange={(e) => handleChange('salaryRules', 'nighttimeOtFactor', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500">Aprobación Automática (Auto-OT en minutos)</label>
                    <input
                      type="number"
                      value={settings.salaryRules.autoOtLimitMinutes}
                      onChange={(e) => handleChange('salaryRules', 'autoOtLimitMinutes', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SLA */}
            {activeTab === 'SLA' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Tolerancia de Plazos (SLA)</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 col-span-2">
                    <label className="block text-slate-500">Plazo del Supervisor (horas antes de escalar a RRHH)</label>
                    <input
                      type="number"
                      value={settings.slas.supervisorResolution}
                      onChange={(e) => handleChange('slas', 'supervisorResolution', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500">Auto-Aprobación RRHH (horas)</label>
                    <input
                      type="number"
                      value={settings.slas.hrAutoApprove}
                      onChange={(e) => handleChange('slas', 'hrAutoApprove', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-slate-500">Tolerancia Anti-Ghosting Salas (minutos)</label>
                    <input
                      type="number"
                      value={settings.slas.roomAntiGhosting}
                      onChange={(e) => handleChange('slas', 'roomAntiGhosting', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-slate-700 font-semibold focus:ring-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* INTEGRATIONS */}
            {activeTab === 'INTEGRATIONS' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-800 pb-2 border-b">Integraciones HRIS y Planilla</h3>
                
                <div className="space-y-3">
                  {settings.integrations.map((int, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border rounded-lg text-xs font-semibold">
                      <div>
                        <span className="text-slate-800 font-bold block">{int.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{int.type}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        int.status === 'CONNECTED' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 font-bold' 
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                      }`}>
                        {int.status === 'CONNECTED' ? 'CONECTADO' : 'DESCONECTADO'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-1.5 cursor-pointer text-xs transition-all"
              >
                <Save size={14} /> Registrar Parámetros en Libro Inmutable
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
