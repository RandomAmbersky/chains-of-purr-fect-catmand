export type RoomId = string;
export type CatId = string;
export type ResourceKind = 'container' | 'data' | 'prototype';

export type RoomKind = 'garage' | 'lab' | 'production' | 'rest' | 'storage';

export type Position = { x: number; y: number };

export interface RoomEdge {
  id: string;
  from: RoomId;
  to: RoomId;
}

export interface Room {
  id: RoomId;
  kind: RoomKind;
  name: string;
  position: Position;
  level: number;
  /** Скорость обработки на уровне 1 (единиц/сек) */
  baseSpeed: number;
  /** Текущая очередь входящих ресурсов */
  queue: number;
  /** Максимальный размер очереди — при переполнении «поражение» в гараже */
  maxQueue: number;
  /** Уникальность: гараж «рождает» контейнеры по своей скорости */
  producing: boolean;
}

export type CatRole = 'operative' | 'labcat' | 'engineer';

export type CatState = 'idle' | 'moving' | 'working' | 'resting';

export interface Cat {
  id: CatId;
  name: string;
  role: CatRole;
  emoji: string;
  state: CatState;
  /** Куда идёт (идёт работать) */
  targetRoom: RoomId | null;
  /** Путь из комнат, по которым идёт (BFS). Первый элемент — текущая комната */
  path: RoomId[];
  /** Прогресс движения по текущему ребру пути [0..1] */
  progress: number;
  /** Где отдыхает/находится сейчас */
  room: RoomId;
  /** Энергия 0..100 */
  energy: number;
  /** Назначенный рабочий слот (комната, где работает) */
  assignedRoom: RoomId | null;
  /** Накопленная работа за текущую операцию (0..1) */
  workProgress: number;
  /** Множитель скорости работы в зависимости от роли и комнаты */
  roleMultiplier: number;
}

export interface ResourceInTransit {
  id: string;
  kind: ResourceKind;
  from: RoomId;
  to: RoomId;
  /** Прогресс движения по ребру [0..1] */
  t: number;
  /** Длительность перехода в секундах */
  duration: number;
}

export interface GameStats {
  prototypes: number;
  currency: number;
  /** true, если гараж переполнен */
  failed: boolean;
}

export interface GameSnapshot {
  rooms: Room[];
  edges: RoomEdge[];
  cats: Cat[];
  resources: ResourceInTransit[];
  stats: GameStats;
}

export interface GameEvents {
  onChange: (snapshot: GameSnapshot) => void;
}

export const ROOM_KIND_LABELS: Record<RoomKind, string> = {
  garage: 'Гараж',
  lab: 'Лаборатория',
  production: 'Производство',
  rest: 'Комната отдыха',
  storage: 'Склад',
};

export const CAT_ROLE_LABELS: Record<CatRole, string> = {
  operative: 'Оперативник',
  labcat: 'Лабокот',
  engineer: 'Инженер',
};

export const ROOM_SPEEDS: Record<RoomKind, number> = {
  garage: 0.4,
  lab: 0.3,
  production: 0.15,
  rest: 0,
  storage: 0,
};
