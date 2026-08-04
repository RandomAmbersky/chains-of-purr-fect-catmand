import type { Cat, Room } from './types';

/**
 * Скорость обработки узла зависит от уровня. Апгрейд: уровень +1 → скорость ×1.25.
 */
export function roomSpeed(room: Room): number {
  return room.baseSpeed * Math.pow(1.25, room.level - 1);
}

/**
 * Множитель работы кота в зависимости от роли и комнаты.
 * Кот работает лучше в своей «родной» комнате.
 */
export function roleMultiplier(role: Cat['role'], kind: Room['kind']): number {
  switch (role) {
    case 'operative':
      return kind === 'garage' ? 1.5 : 1;
    case 'labcat':
      return kind === 'lab' ? 1.5 : 1;
    case 'engineer':
      return kind === 'production' ? 1.5 : 1;
    default:
      return 1;
  }
}

export const UPGRADE_COST_BASE = 10;
export const UPGRADE_COST_MULT = 2;

/** Стоимость апгрейда узла до следующего уровня */
export function upgradeCost(level: number): number {
  return Math.round(UPGRADE_COST_BASE * Math.pow(UPGRADE_COST_MULT, level - 1));
}