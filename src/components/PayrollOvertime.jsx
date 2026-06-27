import React, { useState } from 'react';
import { 
  DollarSign, Calculator, Settings, ToggleLeft, ToggleRight, CheckCircle2, 
  HelpCircle, RefreshCw, Layers, Edit, Code
} from 'lucide-react';

export default function PayrollOvertime({ payrollState, onAddAuditLog }) {
  const [payrollData, setPayrollData] = useState(payrollState);
  const [baseRate, setBaseRate] = useState(25.00); 
  const [dayOtMultiplier, setDayOtMultiplier] = useState(1.35);
  const [nightOtMultiplier, setNightOtMultiplier] = useState(1.75);
  
  const [autoOtEnabled, setAutoOtEnabled] = useState(true);

  const calculateSalary = (emp, autoOt) => {
    const regPay = emp.regularHours * baseRate;
    
    let currentStatus = emp.status;
    let otHours = emp.overtimeHours;
    
    if (autoOt && emp.department === 'Operaciones' && otHours <= 0.75) {
      currentStatus = 'AUTO_APROBADO';
    } else if (!autoOt && emp.status === 'AUTO_APROBADO' && emp.department === 'Operaciones' && otHours <= 0.75) {
      currentStatus = 'PENDIENTE';
    }

    const otPay = otHours * baseRate * dayOtMultiplier;
    const nightPay = emp.nightHours * baseRate * nightOtMultiplier;
    
    const total = regPay + otPay + nightPay;
    
    return {
      ...emp,
      calculatedAmount: parseFloat(total.toFixed(2)),
      status: currentStatus
    };
  };

  const calculatedDataset = payrollData.map(emp => calculateSalary(emp, autoOtEnabled));
  
  // Resúmenes
  const totalPayrollAmount = calculatedDataset.reduce((sum, item) => sum + item.calculatedAmount, 0);
  const totalRegularHours = calculatedDataset.reduce((sum, item) => sum + item.regularHours, 0);
  const totalOtHours = calculatedDataset.reduce((sum, item) => sum + item.overtimeHours, 0);
  const autoApprovedCount = calculatedDataset.filter(item => item.status === 'AUTO_APROBADO' || item.status === 'APPROVED').length;

  const handleToggleAutoOt = () => {
    const nextState = !autoOtEnabled;
    setAutoOtEnabled(nextState);
    onAddAuditLog(
      'Admin de RRHH', 
      'TOGGLE_AUTO_OT', 
      'REGLAS_NÓMINA', 
      autoOtEnabled ? 'REGLA_ACTIVA' : 'REGLA_INACTIVA', 
      nextState ? 'REGLA_ACTIVA' : 'REGLA_INACTIVA', 
      `Regla de aprobación automática de horas extras (Auto-OT) cambiada a ${nextState ? 'ACTIVA' : 'INACTIVA'}`
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Nómina e Imputación de Horas Extras</h1>
        <p className="text-slate-500 mt-1">Valore las horas trabajadas, configure fórmulas de salario en DSL y defina márgenes de aprobación automática para horas extras.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Totales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans">Nómina Total Proyectada</span>
              <div className="text-3xl font-bold text-slate-800 tracking-tight mt-1">
                ${totalPayrollAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <DollarSign size={20} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs font-semibold text-slate-500">
            <div>
              <span className="text-slate-400 block text-[10px] mb-0.5 font-bold">HORAS ORDINARIAS</span>
              <span className="text-slate-700 font-mono text-sm">{totalRegularHours}h</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] mb-0.5 font-bold">HORAS EXTRAS</span>
              <span className="text-slate-700 font-mono text-sm">{totalOtHours}h</span>
            </div>
          </div>
        </div>

        {/* Krono DSL Formula */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Code size={16} className="text-indigo-500" />
              Fórmula de Cálculo de Salarios (Krono DSL)
            </h3>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded uppercase">
              Motor V4 Activo
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* DSL Box */}
            <div className="bg-slate-900 text-indigo-300 p-4 rounded-xl font-mono text-xs space-y-1.5 shadow-inner border">
              <div>
                <span className="text-amber-400 font-semibold">Salario_Neto</span> = 
              </div>
              <div className="pl-4">
                (Horas_Ordinarias * <span className="text-emerald-400">${baseRate}</span>)
              </div>
              <div className="pl-4">
                + SUM(H_Extras_Diurnas * <span className="text-emerald-400">{dayOtMultiplier}x</span>)
              </div>
              <div className="pl-4">
                + SUM(H_Extras_Nocturnas * <span className="text-emerald-400">{nightOtMultiplier}x</span>)
              </div>
              <div className="pl-4">
                + Prima_Feriados
              </div>
            </div>

            {/* Deslizadores */}
            <div className="space-y-3.5 text-xs font-semibold text-slate-500">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Tarifa Base Ordinaria ($/h)</span>
                  <span className="font-bold text-slate-800 font-mono">${baseRate}</span>
                </div>
                <input 
                  type="range" min="15" max="60" step="0.5" value={baseRate}
                  onChange={(e) => setBaseRate(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Multiplicador Extra Diurna</span>
                  <span className="font-bold text-slate-800 font-mono">{dayOtMultiplier}x</span>
                </div>
                <input 
                  type="range" min="1.0" max="2.0" step="0.05" value={dayOtMultiplier}
                  onChange={(e) => setDayOtMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Multiplicador Extra Nocturna</span>
                  <span className="font-bold text-slate-800 font-mono">{nightOtMultiplier}x</span>
                </div>
                <input 
                  type="range" min="1.25" max="2.5" step="0.05" value={nightOtMultiplier}
                  onChange={(e) => setNightOtMultiplier(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reglas de Aprobación Automática (Auto-OT) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Settings size={16} className="text-amber-500" />
              Motor de Reglas Auto-OT
            </h3>
            <button 
              onClick={handleToggleAutoOt}
              className="focus:outline-none cursor-pointer"
            >
              {autoOtEnabled ? (
                <ToggleRight size={38} className="text-indigo-600 fill-indigo-600" />
              ) : (
                <ToggleLeft size={38} className="text-slate-300 fill-slate-300" />
              )}
            </button>
          </div>

          <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl space-y-3">
            <div className="text-xs font-mono text-amber-900 leading-relaxed font-semibold">
              <div><span className="text-amber-700 font-bold">IF</span> H_Extras &le; <span className="underline">45 minutos</span></div>
              <div className="mt-1"><span className="text-amber-700 font-bold">AND</span> Departamento == <span className="underline">Operaciones</span></div>
              <div className="mt-1"><span className="text-amber-700 font-bold">THEN</span> Declarar estado como <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">APROBADO_AUTO</span></div>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border leading-relaxed font-semibold">
            Las aprobaciones Auto-OT previenen que los supervisores firmen manualmente desvíos menores por salidas rezagadas, automatizando el cierre contable de la jornada.
          </div>
        </div>

        {/* Listado de Imputación */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Layers size={16} className="text-emerald-500" />
              Consolidación de Planilla de Jornadas
            </h3>
            <span className="text-xs font-bold text-slate-500">
              Aprobaciones Automáticas: <span className="font-bold text-slate-700">{autoApprovedCount} empleados</span>
            </span>
          </div>

          <div className="overflow-hidden border border-slate-100 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Empleado</th>
                  <th className="py-3 px-4">Horas Ord.</th>
                  <th className="py-3 px-4">Horas Noct.</th>
                  <th className="py-3 px-4">Horas Extra</th>
                  <th className="py-3 px-4">Multiplicador</th>
                  <th className="py-3 px-4">Proyecto Salario</th>
                  <th className="py-3 px-4 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600 font-semibold">
                {calculatedDataset.map((emp, index) => (
                  <tr key={index} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-bold text-slate-800 block">{emp.name}</span>
                        <span className="text-[9px] text-slate-400 block font-medium">{emp.department}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">{emp.regularHours}h</td>
                    <td className="py-3 px-4 font-mono">{emp.nightHours}h</td>
                    <td className="py-3 px-4 font-mono">{emp.overtimeHours}h</td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                        {emp.overtimeHours > 0 ? `${dayOtMultiplier}x` : '1.00x'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 font-mono">
                      ${emp.calculatedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        emp.status === 'AUTO_APROBADO'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : emp.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {emp.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
