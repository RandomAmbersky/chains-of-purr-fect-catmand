import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';
import type { Edge, EdgeProps } from '@xyflow/react';
import type { ResourceEdgeData } from '../useGameSync';

const KIND_ICONS: Record<string, string> = {
  container: '📦',
  data: '🧪',
  prototype: '🛠',
};

function ResourceEdgeComponent(props: EdgeProps<Edge<ResourceEdgeData>>) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, id, markerEnd } = props;
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        {(data?.resources ?? []).map((res) => {
          // Интерполяция позиции точки по кривой Безье
          const t = Math.min(1, Math.max(0, res.t));
          // Квадратичная аппроксимация позиции на кривой Безье
          const p0x = sourceX;
          const p0y = sourceY;
          const p1x = (sourceX + targetX) / 2;
          const p1y = sourceY;
          const p2x = (sourceX + targetX) / 2;
          const p2y = targetY;
          const p3x = targetX;
          const p3y = targetY;
          const x =
            Math.pow(1 - t, 3) * p0x +
            3 * Math.pow(1 - t, 2) * t * p1x +
            3 * (1 - t) * t * t * p2x +
            t * t * t * p3x;
          const y =
            Math.pow(1 - t, 3) * p0y +
            3 * Math.pow(1 - t, 2) * t * p1y +
            3 * (1 - t) * t * t * p2y +
            t * t * t * p3y;

          return (
            <div
              key={res.id}
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                fontSize: 16,
                pointerEvents: 'none',
                zIndex: 10,
              }}
            >
              {KIND_ICONS[res.kind] ?? '•'}
            </div>
          );
        })}
      </EdgeLabelRenderer>
    </>
  );
}

export const ResourceEdge = memo(ResourceEdgeComponent);