import { useCallback } from 'react';
import type { GameSnapshot, RoomId } from '../../core/types';
import { ROOM_KIND_LABELS, CAT_ROLE_LABELS } from '../../core/types';

interface NodePanelProps {
  roomId: RoomId;
  snapshot: GameSnapshot;
  onUpgrade: (roomId: RoomId) => void;
  onClose: () => void;
  onAssignCat: (catId: string, roomId: RoomId) => void;
}

export function NodePanel({ roomId, snapshot, onUpgrade, onClose, onAssignCat }: NodePanelProps) {
  const room = snapshot.rooms.find((r) => r.id === roomId);
  if (!room) return null;

  const cost = Math.round(10 * Math.pow(2, room.level - 1));
  const canUpgrade = snapshot.stats.currency >= cost;
  const roomLabel = ROOM_KIND_LABELS[room.kind] ?? room.kind;

  const assignCat = useCallback(
    (catId: string) => onAssignCat(catId, roomId),
    [onAssignCat, roomId],
  );

  const catsHere = snapshot.cats.filter((c) => c.assignedRoom === roomId || (c.room === roomId && c.state === 'working'));

  return (
    <div
      style={{
        width: 240,
        background: '#1e1e2e',
        borderLeft: '1px solid #333',
        color: '#eee',
        padding: 16,
        height: '100%',
        overflowY: 'auto',
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 20,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 15 }}>{roomLabel}</h3>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#aaa',
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>{room.name}</div>

      <div style={{ marginTop: 12, fontSize: 13 }}>
        <div>Уровень: <b>{room.level}</b></div>
        <div>Очередь: <b>{room.queue.toFixed(1)} / {room.maxQueue}</b></div>
        <div>Скорость: <b>{room.baseSpeed.toFixed(2)}/с × {Math.pow(1.25, room.level - 1).toFixed(2)}</b></div>
      </div>

      <button
        onClick={() => onUpgrade(roomId)}
        disabled={!canUpgrade}
        style={{
          marginTop: 12,
          width: '100%',
          padding: '8px 0',
          borderRadius: 6,
          border: 'none',
          cursor: canUpgrade ? 'pointer' : 'not-allowed',
          background: canUpgrade ? '#4a8a4a' : '#333',
          color: canUpgrade ? '#fff' : '#777',
          fontSize: 13,
        }}
      >
        Улучшить за {cost} ⚙️
      </button>

      <div style={{ marginTop: 16, fontSize: 13, fontWeight: 'bold' }}>Коты на узле:</div>
      {catsHere.length === 0 && (
        <div style={{ fontSize: 12, color: '#777', marginTop: 4 }}>никто не назначен</div>
      )}
      {catsHere.map((cat) => (
        <div key={cat.id} style={{ fontSize: 12, marginTop: 4, color: '#ccc' }}>
          {cat.emoji} {cat.name}
          <span style={{ color: '#888' }}> — {cat.state === 'working' ? 'работает' : cat.state === 'moving' ? 'идёт' : 'отдыхает'}</span>
        </div>
      ))}

      <div style={{ marginTop: 16, fontSize: 13, fontWeight: 'bold' }}>Назначить кота:</div>
      {snapshot.cats.map((cat) => (
        <button
          key={cat.id}
          onClick={() => assignCat(cat.id)}
          style={{
            display: 'block',
            width: '100%',
            marginTop: 4,
            padding: '4px 8px',
            borderRadius: 6,
            border: '1px solid #444',
            background: '#2a2a3e',
            color: '#eee',
            fontSize: 12,
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          {cat.emoji} {cat.name} ({CAT_ROLE_LABELS[cat.role as keyof typeof CAT_ROLE_LABELS] ?? cat.role})
        </button>
      ))}
    </div>
  );
}