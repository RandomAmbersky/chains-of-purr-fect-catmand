import type { RoomId } from './types';
import type { GraphModel } from './GraphModel';

/**
 * Поиск кратчайшего пути BFS от from до to по рёбрам графа.
 * Возвращает список комнат включая начальную и конечную:
 * [from, ..., to]. Если пути нет — null.
 */
export function findPath(graph: GraphModel, from: RoomId, to: RoomId): RoomId[] | null {
  if (from === to) return [from];

  const queue: RoomId[] = [from];
  const visited = new Set<RoomId>([from]);
  const prev = new Map<RoomId, RoomId | null>();
  prev.set(from, null);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of graph.neighbors(current)) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        prev.set(neighbor, current);
        if (neighbor === to) {
          // Восстанавливаем путь
          const path: RoomId[] = [];
          let node: RoomId | null = to;
          while (node !== null) {
            path.unshift(node);
            node = prev.get(node) ?? null;
          }
          return path;
        }
        queue.push(neighbor);
      }
    }
  }

  return null;
}