import React, { useState } from 'react';
import { 
  Users, Building2, UserPlus, FolderPlus, Search, 
  MapPin, CheckCircle, Trash2, Plus,
  Wifi, Clock, Info, X, AlertTriangle
} from 'lucide-react';

export default function Organization({ 
  employees, 
  departments, 
  branches,
  onAddEmployee, 
  onAddDepartment,
  onAddBranch,
  onDeleteBranch,
  onAddAuditLog 
}) {
  const [activeTab, setActiveTab] = useState('EMPLOYEES'); // EMPLOYEES, DEPARTMENTS, BRANCHES
  const [searchTerm, setSearchTerm] = useState('');

  // Filtros combinados para el Directorio (Heurística 7: Eficiencia de Uso)
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [filterDept, setFilterDept] = useState('ALL');

  // Formulario Empleado
  const [empName, setEmpName] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [empDept, setEmpDept] = useState(departments[0] || 'Operaciones');
  const [empBranch, setEmpBranch] = useState(branches[0]?.name || 'Corporativo Central');
  const [empShift, setEmpShift] = useState('Turno Diurno (08:00 - 17:00)');
  const [empEmail, setEmpEmail] = useState('');
  const [empAvatar, setEmpAvatar] = useState('');

  // Formulario Departamento
  const [deptName, setDeptName] = useState('');
  const [deptSupervisor, setDeptSupervisor] = useState('');
  const [deptCostCenter, setDeptCostCenter] = useState('');

  // Formulario Sucursal (Multi-branch)
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchTimezone, setBranchTimezone] = useState('GMT-6 (CDMX)');
  const [branchIpRange, setBranchIpRange] = useState('');
  const [branchManager, setBranchManager] = useState('');
  const [branchError, setBranchError] = useState('');

  // Modales
  const [showCreateBranchModal, setShowCreateBranchModal] = useState(false);
  const [showDeleteBranchConfirm, setShowDeleteBranchConfirm] = useState(null);

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
      branch: empBranch,
      shift: empShift,
      checkIn: "--:--:--",
      checkOut: "--:--:--",
      method: "--",
      location: "--",
      accuracy: "--",
      status: "AUSENTE",
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
      `Registrado nuevo colaborador: ${empName} (${empRole}) asignado a sucursal ${empBranch} y área ${empDept}.`
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
    setEmpDept(deptName);
    setDeptName('');
    setDeptSupervisor('');
    setDeptCostCenter('');
  };

  // Creación de Sucursal con Presets de ZKTeco (Heurística 6)
  const applyBranchPreset = (type) => {
    switch (type) {
      case 'OFFICE':
        setBranchName('Corporativo Sur');
        setBranchAddress('Av. Insurgentes Sur 1400, CDMX');
        setBranchTimezone('GMT-6 (CDMX)');
        setBranchIpRange('192.168.10.1/24');
        setBranchManager('Laura González');
        setBranchError('');
        break;
      case 'FACTORY':
        setBranchName('Planta Industrial San Nicolás');
        setBranchAddress('Parque Industrial Kalos, Monterrey');
        setBranchTimezone('GMT-6 (CDMX)');
        setBranchIpRange('10.100.1.1/24');
        setBranchManager('Roberto Méndez');
        setBranchError('');
        break;
      case 'WAREHOUSE':
        setBranchName('CEDIS El Salto');
        setBranchAddress('Carretera a Chapala Km 18, Guadalajara');
        setBranchTimezone('GMT-6 (CDMX)');
        setBranchIpRange('172.20.10.1/24');
        setBranchManager('Alejandro Ruiz');
        setBranchError('');
        break;
      default:
        break;
    }
  };

  const handleCreateBranch = (e) => {
    e.preventDefault();
    if (!branchName.trim()) {
      setBranchError('El nombre de la sucursal es obligatorio.');
      return;
    }

    // Prevención de Errores (Heurística 5)
    const exists = branches.some(b => b.name.toLowerCase() === branchName.toLowerCase());
    if (exists) {
      setBranchError('Ya existe una sucursal con este nombre.');
      return;
    }

    const ip = branchIpRange.trim() || '192.168.1.1/24';
    const newBranch = {
      id: `SC-0${branches.length + 1}`,
      name: branchName,
      address: branchAddress || 'Dirección por definir',
      timezone: branchTimezone,
      ipRange: ip,
      manager: branchManager || 'Sin Asignar'
    };

    onAddBranch(newBranch);
    onAddAuditLog(
      'Admin de Organización', 
      'CREAR_SUCURSAL', 
      newBranch.id, 
      'VACIO', 
      newBranch.name, 
      `Creada nueva sucursal: ${newBranch.name} en zona ${newBranch.timezone} y red IP ${newBranch.ipRange}.`
    );

    triggerToast(`¡Sucursal ${branchName} creada con éxito!`);
    setBranchName('');
    setBranchAddress('');
    setBranchTimezone('GMT-6 (CDMX)');
    setBranchIpRange('');
    setBranchManager('');
    setBranchError('');
    setShowCreateBranchModal(false);
  };

  const handleConfirmDeleteBranch = () => {
    if (!showDeleteBranchConfirm) return;
    onDeleteBranch(showDeleteBranchConfirm.id);
    onAddAuditLog(
      'Admin de Organización', 
      'ELIMINAR_SUCURSAL', 
      showDeleteBranchConfirm.id, 
      showDeleteBranchConfirm.name, 
      'ELIMINADO', 
      `Se eliminó la sucursal "${showDeleteBranchConfirm.name}".`
    );
    triggerToast(`Sucursal ${showDeleteBranchConfirm.name} eliminada.`);
    setShowDeleteBranchConfirm(null);
  };

  // Filtrado de empleados en el directorio (Sucursal + Departamento + Buscador, H7)
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch === 'ALL' || emp.branch === filterBranch;
    const matchesDept = filterDept === 'ALL' || emp.department === filterDept;
    return matchesSearch && matchesBranch && matchesDept;
  });

  const getBranchCount = (bName) => {
    return employees.filter(e => e.branch === bName).length;
  };

  const getDeptCount = (dName) => {
    return employees.filter(e => e.department === dName).length;
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Estructura Organizacional (Multi-Sucursal)</h1>
          <p className="text-slate-500 mt-1">Gestione el directorio de colaboradores, cree nuevos perfiles y organice las sucursales y departamentos corporativos.</p>
        </div>

        {/* Sub Navegación (Heurística 1) */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 shadow-inner flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('EMPLOYEES')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'EMPLOYEES'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                : 'hover:text-slate-900'
            }`}
          >
            <Users size={13} />
            Directorio ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('DEPARTMENTS')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'DEPARTMENTS'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                : 'hover:text-slate-900'
            }`}
          >
            <Building2 size={13} />
            Áreas ({departments.length})
          </button>
          <button
            onClick={() => setActiveTab('BRANCHES')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'BRANCHES'
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50'
                : 'hover:text-slate-900'
            }`}
          >
            <MapPin size={13} />
            Sucursales ({branches.length})
          </button>
        </div>
      </div>

      {/* TABA: COLABORADORES */}
      {activeTab === 'EMPLOYEES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Listado / Directorio */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filtros Combinados (Heurística 7: Flexibilidad y Eficiencia) */}
            <div className="flex flex-col md:flex-row bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm gap-3 justify-between items-center">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-semibold"
                />
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">Todas las Sucursales</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>

                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-600 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="ALL">Todas las Áreas</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rejilla de Tarjetas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {filteredEmployees.length === 0 ? (
                <div className="col-span-2 text-center py-12 bg-white border border-dashed rounded-xl text-slate-400 font-semibold">
                  No se encontraron colaboradores con los criterios seleccionados.
                </div>
              ) : (
                filteredEmployees.map((emp) => (
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
                        <span className="bg-slate-100 border text-slate-600 px-2 py-0.5 rounded text-[10px]" title="Área / Departamento">
                          {emp.department}
                        </span>
                        <span className="bg-indigo-50/50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-[10px] flex items-center gap-1 font-bold" title="Sucursal">
                          <MapPin size={9} /> {emp.branch}
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
                ))
              )}
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
                <label htmlFor="emp-name" className="block text-slate-500">Nombre Completo</label>
                <input
                  id="emp-name"
                  type="text" required placeholder="Ej. Juan Miller" value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-250 rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="emp-role" className="block text-slate-500">Cargo / Rol</label>
                <input
                  id="emp-role"
                  type="text" required placeholder="Ej. Analista Senior Contabilidad" value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-250 rounded-lg focus:ring-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="emp-dept-select" className="block text-slate-500">Departamento / Área</label>
                  <select
                    id="emp-dept-select"
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                    className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 text-slate-700"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="emp-branch-select" className="block text-slate-500">Sucursal Asignada</label>
                  <select
                    id="emp-branch-select"
                    value={empBranch}
                    onChange={(e) => setEmpBranch(e.target.value)}
                    className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 text-slate-700 font-bold"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="emp-shift-select" className="block text-slate-500">Turno de Entrada</label>
                  <select
                    id="emp-shift-select"
                    value={empShift}
                    onChange={(e) => setEmpShift(e.target.value)}
                    className="w-full px-2.5 py-2 border rounded-lg focus:ring-1 text-slate-750"
                  >
                    <option value="Turno Diurno (08:00 - 17:00)">Diurno (08:00 - 17:00)</option>
                    <option value="Turno Estándar (09:00 - 18:00)">Estándar (09:00 - 18:00)</option>
                    <option value="Turno Nocturno (22:00 - 06:00)">Nocturno (22:00 - 06:00)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="emp-email" className="block text-slate-500">Email Corporativo</label>
                  <input
                    id="emp-email"
                    type="email" placeholder="correo@empresa.com" value={empEmail}
                    onChange={(e) => setEmpEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-250 rounded-lg focus:ring-1"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="emp-avatar" className="block text-slate-500">URL Foto de Perfil (Opcional)</label>
                <input
                  id="emp-avatar"
                  type="text" placeholder="https://images.unsplash.com/..." value={empAvatar}
                  onChange={(e) => setEmpAvatar(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-250 rounded-lg focus:ring-1"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
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
                <label htmlFor="dept-name" className="block text-slate-500">Nombre del Departamento</label>
                <input
                  id="dept-name"
                  type="text" required placeholder="Ej. Ventas Enterprise" value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="dept-supervisor" className="block text-slate-500">Supervisor / Responsable</label>
                <input
                  id="dept-supervisor"
                  type="text" required placeholder="Ej. Laura González" value={deptSupervisor}
                  onChange={(e) => setDeptSupervisor(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="dept-costcenter" className="block text-slate-500">Código de Centro de Costos</label>
                <input
                  id="dept-costcenter"
                  type="text" placeholder="Ej. CC-8902-MK" value={deptCostCenter}
                  onChange={(e) => setDeptCostCenter(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Registrar Departamento
              </button>
            </form>
          </div>

        </div>
      )}

      {/* TABA: SUCURSALES (Heurística 1 & 7) */}
      {activeTab === 'BRANCHES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Listado de Sucursales */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-700">Sucursales Activas en el Sistema</span>
              <button
                onClick={() => setShowCreateBranchModal(true)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={13} /> Nueva Sucursal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {branches.map((branch) => (
                <div 
                  key={branch.id} 
                  className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-200 hover:shadow-md transition-all relative group"
                >
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start pr-6">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        <MapPin size={15} className="text-indigo-500" />
                        {branch.name}
                      </h3>
                      <span className="text-[9px] font-mono bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 font-bold uppercase shrink-0">
                        {branch.id}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Dirección: <span className="text-slate-600 font-semibold">{branch.address}</span>
                    </p>
                  </div>

                  {/* Red IP y Zona Horaria (Estilo ZKTeco) */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 text-[11px] font-semibold text-slate-600">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 block text-[8px] uppercase font-bold flex items-center gap-1"><Clock size={10} /> Zona Horaria</span>
                      <span className="text-slate-800 font-bold">{branch.timezone}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-400 block text-[8px] uppercase font-bold flex items-center gap-1"><Wifi size={10} /> Red Baliza IP</span>
                      <code className="text-indigo-600 font-mono font-bold block">{branch.ipRange}</code>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs font-semibold">
                    <div>
                      <span className="text-slate-400 block text-[9px] mb-0.5 font-bold uppercase">Administrador local</span>
                      <span className="text-slate-800 font-bold">{branch.manager}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[9px] mb-0.5 font-bold uppercase">Colaboradores</span>
                      <span className="text-indigo-600 font-bold text-sm font-mono">{getBranchCount(branch.name)} personas</span>
                    </div>
                  </div>

                  {/* Botón Eliminar (Heurística 3: Libertad del usuario) */}
                  <button
                    onClick={() => setShowDeleteBranchConfirm(branch)}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Eliminar esta sucursal"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Caja Informativa de Ayuda IP / Zona (Heurística 10) */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 h-fit text-xs text-slate-600 leading-relaxed font-semibold">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5 pb-2 border-b border-slate-200"><Info size={15} className="text-indigo-500" /> Ayuda Multisucursal (ZKTeco)</h4>
            <p>
              El soporte multisucursal de Krono sincroniza la hora local según la zona horaria del dispositivo de acceso o tableta física asignada a la sucursal.
            </p>
            <p>
              <strong>Filtros de Red IP:</strong> Los rangos CIDR configurados limitan los marcajes web móviles, validando que el colaborador esté conectado exclusivamente a la red de sucursal antes de autorizar el fichaje.
            </p>
          </div>

        </div>
      )}

      {/* ═══════════════ MODAL · CREAR SUCURSAL (Heurística 5 & 8) ═══════════════ */}
      {showCreateBranchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleCreateBranch}
            className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin size={16} className="text-indigo-600" /> Crear Nueva Sucursal
              </h3>
              <button 
                type="button" 
                onClick={() => { setShowCreateBranchModal(false); setBranchError(''); }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {branchError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-[11px] text-rose-700 font-bold flex items-start gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{branchError}</span>
              </div>
            )}

            {/* Presets de Relleno Rápido (Heurística 6) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Presets de Relleno Rápido</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => applyBranchPreset('OFFICE')}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  🏢 Oficina Corporativa
                </button>
                <button
                  type="button"
                  onClick={() => applyBranchPreset('FACTORY')}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  🏭 Planta Industrial
                </button>
                <button
                  type="button"
                  onClick={() => applyBranchPreset('WAREHOUSE')}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  📦 Centro de Distribución
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label htmlFor="branch-name" className="text-xs font-bold text-slate-700">Nombre de la Sucursal *</label>
                <input
                  id="branch-name"
                  type="text"
                  placeholder="Ej. Corporativo Monterrey, Planta Industrial"
                  value={branchName}
                  onChange={(e) => { setBranchName(e.target.value); setBranchError(''); }}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label htmlFor="branch-address" className="text-xs font-bold text-slate-700">Dirección Física</label>
                <input
                  id="branch-address"
                  type="text"
                  placeholder="Ej. Calle 10 #405 Zona Industrial"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="branch-timezone" className="text-xs font-bold text-slate-700">Zona Horaria</label>
                <select
                  id="branch-timezone"
                  value={branchTimezone}
                  onChange={(e) => setBranchTimezone(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                >
                  <option value="GMT-6 (CDMX)">GMT-6 (Ciudad de México)</option>
                  <option value="GMT-5 (Lima/Bogotá)">GMT-5 (Lima / Bogotá)</option>
                  <option value="GMT-8 (Tijuana)">GMT-8 (Tijuana)</option>
                  <option value="GMT-3 (B. Aires)">GMT-3 (Buenos Aires)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="branch-iprange" className="text-xs font-bold text-slate-700">Rango IP Baliza (CIDR)</label>
                <input
                  id="branch-iprange"
                  type="text"
                  placeholder="Ej. 192.168.1.1/24"
                  value={branchIpRange}
                  onChange={(e) => setBranchIpRange(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono font-bold text-indigo-700"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label htmlFor="branch-manager" className="text-xs font-bold text-slate-700">Gerente / Administrador de Sucursal</label>
                <input
                  id="branch-manager"
                  type="text"
                  placeholder="Ej. Laura González"
                  value={branchManager}
                  onChange={(e) => setBranchManager(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setShowCreateBranchModal(false); setBranchError(''); }}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!branchName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
              >
                Crear Sucursal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════ MODAL · CONFIRMAR ELIMINACIÓN DE SUCURSAL (Heurística 3 & 9) ═══════════════ */}
      {showDeleteBranchConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">¿Eliminar sucursal?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Estás a punto de eliminar permanentemente la sucursal <strong>{showDeleteBranchConfirm.name}</strong>. Esta acción desvinculará a los empleados y terminales de red IP {showDeleteBranchConfirm.ipRange} asociados.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteBranchConfirm(null)}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteBranch}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
              >
                Eliminar Sucursal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
