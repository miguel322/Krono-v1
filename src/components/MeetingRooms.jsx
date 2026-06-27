import React, { useState } from 'react';
import { 
  Compass, Users, CheckCircle, HelpCircle, XCircle, Clock, QrCode, 
  Play, Calendar, Trash2, ShieldAlert, CheckSquare
} from 'lucide-react';

export default function MeetingRooms({ roomsState, onUpdateRoom, onAddAuditLog }) {
  const [rooms, setRooms] = useState(roomsState);
  const [selectedRoom, setSelectedRoom] = useState(rooms[1] || null);

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

    const newRooms = rooms.map(r => r.id === room.id ? updated : r);
    setRooms(newRooms);
    onUpdateRoom(room.id, updated);
    setSelectedRoom(updated);

    onAddAuditLog(
      room.organizer, 
      'ROOM_CHECK_IN', 
      room.id, 
      'RESERVADO', 
      'INGRESADO', 
      `El organizador escaneó el código QR en la pantalla de la sala. Validación anti-ghosting exitosa.`
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

    const newRooms = rooms.map(r => r.id === room.id ? updated : r);
    setRooms(newRooms);
    onUpdateRoom(room.id, updated);
    setSelectedRoom(updated);

    onAddAuditLog(
      'Gestor de Salas Corporativo', 
      'AUTO_LIBERACION_SALA', 
      room.id, 
      'RESERVADO', 
      'LIBERADO_POR_AUSENCIA', 
      `Reserva eliminada automáticamente tras expirar el plazo de 15 minutos para ingresar.`
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

    const newRooms = rooms.map(r => r.id === room.id ? updated : r);
    setRooms(newRooms);
    onUpdateRoom(room.id, updated);
    setSelectedRoom(updated);

    onAddAuditLog(
      'Admin de RRHH', 
      'REINICIAR_RESERVA', 
      room.id, 
      room.status, 
      'RESERVADO', 
      `Reserva reiniciada para demostración interactiva.`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Cabecera */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Salas de Reunión y Anti-Ghosting</h1>
        <p className="text-slate-500 mt-1">Supervise espacios de colaboración y aplique políticas de liberación automática (anti-ghosting) para optimizar el uso de salas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Grilla de salas */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map((room) => (
              <div 
                key={room.id}
                onClick={() => setSelectedRoom(room)}
                className={`bg-white p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  selectedRoom && selectedRoom.id === room.id 
                    ? 'border-indigo-600 shadow-md ring-1 ring-indigo-600/30' 
                    : 'border-slate-200/80 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{room.name}</h3>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${getStatusBadge(room.status)}`}>
                      {(room.status === 'RELEASED_BY_NO_SHOW' ? 'LIBERADA_POR_AUSENCIA' : room.status).replace('_', ' ')}
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
              </div>
            ))}
          </div>

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

        {/* Lógica anti-ghosting */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Compass className="text-indigo-500" size={18} />
            <h3 className="font-bold text-slate-800 text-sm">Lógica de Liberación Anti-Ghosting</h3>
          </div>

          {selectedRoom ? (
            <div className="space-y-6 text-xs font-semibold text-slate-600">
              <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs space-y-2 shadow-inner border">
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
    </div>
  );
}
