import { useCallback, useMemo, useState } from 'react';
import { GameEngine } from './core/GameEngine';
import { GraphEditor } from './ui/GraphEditor';
import type { RoomKind } from './core/types';
import { ROOM_KIND_LABELS } from './core/types';

export default function App() {
  const [engine] = useState(() => new GameEngine());
  const [showAddRoom, setShowAddRoom] = useState(false);

  const handleAddRoom = useCallback(() => {
    setShowAddRoom(true);
  }, []);

  const handleReset = useCallback(() => {
    engine.reset();
  }, [engine]);

  const handlePickRoomKind = useCallback(
    (kind: RoomKind) => {
      // Добавляем в случайную позицию рядом с существующими
      const snapshot = engine.getSnapshot();
      const offset = snapshot.rooms.length * 40;
      engine.addRoom(kind, { x: 350 + offset, y: -220 + offset });
      setShowAddRoom(false);
    },
    [engine],
  );

  const roomKinds = useMemo<RoomKind[]>(() => ['garage', 'lab', 'production', 'storage', 'rest'], []);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#12121a', position: 'relative' }}>
      <GraphEditor engine={engine} onAddRoomClick={handleAddRoom} onResetClick={handleReset} />

      {showAddRoom && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            background: '#1e1e2e',
            border: '1px solid #444',
            borderRadius: 12,
            padding: 20,
            color: '#eee',
            minWidth: 240,
          }}
        >
          <div style={{ fontWeight: 'bold', fontSize: 15, marginBottom: 12 }}>Добавить комнату:</div>
          {roomKinds.map((kind) => (
            <button
              key={kind}
              onClick={() => handlePickRoomKind(kind)}
              style={{
                display: 'block',
                width: '100%',
                marginTop: 6,
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid #555',
                background: '#2a2a3e',
                color: '#eee',
                cursor: 'pointer',
                fontSize: 13,
                textAlign: 'left',
              }}
            >
              {ROOM_KIND_LABELS[kind]}
            </button>
          ))}
          <button
            onClick={() => setShowAddRoom(false)}
            style={{
              display: 'block',
              width: '100%',
              marginTop: 10,
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #555',
              background: 'transparent',
              color: '#aaa',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Отмена
          </button>
        </div>
      )}
    </div>
  );
}