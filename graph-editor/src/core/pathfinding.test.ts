import { describe, expect, it } from 'vitest';
import { GraphModel } from './GraphModel';
import { findPath } from './pathfinding';

function buildGraph() {
  const g = new GraphModel();
  const a = g.addRoom('rest', 'A', { x: 0, y: 0 }, 0, false, 10);
  const b = g.addRoom('garage', 'B', { x: 100, y: 0 }, 0.4, true, 10);
  const c = g.addRoom('lab', 'C', { x: 200, y: 0 }, 0.3, false, 10);
  const d = g.addRoom('production', 'D', { x: 300, y: 0 }, 0.15, false, 10);
  g.addEdge(a.id, b.id);
  g.addEdge(b.id, c.id);
  g.addEdge(c.id, d.id);
  return { g, a, b, c, d };
}

describe('findPath (BFS)', () => {
  it('находит прямой путь между соседями', () => {
    const { g, a, b } = buildGraph();
    expect(findPath(g, a.id, b.id)).toEqual([a.id, b.id]);
  });

  it('находит путь через несколько узлов', () => {
    const { g, a, b, c, d } = buildGraph();
    expect(findPath(g, a.id, d.id)).toEqual([a.id, b.id, c.id, d.id]);
  });

  it('возвращает [from] если from === to', () => {
    const { g, a } = buildGraph();
    expect(findPath(g, a.id, a.id)).toEqual([a.id]);
  });

  it('возвращает null если пути нет', () => {
    const { g, a, d } = buildGraph();
    g.edges = [];
    expect(findPath(g, a.id, d.id)).toBeNull();
  });

  it('работает в обе стороны (неориентированный граф)', () => {
    const { g, a, b, c, d } = buildGraph();
    expect(findPath(g, d.id, a.id)).toEqual([d.id, c.id, b.id, a.id]);
  });
});