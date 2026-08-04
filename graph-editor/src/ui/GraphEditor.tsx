import { useCallback, useEffect, useRef, useState } from 'react';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { GameEngine } from '../core/GameEngine';
import type { CatId, RoomId } from '../core/types';
import { useGameSync } from './useGameSync';
import { RoomNode } from './nodes/RoomNode';
import { CatNode } from './nodes/CatNode';
import { ResourceEdge } from './edges/ResourceEdge';
import { NodePanel } from './panels/NodePanel';
import { Hud } from './panels/Hud';

const nodeTypes = {
  room: RoomNode,
  cat: CatNode,
};

const edgeTypes = {
  resource: ResourceEdge,
};

interface GraphEditorProps {
  engine: GameEngine;
  onAddRoomClick: () => void;
  onResetClick: () => void;
}

export function GraphEditor({ engine, onAddRoomClick, onResetClick }: GraphEditorProps) {
  const { nodes, edges, snapshot, onNodesChange, onEdgesChange, onConnect } = useGameSync(engine);
  const [selectedRoomId, setSelectedRoomId] = useState<RoomId | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Игровой цикл
  useEffect(() => {
    let raf = 0;
    const tick = (time: number) => {
      if (lastTimeRef.current !== null) {
        const dt = Math.min(0.1, (time - lastTimeRef.current) / 1000);
        engine.step(dt);
      }
      lastTimeRef.current = time;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      lastTimeRef.current = null;
    };
  }, [engine]);

  const handleNodeClick = useCallback(
    (_e: React.MouseEvent, node: { id: string; type?: string }) => {
      if (node.type === 'room') {
        setSelectedRoomId(node.id);
      }
    },
    [],
  );

  const handlePaneClick = useCallback(() => {
    setSelectedRoomId(null);
  }, []);

  const handleAssignCat = useCallback(
    (catId: CatId, roomId: RoomId) => {
      engine.assignCat(catId, roomId);
    },
    [engine],
  );

  const handleUpgrade = useCallback(
    (roomId: RoomId) => {
      engine.upgradeNode(roomId);
    },
    [engine],
  );

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#333" gap={20} />
          <Controls />
          <MiniMap pannable zoomable />
        </ReactFlow>
      </div>

      <Hud
        prototypes={snapshot.stats.prototypes}
        currency={snapshot.stats.currency}
        failed={snapshot.stats.failed}
        cats={snapshot.cats}
        rooms={snapshot.rooms}
        onAssignCat={handleAssignCat}
        onAddRoomClick={onAddRoomClick}
        onResetClick={onResetClick}
      />

      {selectedRoomId && (
        <NodePanel
          roomId={selectedRoomId}
          snapshot={snapshot}
          onUpgrade={handleUpgrade}
          onClose={() => setSelectedRoomId(null)}
          onAssignCat={handleAssignCat}
        />
      )}
    </div>
  );
}