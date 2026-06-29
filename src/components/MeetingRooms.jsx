import React, { useState } from 'react';
import { 
  Compass, Users, X, Clock, Play, Calendar, Trash2, ShieldAlert, Plus, Search, Info, AlertTriangle
} from 'lucide-react';

export default function MeetingRooms({ roomsState, onUpdateRoom, onAddRoom, onDeleteRoom, onAddAuditLog, branches }) {
  // Búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, AVAILABLE, RESERVED, CHECKED_IN, RELEASED
  const [filterBranch, setFilterBranch] = useState('ALL');
  
  // Modals y formularios
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null); // room object to delete
  const [selectedRoomId, setSelectedRoomId] = useState(roomsState[0]?.id || null);

  // Campos del formulario
  const [newName, setNewName] = useState('');
  const [newCapacity, setNewCapacity] = useState(6);
  const [newBranch, setNewBranch] = useState(branches ? branches[0]?.name || 'Corporativo Central' : 'Corporativo Central');
  const [newQrCode, setNewQrCode] = useState('');
  const [newStatus, setNewStatus] = useState('AVAILABLE');
  const [newReservation, setNewReservation] = useState('Disponible');
  const [newOrganizer, setNewOrganizer] = useState('--');
  const [formError, setFormError] = useState('');

  // Sincronizar la sala seleccionada
  const selectedRoom = roomsState.find(r => r.id === selectedRoomId) || roomsState[0] || null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
      case 'DISPONIBLE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CHECKED_IN':
      case 'INGRESADO':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'RESERVED':
      case 'RESERVADO':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'RELEASED_BY_NO_SHOW':
      case 'LIBERADO_POR_AUSENCIA':
        return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const handleCheckInRoom = (room) => {
    const updated = {
      ...room,
      status: 'CHECKED_IN',
      slaTimer: 0
    };
    onUpdateRoom(room.id, updated);
    onAddAuditLog(
      room.organizer || 'Organizador', 
      'ROOM_CHECK_IN', 
      room.id, 
      'RESERVADO', 
      'INGRESADO', 
      `Check-in exitoso en ${room.name}. Validación QR correcta.`
    );
  };

  const handleReleaseNoShow = (room) => {
    const updated = {
      ...room,
      status: 'RELEASED_BY_NO_SHOW',
      slaTimer: 0,
      nextReservation: 'DISPONIBLE',
      organizer: '--'
    };
    onUpdateRoom(room.id, updated);
    onAddAuditLog(
      'Sistema Anti-Ghosting', 
      'AUTO_LIBERACION_SALA', 
      room.id, 
      'RESERVADO', 
      'LIBERADO_POR_AUSENCIA', 
      `Liberación automática de ${room.name} por inasistencia (no-show).`
    );
  };

  const handleResetRoom = (room) => {
    const updated = {
      ...room,
      status: 'RESERVADO',
      slaTimer: 15,
      nextReservation: '12:30 PM - Standup Semanal',
      organizer: 'Carlos Díaz'
    };
    onUpdateRoom(room.id, updated);
    onAddAuditLog(
      'Admin de RRHH', 
      'REINICIAR_RESERVA', 
      room.id, 
      room.status, 
      'RESERVADO', 
      `Se reinició la reserva de demo para la sala ${room.name}.`
    );
  };

  // Preset templates para rellenar rápido el formulario (Heurística 6)
  const applyPreset = (type) => {
    switch (type) {
      case 'PHONE':
        setNewName('Cabina Focus');
        setNewCapacity(1);
        setNewStatus('AVAILABLE');
        setNewReservation('Disponible');
        setNewOrganizer('--');
        setNewQrCode('KRN-RM-FOCUS');
        break;
      case 'MEETING':
        setNewName('Sala Scrum');
        setNewCapacity(6);
        setNewStatus('RESERVED');
        setNewReservation('02:00 PM - Daily Standup');
        setNewOrganizer('Carlos Díaz');
        setNewQrCode('KRN-RM-SCRUM');
        break;
      case 'BOARD':
        setNewName('Sala Directiva Magna');
        setNewCapacity(16);
        setNewStatus('RESERVED');
        setNewReservation('11:30 AM - Revisión Financiera');
        setNewOrganizer('Sofía Rodríguez');
        setNewQrCode('KRN-RM-MAGNA');
        break;
      default:
        break;
    }
  };

  // Creación de sala
  const handleSaveRoom = (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      setFormError('El nombre de la sala no puede estar vacío.');
      return;
    }
    if (newCapacity < 1) {
      setFormError('La capacidad debe ser de al menos 1 asiento.');
      return;
    }
    
    // Validar nombre duplicado (Heurística 5)
    const existsName = roomsState.some(r => r.name.toLowerCase() === newName.toLowerCase());
    if (existsName) {
      setFormError('Ya existe una sala con este nombre.');
      return;
    }

    const qr = newQrCode.trim() || `KRN-RM-${newName.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random()*900)}`;

    const newRoom = {
      id: `RM-${Math.floor(200 + Math.random() * 800)}`,
      name: newName,
      capacity: Number(newCapacity),
      status: newStatus,
      branch: newBranch,
      nextReservation: newStatus === 'AVAILABLE' ? 'AVAILABLE' : newReservation,
      organizer: newStatus === 'AVAILABLE' ? '--' : newOrganizer,
      slaTimer: newStatus === 'RESERVED' ? 15 : 0,
      qrCode: qr
    };

    onAddRoom(newRoom);
    onAddAuditLog(
      'Supervisor de Espacios', 
      'CREAR_SALA_REUNION', 
      newRoom.id, 
      'N/A', 
      newStatus, 
      `Sala "${newRoom.name}" creada con capacidad de ${newRoom.capacity} asientos.`
    );

    // Resetear formulario
    setNewName('');
    setNewCapacity(6);
    setNewQrCode('');
    setNewStatus('AVAILABLE');
    setNewReservation('Disponible');
    setNewOrganizer('--');
    setFormError('');
    setShowCreateModal(false);
    setSelectedRoomId(newRoom.id);
  };

  const handleConfirmDelete = () => {
    if (!showDeleteConfirm) return;
    onDeleteRoom(showDeleteConfirm.id);
    onAddAuditLog(
      'Supervisor de Espacios', 
      'ELIMINAR_SALA_REUNION', 
      showDeleteConfirm.id, 
      showDeleteConfirm.status, 
      'ELIMINADO', 
      `Se eliminó la sala de reunión "${showDeleteConfirm.name}".`
    );
    if (selectedRoomId === showDeleteConfirm.id) {
      setSelectedRoomId(roomsState.find(r => r.id !== showDeleteConfirm.id)?.id || null);
    }
    setShowDeleteConfirm(null);
  };

  // Filtrado de salas por sucursal
  const roomsInBranch = filterBranch === 'ALL'
    ? roomsState
    : roomsState.filter(r => r.branch === filterBranch);

  const filteredRooms = roomsInBranch.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          room.qrCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'AVAILABLE') return matchesSearch && (room.status === 'AVAILABLE' || room.status === 'DISPONIBLE');
    if (statusFilter === 'RESERVED') return matchesSearch && room.status === 'RESERVED';
    if (statusFilter === 'CHECKED_IN') return matchesSearch && room.status === 'CHECKED_IN';
    if (statusFilter === 'RELEASED') return matchesSearch && room.status === 'RELEASED_BY_NO_SHOW';
    return matchesSearch;
  });

  // KPIs dinámicos para Visibilidad del Estado (Heurística 1)
  const totalCount = roomsInBranch.length;
  const availableCount = roomsInBranch.filter(r => r.status === 'AVAILABLE' || r.status === 'DISPONIBLE').length;
  const reservedCount = roomsInBranch.filter(r => r.status === 'RESERVED').length;
  const checkedInCount = roomsInBranch.filter(r => r.status === 'CHECKED_IN').length;
  const releasedCount = roomsInBranch.filter(r => r.status === 'RELEASED_BY_NO_SHOW').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Cabecera y Botón Crear */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Salas de Reunión y Anti-Ghosting</h1>
          <p className="text-slate-500 mt-1">Supervise espacios de colaboración y aplique políticas de liberación automática para optimizar el uso de salas.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus size={14} /> Crear Nueva Sala
        </button>
      </div>

      {/* Panel Superior de KPIs (Heurística 1: Visibilidad del sistema) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Salas</div>
          <div className="text-2xl font-extrabold text-slate-800 mt-1">{totalCount}</div>
        </div>
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 shadow-xs">
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Disponibles</div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">{availableCount}</div>
        </div>
        <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 shadow-xs">
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider">Reservadas</div>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">{reservedCount}</div>
        </div>
        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 shadow-xs">
          <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">En Uso (Check-in)</div>
          <div className="text-2xl font-extrabold text-indigo-800 mt-1">{checkedInCount}</div>
        </div>
        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 shadow-xs col-span-2 md:col-span-1">
          <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">Liberadas (No-Show)</div>
          <div className="text-2xl font-extrabold text-rose-800 mt-1">{releasedCount}</div>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtros (Heurística 7: Flexibilidad y Eficiencia) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Buscar sala por nombre o QR..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-semibold"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>

          {branches && branches.length > 1 && (
            <select
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-xs text-slate-600 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="ALL">Todas las Sucursales</option>
              {branches.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Pestañas de Filtro */}
        <div className="flex flex-wrap gap-1 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'Todas' },
            { id: 'AVAILABLE', label: 'Disponibles' },
            { id: 'RESERVED', label: 'Reservadas' },
            { id: 'CHECKED_IN', label: 'En Uso' },
            { id: 'RELEASED', label: 'Liberadas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Grilla de salas */}
        <div className="lg:col-span-2 space-y-4">
          {filteredRooms.length === 0 ? (
            <div className="bg-white border border-dashed rounded-xl p-12 text-center text-slate-400 font-semibold">
              <Compass size={32} className="mx-auto mb-2 text-slate-300" />
              No se encontraron salas que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRooms.map((room) => {
                const isSelected = selectedRoom && selectedRoom.id === room.id;
                return (
                  <div 
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`bg-white p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative group ${
                      isSelected 
                        ? 'border-indigo-600 shadow-md ring-1 ring-indigo-600/30' 
                        : 'border-slate-200/80 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex justify-between items-start pr-6">
                        <h3 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{room.name}</h3>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold border shrink-0 ${getStatusBadge(room.status)}`}>
                          {(room.status === 'RELEASED_BY_NO_SHOW' ? 'LIBERADA' : room.status).replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Users size={12} /> Capacidad: {room.capacity} asientos
                      </div>
                    </div>

                    <div className="bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 text-xs font-semibold text-slate-600 space-y-1">
                      <div className="text-[9px] text-slate-400 uppercase">Reserva Activa</div>
                      <div className="truncate text-slate-700">{room.nextReservation === 'AVAILABLE' ? 'DISPONIBLE' : room.nextReservation}</div>
                      {room.organizer !== '--' && (
                        <div className="text-[10px] text-slate-400">Anfitrión: {room.organizer}</div>
                      )}
                    </div>

                    {/* Relojes SLA */}
                    {room.status === 'RESERVADO' && (
                      <div className="flex items-center justify-between text-[10px] font-bold text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="animate-spin" />
                          Liberación por inasistencia:
                        </span>
                        <span className="font-mono">{room.slaTimer} minutos</span>
                      </div>
                    )}
                    
                    {room.status === 'RELEASED_BY_NO_SHOW' && (
                      <div className="flex items-center justify-between text-[10px] font-bold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100">
                        <span className="flex items-center gap-1">
                          <ShieldAlert size={11} />
                          Liberada:
                        </span>
                        <span>Desalojo Automático</span>
                      </div>
                    )}

                    {/* Botón de Eliminación (Heurística 3: Libertad del usuario) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(room);
                      }}
                      className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Eliminar esta sala"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Señalización de Lobby */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Calendar size={16} className="text-violet-500" />
                Panel de Señalización Digital de Lobby
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jornada de Hoy</span>
            </div>

            <div className="grid grid-cols-4 gap-4 text-xs font-semibold text-center text-slate-500">
              {[
                { time: '09:00 AM', room: 'Ada Lovelace', label: 'Standup (Desalojo)', color: 'bg-rose-50 text-rose-600 border border-rose-100' },
                { time: '10:00 AM', room: 'Turing Hub', label: 'Post-Mortem TI', color: 'bg-amber-50 text-amber-600 border border-amber-100' },
                { time: '11:30 AM', room: 'Sala Alfa', label: 'Alianza con Deel', color: 'bg-indigo-50 text-indigo-600 border border-indigo-100' },
                { time: '03:00 PM', room: 'Lounge Stripe', label: 'Planificación Anual', color: 'bg-slate-50 text-slate-400 border border-slate-100' },
              ].map((sch, i) => (
                <div key={i} className="p-3 bg-white border border-slate-100 rounded-xl space-y-2 hover:border-slate-200 transition-all">
                  <div className="font-mono text-slate-400 text-[10px]">{sch.time}</div>
                  <div className="font-bold text-slate-700 text-[11px]">{sch.room}</div>
                  <div className={`p-1.5 rounded text-[9px] truncate font-medium ${sch.color}`} title={sch.label}>
                    {sch.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Lógica anti-ghosting y Detalles de Sala Seleccionada */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Compass className="text-indigo-500" size={18} />
            <h3 className="font-bold text-slate-800 text-sm">Detalles y Simulación</h3>
          </div>

          {selectedRoom ? (
            <div className="space-y-6 text-xs font-semibold text-slate-600">
              <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs space-y-2 shadow-inner border border-slate-850">
                <div className="text-indigo-400 font-bold uppercase tracking-wider text-[9px] mb-1">DSL de Liberación de Espacios</div>
                <div>
                  <span className="text-amber-400">IF</span> Room.Status == RESERVED
                </div>
                <div>
                  <span className="text-amber-400">AND</span> CurrentTime &gt; (ReserveTime + 15m)
                </div>
                <div>
                  <span className="text-amber-400">AND</span> RoomQR.Scanned == FALSE
                </div>
                <div>
                  <span className="text-amber-400">THEN</span> ReleaseRoom()
                </div>
              </div>

              {/* Simulador */}
              <div className="bg-slate-50 p-4 rounded-xl border space-y-4">
                <div className="flex justify-between items-center text-slate-700">
                  <span>ESCANEADO SIMULADO</span>
                  <span className="font-bold text-indigo-600">{selectedRoom.name}</span>
                </div>

                <div className="flex items-center justify-center p-3 bg-white border-2 border-slate-900 rounded-lg relative overflow-hidden group select-none w-24 h-24 mx-auto">
                  <div className="w-full h-full bg-white grid grid-cols-6 gap-0.5 p-1">
                    {Array.from({ length: 36 }).map((_, i) => {
                      const isDark = (i * selectedRoom.qrCode.charCodeAt(i % selectedRoom.qrCode.length)) % 3 === 0;
                      return <div key={i} className={`w-full h-full ${isDark ? 'bg-slate-900' : 'bg-white'}`} />;
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  {selectedRoom.status === 'RESERVADO' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReleaseNoShow(selectedRoom)}
                        className="flex-1 py-2 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded font-bold transition-all cursor-pointer text-xs"
                      >
                        Simular Inasistencia
                      </button>
                      <button
                        onClick={() => handleCheckInRoom(selectedRoom)}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition-all cursor-pointer text-xs"
                      >
                        Escanear QR Entrada
                      </button>
                    </div>
                  )}

                  {selectedRoom.status !== 'RESERVADO' && (
                    <button
                      onClick={() => handleResetRoom(selectedRoom)}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Play size={12} /> Habilitar para Demostración
                    </button>
                  )}
                </div>
              </div>

              {/* Detalles */}
              <div className="border border-slate-100 rounded-xl p-4 space-y-2.5 bg-slate-50/50">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Firmas de Teletrato</h4>
                <div className="space-y-1.5 text-xs text-slate-500 font-semibold">
                  <div className="flex justify-between">
                    <span>ID de Hardware Físico:</span>
                    <code className="text-slate-800 font-mono text-[10px]">{selectedRoom.qrCode}</code>
                  </div>
                  <div className="flex justify-between">
                    <span>Límite Tolerado:</span>
                    <span className="text-slate-700">15 minutos</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Reserva Actual:</span>
                    <span className="text-slate-700 truncate max-w-[150px]">{selectedRoom.nextReservation === 'AVAILABLE' ? 'DISPONIBLE' : selectedRoom.nextReservation}</span>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-medium">
              Seleccione una sala de reunión para acceder a los controles anti-ghosting y simuladores de marcajes QR corporativos.
            </div>
          )}
        </div>

      </div>

      {/* ═══════════════ MODAL · CREAR SALA DE REUNIONES (Heurística 5 & 8) ═══════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <form 
            onSubmit={handleSaveRoom}
            className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Plus size={16} className="text-indigo-600" /> Crear Nueva Sala de Reunión
              </h3>
              <button 
                type="button" 
                onClick={() => { setShowCreateModal(false); setFormError(''); }}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-[11px] text-rose-700 font-bold flex items-start gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Presets Rápidos (Heurística 6) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Presets de Relleno Rápido</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset('PHONE')}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  📞 Cabina Focus (1p)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('MEETING')}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  👥 Sala Scrum (6p)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('BOARD')}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-slate-600 hover:text-indigo-700 text-[11px] font-bold rounded-lg transition-all cursor-pointer"
                >
                  💼 Sala Directiva (16p)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="room-name" className="text-xs font-bold text-slate-700">Nombre de la Sala *</label>
                <input
                  id="room-name"
                  type="text"
                  placeholder="Ej. Sala de Diseño, Turing Hub"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setFormError(''); }}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="room-capacity" className="text-xs font-bold text-slate-700">Capacidad (asientos) *</label>
                <input
                  id="room-capacity"
                  type="number"
                  min="1"
                  max="100"
                  value={newCapacity}
                  onChange={(e) => { setNewCapacity(Number(e.target.value)); setFormError(''); }}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              {branches && branches.length > 1 && (
                <div className="space-y-1.5 col-span-2">
                  <label htmlFor="room-branch" className="text-xs font-bold text-slate-700">Sucursal Ubicación *</label>
                  <select
                    id="room-branch"
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-bold"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="room-status" className="text-xs font-bold text-slate-700">Estado Inicial</label>
                <select
                  id="room-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                >
                  <option value="AVAILABLE">Disponible</option>
                  <option value="RESERVED">Reservado (Con espera Check-in)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="room-qrcode" className="text-xs font-bold text-slate-700">Firma QR Hardware (Opcional)</label>
                <input
                  id="room-qrcode"
                  type="text"
                  placeholder="Ej. KRN-RM-SALAX"
                  value={newQrCode}
                  onChange={(e) => setNewQrCode(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {newStatus === 'RESERVED' && (
                <>
                  <div className="space-y-1.5">
                    <label htmlFor="room-reservation" className="text-xs font-bold text-slate-700">Nombre de la Reserva</label>
                    <input
                      id="room-reservation"
                      type="text"
                      placeholder="Ej. 10:00 AM - Sprint Planning"
                      value={newReservation}
                      onChange={(e) => setNewReservation(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="room-organizer" className="text-xs font-bold text-slate-700">Anfitrión / Organizador</label>
                    <input
                      id="room-organizer"
                      type="text"
                      placeholder="Ej. Juan Pérez"
                      value={newOrganizer}
                      onChange={(e) => setNewOrganizer(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2 text-[10px] text-slate-500">
              <Info size={14} className="text-indigo-600 shrink-0 mt-0.5" />
              <span>
                <strong>Heurística 10:</strong> Al crear una sala con estado "Reservado", el sistema activa un temporizador de 15 minutos en borrador. Si no se realiza Check-in mediante código QR, la sala volverá a estar "Disponible" automáticamente por inasistencia.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setShowCreateModal(false); setFormError(''); }}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!newName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
              >
                Crear Sala
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════ MODAL · CONFIRMAR ELIMINACIÓN DE SALA (Heurística 3 & 9) ═══════════════ */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <Trash2 size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">¿Eliminar sala de reunión?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Estás a punto de eliminar permanentemente la sala <strong>{showDeleteConfirm.name}</strong>. Esta acción desvinculará el hardware QR {showDeleteConfirm.qrCode} y cancelará las automatizaciones de presencia asociadas.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(null)}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-all shadow-md cursor-pointer"
              >
                Eliminar Sala
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
