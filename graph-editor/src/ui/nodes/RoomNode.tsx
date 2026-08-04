import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import type { RoomNodeData } from '../useGameSync';

const KIND_COLORS: Record<string, string> = {
  garage: '#4a6fa5',
  lab: '#8a4a8a',
  production: '#a56a3a',
  rest: '#3a8a5a',
  storage: '#6a6a6a',
};

function RoomNodeComponent({ data }: NodeProps<Node<RoomNodeData>>) {
  const color = KIND_COLORS[data.kind] ?? '#888';

  return (
    <div
      style={{
        border: `2px solid ${color}`,
        borderRadius: 10,
        background: '#1e1e2e',
        color: '#eee',
        padding: 10,
        minWidth: 130,
        textAlign: 'center',
        cursor: 'pointer',
      }}
      onClick={() => data.onSelect(data.roomId)}
    >
      <Handle type="target" position={Position.Top} style={{ background: color }} />
      <div style={{ fontWeight: 'bold', fontSize: 13 }}>{data.name}</div>
      <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>ур. {data.level}</div>
      <div style={{ fontSize: 11, marginTop: 4 }}>
        {data.producing ? (
          <span>⚙️ производит: {data.speed.toFixed(1)}/с</span>
        ) : (
          <span>📥 очередь: {Math.floor(data.queue)}/{data.maxQueue}</span>
        )}
      </div>
      <div style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
        скорость: {data.speed.toFixed(2)}/с
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: color }} />
    </div>
  );
}

export const RoomNode = memo(RoomNodeComponent);