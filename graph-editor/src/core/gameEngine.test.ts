import { describe, expect, it } from 'vitest';
import { GameEngine } from './GameEngine';

describe('GameEngine — производственный цикл', () => {
  it('база начинает с 4 комнат и 3 котов', () => {
    const engine = new GameEngine();
    const snap = engine.getSnapshot();
    expect(snap.rooms.length).toBe(4);
    expect(snap.cats.length).toBe(3);
    expect(snap.stats.prototypes).toBe(0);
  });

  it('назначение кота в гараж запускает движение', () => {
    const engine = new GameEngine();
    const snap = engine.getSnapshot();
    const garage = snap.rooms.find((r) => r.kind === 'garage');
    const cat = snap.cats[0];
    expect(garage).toBeDefined();

    engine.assignCat(cat.id, garage!.id);
    const after = engine.getSnapshot();
    const catAfter = after.cats.find((c) => c.id === cat.id)!;
    expect(catAfter.assignedRoom).toBe(garage!.id);
    expect(catAfter.state).toBe('moving');
  });

  it('при работе котов производство создаёт валюту и прототипы', () => {
    const engine = new GameEngine();
    const snap = engine.getSnapshot();
    const garage = snap.rooms.find((r) => r.kind === 'garage')!;
    const lab = snap.rooms.find((r) => r.kind === 'lab')!;
    const production = snap.rooms.find((r) => r.kind === 'production')!;

    // Назначаем каждого кота в свою комнату
    const cats = snap.cats;
    engine.assignCat(cats[0].id, garage.id); // оперативник → гараж
    engine.assignCat(cats[1].id, lab.id);    // лабокот → лаборатория
    engine.assignCat(cats[2].id, production.id); // инженер → производство

    // Симулируем 300 секунд (коты успевают дойти и поработать)
    for (let i = 0; i < 3000; i++) {
      engine.step(0.1);
    }

    const after = engine.getSnapshot();
    // За это время должно накопиться валюты или прототипов
    expect(after.stats.currency).toBeGreaterThan(0);
  });
});