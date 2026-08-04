import { memo } from 'react';
import type { Node, NodeProps } from '@xyflow/react';
import type { CatNodeData } from '../useGameSync';

const STATE_LABELS: Record<string, string> = {
  idle: 'свободен',
  moving: 'идёт…',
  working: 'работает',
  resting: 'отдыхает',
};

function CatNodeComponent({ data }: NodeProps<Node<CatNodeData>>) {
  const stateLabel = STATE_LABELS[data.state] ?? data.state;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'transparent',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: 26, lineHeight: 1 }}>{data.emoji}</div>
      <div
        style={{
          fontSize: 10,
          background: 'rgba(0,0,0,0.7)',
          color: '#eee',
          borderRadius: 6,
          padding: '2px 6px',
          marginTop: 2,
          whiteSpace: 'nowrap',
        }}
      >
        {data.name} · {stateLabel}
      </div>
      <div
        style={{
          fontSize: 9,
          color: '#aaa',
          marginTop: 1,
        }}
      >
        ⚡ {Math.round(data.energy)}%
      </div>
    </div>
  );
}

export const CatNode = memo(CatNodeComponent);