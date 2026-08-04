import type { Position, Room, RoomEdge, RoomId, RoomKind } from './types';

export class GraphModel {
  rooms: Room[] = [];
  edges: RoomEdge[] = [];

  addRoom(kind: RoomKind, name: string, position: Position, baseSpeed: number, producing: boolean, maxQueue: number): Room {
    const room: Room = {
      id: `room-${kind}-${this.rooms.length}-${Math.random().toString(36).slice(2, 7)}`,
      kind,
      name,
      position,
      level: 1,
      baseSpeed,
      queue: 0,
      maxQueue,
      producing,
    };
    this.rooms.push(room);
    return room;
  }

  getRoom(id: RoomId): Room | undefined {
    return this.rooms.find((r) => r.id === id);
  }

  removeRoom(id: RoomId): void {
    this.rooms = this.rooms.filter((r) => r.id !== id);
    this.edges = this.edges.filter((e) => e.from !== id && e.to !== id);
  }

  addEdge(from: RoomId, to: RoomId): RoomEdge | null {
    if (from === to) return null;
    const exists = this.edges.some((e) => e.from === from && e.to === to);
    if (exists) return null;
    const edge: RoomEdge = {
      id: `edge-${from}-${to}`,
      from,
      to,
    };
    this.edges.push(edge);
    return edge;
  }

  removeEdge(id: string): void {
    this.edges = this.edges.filter((e) => e.id !== id);
  }

  /** Соседи комнаты: куда можно пойти по рёбрам (в обе стороны) */
  neighbors(roomId: RoomId): RoomId[] {
    const result: RoomId[] = [];
    for (const e of this.edges) {
      if (e.from === roomId) result.push(e.to);
      if (e.to === roomId) result.push(e.from);
    }
    return result;
  }

  moveRoom(id: RoomId, position: Position): void {
    const room = this.getRoom(id);
    if (room) room.position = position;
  }

  /** Находит ребро между двумя комнатами (если есть) */
  edgeBetween(a: RoomId, b: RoomId): RoomEdge | undefined {
    return this.edges.find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
  }
}