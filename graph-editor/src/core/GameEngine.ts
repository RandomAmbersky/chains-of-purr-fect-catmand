import { GraphModel } from './GraphModel';
import { createInitialBase } from './initialBase';
import { findPath } from './pathfinding';
import { roleMultiplier, roomSpeed, upgradeCost } from './production';
import type { Cat, CatId, GameSnapshot, Position, ResourceInTransit, ResourceKind, Room, RoomId, RoomKind } from './types';

const CAT_MOVE_SPEED = 60; // пикселей в секунду (для UI интерполяции — храним путь и прогресс)
const CAT_ENERGY_DRAIN = 4; // единиц энергии в секунду работы
const CAT_ENERGY_RESTORE = 12; // единиц энергии в секунду отдыха
const CAT_REST_THRESHOLD = 25; // при энергии ниже — уходит отдыхать

export class GameEngine {
  private graph = new GraphModel();
  private cats: Cat[] = [];
  private resources: ResourceInTransit[] = [];
  private stats = { prototypes: 0, currency: 0, failed: false };
  private listeners: ((snapshot: GameSnapshot) => void)[] = [];
  private resourceIdCounter = 0;
  private time = 0;

  constructor() {
    this.loadInitialBase();
  }

  private loadInitialBase(): void {
    const base = createInitialBase();
    this.graph.rooms = base.rooms.map((r) => ({ ...r }));
    this.graph.edges = base.edges.map((e) => ({ ...e }));
    this.cats = base.cats.map((c) => ({ ...c }));
    this.resources = [];
    this.stats = { prototypes: 0, currency: 0, failed: false };
    this.time = 0;
  }

  getSnapshot(): GameSnapshot {
    return {
      rooms: this.graph.rooms.map((r) => ({ ...r })),
      edges: this.graph.edges.map((e) => ({ ...e })),
      cats: this.cats.map((c) => ({ ...c })),
      resources: this.resources.map((r) => ({ ...r })),
      stats: { ...this.stats },
    };
  }

  subscribe(listener: (snapshot: GameSnapshot) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    for (const l of this.listeners) l(snapshot);
  }

  /** Назначить кота работать в комнате */
  assignCat(catId: CatId, roomId: RoomId): void {
    const cat = this.cats.find((c) => c.id === catId);
    const target = this.graph.getRoom(roomId);
    if (!cat || !target || target.kind === 'rest') return;
    cat.assignedRoom = roomId;
    this.startMoving(cat, roomId);
  }

  /** Отменить назначение кота (или он сам уходит в отдых) */
  unassignCat(catId: CatId): void {
    const cat = this.cats.find((c) => c.id === catId);
    if (!cat) return;
    cat.assignedRoom = null;
    cat.targetRoom = null;
    cat.state = 'idle';
    cat.path = [cat.room];
    cat.progress = 0;
  }

  /** Апгрейд комнаты за валюту */
  upgradeNode(roomId: RoomId): boolean {
    const room = this.graph.getRoom(roomId);
    if (!room || room.kind === 'rest') return false;
    const cost = upgradeCost(room.level);
    if (this.stats.currency < cost) return false;
    this.stats.currency -= cost;
    room.level += 1;
    this.notify();
    return true;
  }

  /** Добавить новую комнату (редактор) */
  addRoom(kind: RoomKind, position: Position): void {
    const base = createInitialBase();
    const conf = base.rooms.find((r) => r.kind === kind);
    this.graph.addRoom(
      kind,
      conf ? conf.name : kind,
      position,
      conf ? conf.baseSpeed : 0.2,
      kind === 'garage',
      kind === 'garage' ? 8 : 8,
    );
    this.notify();
  }

  /** Соединить комнаты ребром (редактор) */
  connectRooms(from: RoomId, to: RoomId): void {
    this.graph.addEdge(from, to);
    this.notify();
  }

  /** Удалить ребро (редактор) */
  removeEdge(edgeId: string): void {
    this.graph.removeEdge(edgeId);
    this.notify();
  }

  /** Удалить комнату (редактор) */
  removeRoom(roomId: RoomId): void {
    this.graph.removeRoom(roomId);
    // Убираем котов из удалённой комнаты
    for (const cat of this.cats) {
      if (cat.room === roomId || cat.assignedRoom === roomId) {
        this.unassignCat(cat.id);
        const rest = this.graph.rooms.find((r) => r.kind === 'rest');
        if (rest) {
          cat.room = rest.id;
          cat.path = [rest.id];
        }
      }
    }
    this.resources = this.resources.filter((r) => r.from !== roomId && r.to !== roomId);
    this.notify();
  }

  /** Обновить позицию комнаты (перетаскивание) */
  moveRoom(roomId: RoomId, position: Position): void {
    this.graph.moveRoom(roomId, position);
  }

  /** Сбросить игру */
  reset(): void {
    this.loadInitialBase();
    this.notify();
  }

  private startMoving(cat: Cat, target: RoomId): void {
    const path = findPath(this.graph, cat.room, target);
    if (!path || path.length < 2) return;
    cat.state = 'moving';
    cat.targetRoom = target;
    cat.path = path;
    cat.progress = 0;
  }

