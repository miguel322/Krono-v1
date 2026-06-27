import React, { useState, useEffect } from 'react';
import { 
  QrCode, Clock, Wifi, ShieldAlert, CheckCircle, RefreshCw, Smartphone, 
  MapPin, ShieldCheck, Play, HelpCircle
} from 'lucide-react';

export default function DigitalClockIn({ onAddAuditLog, onClockInStaff }) {
  // Estados de TOTP QR Code
  const [seconds, setSeconds] = useState(15);
  const [qrToken, setQrToken] = useState('0xbf829a28cd9f3b92ec84013ba8123ef');
  const [scanHistory, setScanHistory] = useState([
    { id: "SCN-309", time: "10:14:48 AM", user: "Sofía Rodríguez", device: "iPhone 13", tenant: "TNT-8942-X90", result: "VÁLIDO", skew: "+1.2s" },
    { id: "SCN-308", time: "10:11:02 AM", user: "Juan Pérez", device: "iPhone 14", tenant: "TNT-8942-X90", result: "VÁLIDO", skew: "-0.4s" },
    { id: "SCN-307", time: "09:58:15 AM", user: "Roberto Méndez", device: "PC Consola Admin", tenant: "TNT-8942-X90", result: "REPLAY_RECHAZADO", skew: "+18.2s" }
  ]);

  // Estados de Zero-Touch
  const [zeroTouchProgress, setZeroTouchProgress] = useState('IDLE'); // IDLE, DETECTING, WI_FI_OK, GPS_OK, BIOMETRIC_PROMPT, SUCCESS
  const [detectedBSSID, setDetectedBSSID] = useState('Desconocido');
  const [detectedGPS, setDetectedGPS] = useState('--');
  const [detectedDistance, setDetectedDistance] = useState('--');

  // Constantes de Reglas
  const allowedBSSID = '00:1A:2B:3C:4D:5E';
  const maxGpsAccuracy = 15; // metros
  const allowedRadius = 40; // metros

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev === 1) {
          const newHash = '0x' + Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
          setQrToken(newHash);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSimulateQrScan = () => {
    const names = ["Camila Silva", "Carlos Díaz", "Lucía Fernández", "Alejandro Ruiz"];
    const devices = ["iPhone 15 Pro", "OnePlus 11", "Xiaomi 13", "Samsung S23"];
    const randomIdx = Math.floor(Math.random() * names.length);
    
    const timeStr = new Date().toLocaleTimeString();
    const newScan = {
      id: `SCN-${Math.floor(400 + Math.random() * 600)}`,
      time: timeStr,
      user: names[randomIdx],
      device: devices[randomIdx],
      tenant: "TNT-8942-X90",
      result: "VÁLIDO",
      skew: `${(Math.random() * 2 - 1).toFixed(1)}s`
    };

    setScanHistory([newScan, ...scanHistory]);
    onClockInStaff(names[randomIdx], "TOTP-QR (Escaneo Móvil)");
    onAddAuditLog(
      names[randomIdx], 
      'REGISTRO_ENTRADA', 
      'TOTP_GATEWAY', 
      'AUSENTE', 
      'PRESENTE', 
      `Entrada registrada con éxito vía TOTP-QR dinámico. Hash de validación: ${qrToken.substring(0, 8)}...`
    );
  };

  const runZeroTouchSimulation = () => {
    setZeroTouchProgress('DETECTING');
    setDetectedBSSID('Desconocido');
    setDetectedGPS('--');
    setDetectedDistance('--');

    setTimeout(() => {
      setDetectedBSSID(allowedBSSID);
      setZeroTouchProgress('WI_FI_OK');
      
      setTimeout(() => {
        setDetectedGPS('8.4m');
        setDetectedDistance('12.3m');
        setZeroTouchProgress('GPS_OK');
        
        setTimeout(() => {
          setZeroTouchProgress('BIOMETRIC_PROMPT');
          
          setTimeout(() => {
            setZeroTouchProgress('SUCCESS');
            const targetName = "María Gómez";
            onClockInStaff(targetName, "Presencia Zero-Touch");
            onAddAuditLog(
              targetName, 
              'REGISTRO_ENTRADA', 
              'ZERO_TOUCH_GATEWAY', 
              'AUSENTE', 
              'PRESENTE', 
              'Presencia ambiental Zero-Touch verificada. Firma FaceID local validada en Enclave Seguro.'
            );
          }, 2000);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vectores de Marcaje Digital</h1>
        <p className="text-slate-500 mt-1">Simulación y auditoría de puertas de entrada criptográficas sin necesidad de terminales físicas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* VECTOR A: TOTP-QR */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold uppercase">
              Vector Alfa
            </span>
            <h3 className="text-lg font-bold text-slate-800">Marcaje por TOTP-QR Dinámico</h3>
            <p className="text-xs text-slate-400">Código QR rotativo HMAC-SHA256 proyectado en accesos de oficinas o en tabletas de control local.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4 bg-slate-50/50 rounded-xl border border-slate-100 p-4">
            {/* QR */}
            <div className="relative p-4 bg-white rounded-xl border shadow-sm flex flex-col items-center gap-3 shrink-0">
              <div className="w-40 h-40 bg-slate-50 border-2 border-slate-900 p-2 rounded-lg flex flex-wrap justify-between items-center relative overflow-hidden group select-none">
                <div className="absolute inset-0 bg-white grid grid-cols-10 gap-0 p-3 opacity-90">
                  {Array.from({ length: 100 }).map((_, i) => {
                    const isDark = (i * qrToken.charCodeAt(i % qrToken.length)) % 3 === 0 || i < 15 || i > 85;
                    return (
                      <div 
                        key={i} 
                        className={`w-full h-full transition-colors duration-200 ${
                          isDark ? 'bg-slate-900' : 'bg-white'
                        }`} 
                      />
                    );
                  })}
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors">
                  <div className="w-10 h-10 border-2 border-indigo-600 bg-white rounded-lg flex items-center justify-center font-bold text-slate-800 text-xs font-mono">
                    QR
                  </div>
                </div>
              </div>
              
              {/* Barra del temporizador */}
              <div className="w-full space-y-1">
                <div className="flex justify-between text-[10px] font-bold text-slate-500">
                  <span>EL TOKEN ROTARÁ EN</span>
                  <span className="font-mono text-indigo-600">{seconds}s</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(seconds / 15) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Metadatos */}
            <div className="space-y-4 text-xs font-semibold text-slate-600 w-full">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block text-[10px] mb-0.5">ESTADO PUERTA</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> EN LÍNEA
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] mb-0.5">TOLERANCIA SKEW</span>
                  <span className="text-slate-800 font-mono">±3.0 segundos</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[10px] mb-0.5">SEMILLA HMAC ACTUAL</span>
                  <code className="bg-white border px-2 py-1 rounded block text-[10px] font-mono text-slate-500 truncate" title={qrToken}>
                    {qrToken}
                  </code>
                </div>
              </div>

              <button
                onClick={handleSimulateQrScan}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Smartphone size={14} /> Simular Escaneo Móvil
              </button>
            </div>
          </div>

          {/* Historial de marcajes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Reconciliación de Intentos</h4>
            <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
              {scanHistory.map((scan) => (
                <div key={scan.id} className="p-3 flex justify-between items-center hover:bg-slate-50/50">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">{scan.user}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({scan.device})</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Tenant ID: <code className="bg-slate-100 px-1 rounded">{scan.tenant}</code> &bull; Skew: {scan.skew}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      scan.result === 'VÁLIDO' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-rose-50 text-rose-700 border border-rose-100'
                    }`}>
                      {scan.result}
                    </span>
                    <span className="block text-[10px] text-slate-400 mt-1 font-mono">{scan.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* VECTOR B: ZERO-TOUCH */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold uppercase">
              Vector Beta
            </span>
            <h3 className="text-lg font-bold text-slate-800">Presencia Ambiental Zero-Touch</h3>
            <p className="text-xs text-slate-400">Marcaje automatizado mediante balizas Wi-Fi de oficina y precisión de perímetro por geocerca móvil.</p>
          </div>

          {/* Fórmula */}
          <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs space-y-2 border shadow-inner">
            <div className="text-indigo-400 font-bold uppercase tracking-wider text-[9px] mb-1">Regla Lógica de Presencia</div>
            <div>
              <span className="text-amber-400">IF</span> App.CurrentBSSID == Tenant.AllowedBSSID
            </div>
            <div>
              <span className="text-amber-400">AND</span> GPS.Accuracy &lt; <span className="text-violet-400">{maxGpsAccuracy}m</span>
            </div>
            <div>
              <span className="text-amber-400">AND</span> GPS.DistanceToCenter &lt; <span className="text-violet-400">{allowedRadius}m</span>
            </div>
            <div>
              <span className="text-amber-400">THEN</span> Trigger local BiometricPrompt verification
            </div>
          </div>

          {/* Simulador */}
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">PRUEBA DE BALIZAS Y GEOLOCALIZACIÓN</span>
              <button
                onClick={runZeroTouchSimulation}
                disabled={zeroTouchProgress === 'DETECTING' || zeroTouchProgress === 'WI_FI_OK' || zeroTouchProgress === 'GPS_OK' || zeroTouchProgress === 'BIOMETRIC_PROMPT'}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <Play size={12} /> {zeroTouchProgress === 'IDLE' ? 'Iniciar Comprobación' : zeroTouchProgress === 'SUCCESS' ? 'Volver a Evaluar' : 'Ejecutando...'}
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-semibold">
              {/* Check 1 */}
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-2">
                  <Wifi size={14} className={zeroTouchProgress !== 'IDLE' && zeroTouchProgress !== 'DETECTING' ? "text-indigo-600" : "text-slate-400"} />
                  <span className="text-slate-600">Escaneo y Coincidencia de Red BSSID</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500">BSSID: {detectedBSSID}</span>
                  {zeroTouchProgress === 'DETECTING' && <RefreshCw size={12} className="animate-spin text-slate-400" />}
                  {(zeroTouchProgress === 'WI_FI_OK' || zeroTouchProgress === 'GPS_OK' || zeroTouchProgress === 'BIOMETRIC_PROMPT' || zeroTouchProgress === 'SUCCESS') && <CheckCircle size={14} className="text-emerald-500" />}
                </div>
              </div>

              {/* Check 2 */}
              <div className="flex items-center justify-between p-2 bg-white rounded border">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className={zeroTouchProgress === 'GPS_OK' || zeroTouchProgress === 'BIOMETRIC_PROMPT' || zeroTouchProgress === 'SUCCESS' ? "text-indigo-600" : "text-slate-400"} />
                  <span className="text-slate-600">Precisión GPS y Distancia Geocerca</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500">Prec: {detectedGPS} | Dist: {detectedDistance}</span>
                  {(zeroTouchProgress === 'DETECTING' || zeroTouchProgress === 'WI_FI_OK') && zeroTouchProgress !== 'IDLE' && <RefreshCw size={12} className="animate-spin text-slate-400" />}
                  {(zeroTouchProgress === 'GPS_OK' || zeroTouchProgress === 'BIOMETRIC_PROMPT' || zeroTouchProgress === 'SUCCESS') && <CheckCircle size={14} className="text-emerald-500" />}
                </div>
              </div>

              {/* Check 3 */}
              <div className="flex items-center justify-between p-2 bg-white rounded border relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className={zeroTouchProgress === 'BIOMETRIC_PROMPT' || zeroTouchProgress === 'SUCCESS' ? "text-indigo-600" : "text-slate-400"} />
                  <span className="text-slate-600">Autenticación Biométrica Local (FaceID)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">HUELLA ENCLAVE SEGURO</span>
                  {zeroTouchProgress === 'BIOMETRIC_PROMPT' && <RefreshCw size={12} className="animate-spin text-indigo-500" />}
                  {zeroTouchProgress === 'SUCCESS' && <CheckCircle size={14} className="text-emerald-500" />}
                </div>

                {zeroTouchProgress === 'BIOMETRIC_PROMPT' && (
                  <div className="absolute inset-0 bg-indigo-600/90 backdrop-blur-xs flex items-center justify-center text-white gap-2 font-bold animate-in fade-in duration-200">
                    <Smartphone size={16} className="animate-bounce" />
                    <span>Lanzando FaceID local en dispositivo...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="min-h-[48px] border-2 border-dashed rounded-lg flex items-center justify-center text-center p-3 text-xs bg-white text-slate-400 font-bold uppercase tracking-wider">
              {zeroTouchProgress === 'IDLE' && 'Listo para activar evaluación'}
              {zeroTouchProgress === 'DETECTING' && 'Buscando señales BSSID corporativas...'}
              {zeroTouchProgress === 'WI_FI_OK' && 'Coincidencia de BSSID exitosa. Analizando precisión GPS...'}
              {zeroTouchProgress === 'GPS_OK' && 'Coordenadas GPS confirmadas en rango. Solicitando firma biométrica local...'}
              {zeroTouchProgress === 'BIOMETRIC_PROMPT' && 'Verificando rostro de empleado vía API local...'}
              {zeroTouchProgress === 'SUCCESS' && (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle size={16} /> Verificado: ¡María Gómez registró su asistencia correctamente!
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-[10px] text-slate-500 bg-slate-50 p-3 rounded-lg border font-semibold">
            <ShieldAlert size={16} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <span className="font-bold text-slate-700">Privacidad Asegurada:</span> KRONO interactúa directamente con Apple Secure Enclave y la API Android Keystore. El escaneo biométrico ocurre localmente en el móvil; los patrones físicos jamás se suben a la nube.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
