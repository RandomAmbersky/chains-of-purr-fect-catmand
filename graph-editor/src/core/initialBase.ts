import type { Cat, GameSnapshot, Room, RoomEdge } from './types';

/**
 * Стартовая база по идеям из ideas.md:
 *   Комната отдыха ←→ Гараж ←→ Лаборатория ←→ Производство
 * 3 кота: Оперативник, Лабокот, Инженер
 */
export function createInitialBase(): GameSnapshot {
  const rooms: Room[] = [
    {
      id: 'rest',
      kind: 'rest',
      name: 'Комната отдыха',
      position: { x: 0, y: -220 },
      level: 1,
      baseSpeed: 0,
      queue: 0,
      maxQueue: 999,
      producing: false,
    },
    {
      id: 'garage',
      kind: 'garage',
      name: 'Гараж',
      position: { x: -250, y: 80 },
      level: 1,
      baseSpeed: 0.4,
      queue: 0,
      maxQueue: 8,
      producing: true,
    },
    {
      id: 'lab',
      kind: 'lab',
      name: 'Лаборатория',
      position: { x: 0, y: 80 },
      level: 1,
      baseSpeed: 0.3,
      queue: 0,
      maxQueue: 8,
      producing: false,
    },
    {
      id: 'production',
      kind: 'production',
      name: 'Производство',
      position: { x: 250, y: 80 },
      level: 1,
      baseSpeed: 0.15,
      queue: 0,
      maxQueue: 8,
      producing: false,
    },
  ];

  const edges: RoomEdge[] = [
    { id: 'e1', from: 'rest', to: 'garage' },
    { id: 'e2', from: 'garage', to: 'lab' },
    { id: 'e3', from: 'lab', to: 'production' },
    { id: 'e4', from: 'rest', to: 'lab' },
  ];

  const cats: Cat[] = [
    {
      id: 'cat-oper',
      name: 'Оперативник',
      role: 'operative',
      emoji: '🐱',
      state: 'idle',
      targetRoom: null,
      path: ['rest'],
      progress: 0,
      room: 'rest',
      energy: 100,
      assignedRoom: null,
      workProgress: 0,
      roleMultiplier: 1,
    },
    {
      id: 'cat-lab',
      name: 'Лабокот',
      role: 'labcat',
      emoji: '🐱',
      state: 'idle',
      targetRoom: null,
      path: ['rest'],
      progress: 0,
      room: 'rest',
      energy: 100,
      assignedRoom: null,
      workProgress: 0,
      roleMultiplier: 1,
    },
    {
      id: 'cat-eng',
      name: 'Инженер',
      role: 'engineer',
      emoji: '🐱',
      state: 'idle',
      targetRoom: null,
      path: ['rest'],
      progress: 0,
      room: 'rest',
      energy: 100,
      assignedRoom: null,
      workProgress: 0,
      roleMultiplier: 1,
    },
  ];

  return {
    rooms,
    edges,
    cats,
    resources: [],
    stats: {
      prototypes: 0,
      currency: 0,
      failed: false,
    },
  };
}