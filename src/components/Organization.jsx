import React, { useState } from 'react';
import { 
  Users, Building2, UserPlus, FolderPlus, Search, Briefcase, Mail, Shield, 
  MapPin, CheckCircle, AlertCircle, Trash2, ShieldAlert, Plus
} from 'lucide-react';

export default function Organization({ 
  employees, 
  departments, 
  onAddEmployee, 
  onAddDepartment,
  onAddAuditLog 
}) {
  const [activeTab, setActiveTab] = useState('EMPLOYEES'); // EMPLOYEES or DEPARTMENTS
  const [searchTerm, setSearchTerm] = useState('');

  // Formulario Empleado
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empDept, setEmpDept] = useState(departments[0] || 'Operaciones');
  const [empShift, setEmpShift] = useState('Turno Diurno (08:00 - 17:00)');
  const [empEmail, setEmpEmail] = useState('');
  const [empAvatar, setEmpAvatar] = useState('');

  // Formulario Departamento
  const [deptName, setDeptName] = useState('');
  const [deptSupervisor, setDeptSupervisor] = useState('');
  const [deptCostCenter, setDeptCostCenter] = useState('');

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleCreateEmployee = (e) => {
    e.preventDefault();
    if (!empName || !empRole) return;

    const newId = `EMP-${Math.floor(100 + Math.random() * 900)}`;
    const defaultAvatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
    ];
    const finalAvatar = empAvatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newEmp = {
      id: newId,
      name: empName,
      role: empRole,
      department: empDept,
      shift: empShift,
      checkIn: "--:--:--",
      checkOut: "--:--:--",
      method: "--",
      location: "--",
      accuracy: "--",
      status: "AUSENTE", // Inicia ausente hasta marcar
      gpsDistance: null,
      deviceFingerprint: "--",
      biometricVerified: false,
      avatar: finalAvatar,
      timeline: [
        { time: "09:00:00", event: "Colaborador registrado en el sistema", type: "system" }
      ],
      adjustments: []
    };

    onAddEmployee(newEmp);
    onAddAuditLog(
      'Admin de Organización', 
      'REGISTRAR_EMPLEADO', 
      newId, 
      'VACIO', 
      empName, 
      `Registrado nuevo colaborador: ${empName} (${empRole}) asignado a ${empDept}.`
    );

    triggerToast(`¡Colaborador ${empName} creado con éxito!`);
    setEmpName('');
    setEmpRole('');
    setEmpEmail('');
    setEmpAvatar('');
  };

  const handleCreateDepartment = (e) => {
    e.preventDefault();
    if (!deptName) return;

    onAddDepartment(deptName);
    onAddAuditLog(
      'Admin de Organización', 
      'CREAR_DEPARTAMENTO', 
      deptName.toUpperCase().replace(' ', '_'), 
      'VACIO', 
      deptName, 
      `Creado nuevo departamento organizacional: ${deptName} bajo supervisor ${deptSupervisor || 'No asignado'}.`
    );

    triggerToast(`¡Departamento de ${deptName} registrado!`);
    
    // Auto-seleccionar el departamento recién creado en el formulario de empleados
    setEmpDept(deptName);
    setDeptName('');
    setDeptSupervisor('');
    setDeptCostCenter('');
  };

  // Filtrado de empleados en el directorio
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Conteo de miembros por departamento
  const getDeptCount = (deptName) => {
    return employees.filter(e => e.department === deptName).length;
  };

  return (
    <div className="space-y-6 relative animate-in fade-in duration-300">
      
      {/* Toast de Guardado */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold border border-slate-800 animate-bounce">
          <CheckCircle size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Estructura Organizacional</h1>
          <p className="text-slate-500 mt-1">Gestione el directorio de colaboradores, cree nuevos perfiles y defina las áreas o departamentos de su empresa.</p>
        </div>

        {/* Sub Navegación */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 shadow-inner">
          <button
            onClick={() => setActiveTab('EMPLOYEES')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'EMPLOYEES'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                : 'hover:text-slate-900'
            }`}
          >
            <Users size={13} />
            Directorio Personal ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('DEPARTMENTS')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'DEPARTMENTS'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                : 'hover:text-slate-900'
            }`}
          >
            <Building2 size={13} />
            Departamentos ({departments.length})
          </button>
        </div>
      </div>

      {/* TABA: COLABORADORES */}
      {activeTab === 'EMPLOYEES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Listado / Directorio */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm items-center justify-between">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Buscar por nombre, rol o área..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-semibold"
                />
              </div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Mostrando {filteredEmployees.length} registros
              </span>
            </div>

            {/* Rejilla de Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredEmployees.map((emp) => (
                <div key={emp.id} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex gap-4 hover:border-slate-300 transition-all">
                  <img
                    src={emp.avatar}
                    alt={emp.name}
                    className="w-14 h-14 rounded-full object-cover border shadow-xs"
                  />
                  <div className="flex-1 space-y-1 text-xs font-semibold">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-800 text-sm">{emp.name}</h4>
                      <span className="text-[9px] font-mono text-slate-400">ID: {emp.id}</span>
                    </div>
                    <span className="text-indigo-600 font-medium block">{emp.role}</span>
                    
                    <div className="flex flex-wrap gap-1.5 pt-1.5">
                      <span className="bg-slate-100 border text-slate-600 px-2 py-0.5 rounded text-[10px]">
                        {emp.department}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        emp.status === 'PRESENTE' || emp.status === 'TARDE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {emp.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Formulario de Alta Empleado */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <UserPlus className="text-indigo-500" size={18} />
              <h3 className="font-bold text-slate-800 text-sm">Registrar Nuevo Colaborador</h3>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1">
                <label className="block text-slate-500">Nombre Completo</label>
                <input
                  type="text" required placeholder="Ej. Juan Miller" value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500">Cargo / Rol</label>
                <input
                  type="text" required placeholder="Ej. Analista Senior Contabilidad" value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-slate-500">Departamento / Área</label>
                  <select
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 w-full"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="block text-slate-500">Turno de Entrada</label>
                  <select
                    value={empShift}
                    onChange={(e) => setEmpShift(e.target.value)}
                    className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 w-full"
                  >
                    <option value="Turno Diurno (08:00 - 17:00)">Diurno (08:00 - 17:00)</option>
                    <option value="Turno Estándar (09:00 - 18:00)">Estándar (09:00 - 18:00)</option>
                    <option value="Turno Nocturno (22:00 - 06:00)">Nocturno (22:00 - 06:00)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500">Correo Electrónico Corporativo</label>
                <input
                  type="email" placeholder="correo@empresa.com" value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500">URL Foto de Perfil (Opcional)</label>
                <input
                  type="text" placeholder="https://images.unsplash.com/..." value={empAvatar}
                  onChange={(e) => setEmpAvatar(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Registrar en el Sistema
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TABA: DEPARTAMENTOS */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Listado de Departamentos */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1">
            {departments.map((dept) => (
              <div key={dept} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                      <Building2 size={16} className="text-indigo-500" />
                      {dept}
                    </h3>
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                      CC-89{dept.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Centro de costo y planeación cuadrante vinculado a las nóminas del sector.
                  </p>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 block text-[9px] mb-0.5 font-bold uppercase">Personal Activo</span>
                    <span className="text-slate-800 font-bold text-sm font-mono">{getDeptCount(dept)} personas</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] mb-0.5 font-bold uppercase">Supervisor Asignado</span>
                    <span className="text-slate-700 font-bold">Líder {dept.split(' ')[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Formulario de Alta Departamento */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <FolderPlus className="text-indigo-500" size={18} />
              <h3 className="font-bold text-slate-800 text-sm">Registrar Nuevo Departamento</h3>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs font-semibold text-slate-600">
              <div className="space-y-1">
                <label className="block text-slate-500">Nombre del Departamento</label>
                <input
                  type="text" required placeholder="Ej. Ventas Enterprise" value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500">Supervisor / Responsable de Turno</label>
                <input
                  type="text" required placeholder="Ej. Laura González" value={deptSupervisor}
                  onChange={(e) => setDeptSupervisor(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-slate-500">Código de Centro de Costos</label>
                <input
                  type="text" placeholder="Ej. CC-8902-MK" value={deptCostCenter}
                  onChange={(e) => setDeptCostCenter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Registrar Departamento
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