  private updateCatMovement(cat: Cat, dt: number): void {
    if (cat.state !== 'moving' || cat.path.length < 2) return;

    const from = this.graph.getRoom(cat.path[0]);
    const to = this.graph.getRoom(cat.path[1]);
    if (!from || !to) return;

    const dx = to.position.x - from.position.x;
    const dy = to.position.y - from.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= 0) {
      cat.path.shift();
      cat.progress = 0;
      return;
    }

    const speed = CAT_MOVE_SPEED; // пикселей в секунду
    cat.progress += (speed * dt) / dist;
    if (cat.progress >= 1) {
      cat.progress = 0;
      cat.room = to.id;
      cat.path.shift();
      if (cat.path.length < 2) {
        // Дошли до цели
        cat.targetRoom = null;
        cat.path = [cat.room];
        const arrived = this.graph.getRoom(cat.room);
        if (arrived && arrived.kind === 'rest') {
          cat.state = 'resting';
        } else {
          cat.state = 'working';
        }
      }
    }
  }

  private updateCatWork(cat: Cat, dt: number): void {
    if (cat.state !== 'working') return;
    const room = this.graph.getRoom(cat.room);
    if (!room || room.kind === 'rest') {
      cat.state = 'idle';
      return;
    }

    // Работаем: тратим энергию
    cat.energy -= CAT_ENERGY_DRAIN * dt;
    if (cat.energy <= CAT_REST_THRESHOLD) {
      // Устал — идём отдыхать
      const rest = this.graph.rooms.find((r) => r.kind === 'rest');
      if (rest && rest.id !== cat.room) {
        cat.state = 'moving';
        cat.path = findPath(this.graph, cat.room, rest.id) ?? [cat.room];
        cat.progress = 0;
      } else {
        cat.state = 'idle';
      }
      return;
    }
  }

  private updateCatRest(cat: Cat, dt: number): void {
    if (cat.state !== 'resting') return;
    const room = this.graph.getRoom(cat.room);
    if (!room || room.kind !== 'rest') return;
    cat.energy = Math.min(100, cat.energy + CAT_ENERGY_RESTORE * dt);
    if (cat.energy >= 70 && cat.assignedRoom) {
      // Отдохнул — возвращаемся к работе
      this.startMoving(cat, cat.assignedRoom);
    }
  }

  private updateResources(dt: number): void {
    for (const res of this.resources) {
      res.t += dt / res.duration;
      if (res.t >= 1) {
        // Ресурс прибыл
        const room = this.graph.getRoom(res.to);
        if (room) {
          room.queue += 1;
          if (room.queue > room.maxQueue) {
            this.stats.failed = true;
          }
        }
      }
    }
    this.resources = this.resources.filter((r) => r.t < 1);
  }

  private updateProduction(dt: number): void {
    for (const room of this.graph.rooms) {
      if (room.kind === 'rest') continue;
      // Кот на узле?
      const cat = this.cats.find((c) => c.room === room.id && c.state === 'working');
      const neighbors = this.graph.neighbors(room.id);
      const speed = roomSpeed(room) * (cat ? roleMultiplier(cat.role, room.kind) : 0);

      if (room.producing) {
        // Гараж производит контейнеры
        const produced = speed * dt;
        if (produced > 0 && neighbors.length > 0) {
          this.resources.push({
            id: `r-${this.resourceIdCounter++}`,
            kind: 'container',
            from: room.id,
            to: this.pickResourceTarget(room, neighbors),
            t: 0,
            duration: 2,
          });
        }
      } else {
        // Обработка очереди
        const processed = Math.min(room.queue, speed * dt);
        if (processed > 0) {
          room.queue -= processed;
          this.stats.currency += processed * 0.5;
          const kind: ResourceKind =
            room.kind === 'lab' ? 'data' : room.kind === 'production' ? 'prototype' : 'container';
          if (kind === 'prototype') {
            this.stats.prototypes += processed;
          }
          if (neighbors.length > 0) {
            this.resources.push({
              id: `r-${this.resourceIdCounter++}`,
              kind,
              from: room.id,
              to: this.pickResourceTarget(room, neighbors),
              t: 0,
              duration: 2,
            });
          }
        }
      }
    }
  }

  private pickResourceTarget(_room: Room, neighbors: RoomId[]): RoomId {
    // Просто берём соседа, который не является комнатой отдыха, иначе любой
    const nonRest = neighbors.filter((n) => this.graph.getRoom(n)?.kind !== 'rest');
    const candidates = nonRest.length > 0 ? nonRest : neighbors;
    return candidates[0];
  }

  /** Главный шаг симуляции */
  step(dt: number): void {
    if (this.stats.failed || this.stats.prototypes >= 3) return;
    this.time += dt;

    // Коты: движение, работа, отдых
    for (const cat of this.cats) {
      this.updateCatMovement(cat, dt);
    }
    for (const cat of this.cats) {
      if (cat.state === 'working') this.updateCatWork(cat, dt);
    }
    for (const cat of this.cats) {
      if (cat.state === 'resting') this.updateCatRest(cat, dt);
    }

    // Производство и ресурсы
    this.updateProduction(dt);
    this.updateResources(dt);

    this.notify();
  }
}