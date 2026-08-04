import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Node, NodeChange, EdgeChange, Connection } from '@xyflow/react';
import type { GameEngine } from '../core/GameEngine';
import type { Cat, GameSnapshot, Position, ResourceInTransit, Room, RoomId } from '../core/types';

export type RoomNodeData = {
  roomId: string;
  kind: Room['kind'];
  name: string;
  level: number;
  queue: number;
  maxQueue: number;
  speed: number;
  producing: boolean;
  upgradeCost: number;
  canUpgrade: boolean;
  onUpgrade: (roomId: string) => void;
  onSelect: (roomId: string) => void;
};

export type CatNodeData = {
  catId: string;
  name: string;
  role: Cat['role'];
  emoji: string;
  state: Cat['state'];
  energy: number;
  assignedRoom: RoomId | null;
  moving: boolean;
};

export type ResourceEdgeData = {
  resources: ResourceInTransit[];
};

/** Текущая позиция кота: интерполяция между комнатами пути или позиция комнаты */
function getCatPosition(snapshot: GameSnapshot, cat: Cat): Position {
  const room = snapshot.rooms.find((r) => r.id === cat.room);
  if (!room) return { x: 0, y: 0 };

  if (cat.state === 'moving' && cat.path.length >= 2) {
    const from = snapshot.rooms.find((r) => r.id === cat.path[0]);
    const to = snapshot.rooms.find((r) => r.id === cat.path[1]);
    if (from && to) {
      const t = cat.progress;
      return {
        x: from.position.x + (to.position.x - from.position.x) * t,
        y: from.position.y + (to.position.y - from.position.y) * t,
      };
    }
  }

  // Чуть смещаем кота, чтобы он не был в центре комнаты
  return { x: room.position.x + 18, y: room.position.y + 18 };
}

export function useGameSync(engine: GameEngine) {
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => engine.getSnapshot());

  useEffect(() => engine.subscribe(setSnapshot), [engine]);

  // Позиции котов для узлов React Flow
  const catPositions = useMemo(() => {
    const positions: Record<string, Position> = {};
    for (const cat of snapshot.cats) {
      positions[cat.id] = getCatPosition(snapshot, cat);
    }
    return positions;
  }, [snapshot]);

  const nodes = useMemo(() => {
    const roomNodes: Node[] = snapshot.rooms.map((room) => ({
      id: room.id,
      type: 'room',
      position: room.position,
      data: {
        roomId: room.id,
        kind: room.kind,
        name: room.name,
        level: room.level,
        queue: room.queue,
        maxQueue: room.maxQueue,
        speed: room.baseSpeed * Math.pow(1.25, room.level - 1),
        producing: room.producing,
        upgradeCost: Math.round(10 * Math.pow(2, room.level - 1)),
        canUpgrade: snapshot.stats.currency >= Math.round(10 * Math.pow(2, room.level - 1)),
        onUpgrade: (roomId: string) => engine.upgradeNode(roomId),
        onSelect: (_roomId: string) => {},
      } as RoomNodeData,
    }));

    const catNodes: Node[] = snapshot.cats.map((cat) => ({
      id: cat.id,
      type: 'cat',
      position: catPositions[cat.id] ?? { x: 0, y: 0 },
      draggable: false,
      selectable: false,
      data: {
        catId: cat.id,
        name: cat.name,
        role: cat.role,
        emoji: cat.emoji,
        state: cat.state,
        energy: cat.energy,
        assignedRoom: cat.assignedRoom,
        moving: cat.state === 'moving',
      } as CatNodeData,
    }));

    return [...roomNodes, ...catNodes];
  }, [snapshot, catPositions, engine]);

  const edges = useMemo(() => {
    return snapshot.edges.map((edge) => ({
      id: edge.id,
      source: edge.from,
      target: edge.to,
      type: 'resource',
      data: {
        resources: snapshot.resources.filter(
          (r) => r.from === edge.from && r.to === edge.to,
        ),
      } as ResourceEdgeData,
    }));
  }, [snapshot]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      for (const change of changes) {
        if (change.type === 'position' && change.position && change.dragging) {
          engine.moveRoom(change.id, change.position);
        }
        if (change.type === 'remove') {
          engine.removeRoom(change.id);
        }
      }
    },
    [engine],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      for (const change of changes) {
        if (change.type === 'remove') {
          engine.removeEdge(change.id);
        }
      }
    },
    [engine],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        engine.connectRooms(connection.source, connection.target);
      }
    },
    [engine],
  );

  return { nodes, edges, snapshot, onNodesChange, onEdgesChange, onConnect };
}