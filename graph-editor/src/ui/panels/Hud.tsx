import type { CSSProperties } from 'react';
import type { Cat, Room, RoomId } from '../../core/types';
import { CAT_ROLE_LABELS, ROOM_KIND_LABELS } from '../../core/types';

interface HudProps {
  prototypes: number;
  currency: number;
  failed: boolean;
  cats: Cat[];
  rooms: Room[];
  onAssignCat: (catId: string, roomId: RoomId) => void;
  onAddRoomClick: () => void;
  onResetClick: () => void;
}

const catState = (c: Cat) =>
  c.state === 'working' ? 'работает' : c.state === 'moving' ? 'идёт…' : c.state === 'resting' ? 'отдыхает' : 'свободен';

export function Hud({ prototypes, currency, failed, cats, rooms, onAssignCat, onAddRoomClick, onResetClick }: HudProps) {
  return (
    <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 30, background: 'rgba(30,30,46,0.92)', color: '#eee', borderRadius: 10, padding: 12, width: 230, fontSize: 12, maxHeight: 'calc(100% - 20px)', overflowY: 'auto' }}>
      <div style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>Upload Labs 🐾</div>

      {failed && <div style={{ color: '#ff6b6b', marginBottom: 8, fontWeight: 'bold' }}>⚠️ Гараж переполнен! Сбросьте базу.</div>}
      {prototypes >= 3 && <div style={{ color: '#66ff99', marginBottom: 8, fontWeight: 'bold' }}>🎉 Hello World! База работает!</div>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
        <span>🛠 <b>{Math.floor(prototypes)}/3</b></span>
        <span>⚙️ <b>{Math.floor(currency)}</b></span>
      </div>

      <div style={{ marginBottom: 6 }}>
        <button onClick={onResetClick} style={btnStyle}>🔄 Сбросить базу</button>
      </div>
      <div style={{ marginBottom: 10 }}>
        <button onClick={onAddRoomClick} style={btnStyle}>➕ Добавить комнату</button>
      </div>

      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Коты:</div>
      {cats.map((cat) => (
        <div key={cat.id} style={{ marginBottom: 6 }}>
          <div>
            {cat.emoji} {cat.name} <span style={{ color: '#888' }}>{catState(cat)}</span>
          </div>
          <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>
            ⚡ {Math.round(cat.energy)}% · {CAT_ROLE_LABELS[cat.role] ?? cat.role}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {rooms.filter((r) => r.kind !== 'rest').map((room) => (
              <button
                key={room.id}
                onClick={() => onAssignCat(cat.id, room.id)}
                style={{ ...btnSmall, background: cat.assignedRoom === room.id ? '#4a6fa5' : '#2a2a3e' }}
              >
                {ROOM_KIND_LABELS[room.kind] ?? room.kind}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const btnStyle: CSSProperties = {
  width: '100%',
  padding: '6px 0',
  borderRadius: 6,
  border: '1px solid #555',
  background: '#2a2a3e',
  color: '#eee',
  cursor: 'pointer',
  fontSize: 12,
};

const btnSmall: CSSProperties = {
  padding: '2px 6px',
  borderRadius: 4,
  border: '1px solid #555',
  color: '#eee',
  cursor: 'pointer',
  fontSize: 10,
};