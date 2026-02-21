import type { TubeState } from "@/lib/colors";

export interface SolverMove {
  from: number;
  to: number;
}

export interface SolverResult {
  solved: boolean;
  moves: SolverMove[];
  states: TubeState[][];
}

function serializeTubes(tubes: TubeState[]): string {
  return tubes.map((t) => t.map((s) => s ?? "_").join(",")).join("|");
}

function cloneTubes(tubes: TubeState[]): TubeState[] {
  return tubes.map((t) => [...t]);
}

function findTopIndex(tube: TubeState): number {
  for (let i = tube.length - 1; i >= 0; i--) {
    if (tube[i] !== null) return i;
  }
  return -1;
}

function isTubeSolved(tube: TubeState): boolean {
  const colors = tube.filter((s) => s !== null);
  if (colors.length === 0) return true;
  if (colors.length !== tube.length) return false;
  return colors.every((c) => c === colors[0]);
}

function isGoal(tubes: TubeState[]): boolean {
  return tubes.every(isTubeSolved);
}

function pourWater(
  tubes: TubeState[],
  from: number,
  to: number,
): TubeState[] | null {
  const source = tubes[from];
  const target = tubes[to];

  const fromTop = findTopIndex(source);
  if (fromTop === -1) return null;

  const color = source[fromTop];

  let count = 0;
  for (let i = fromTop; i >= 0; i--) {
    if (source[i] === color) count++;
    else break;
  }

  const emptySlots = target.filter((s) => s === null).length;
  if (emptySlots === 0) return null;

  const toTop = findTopIndex(target);
  if (toTop !== -1 && target[toTop] !== color) return null;

  if (isTubeSolved(source)) return null;

  const sourceColors = source.filter((s) => s !== null).length;
  if (toTop === -1 && sourceColors === count) return null;

  const toPour = Math.min(count, emptySlots);

  const result = cloneTubes(tubes);

  let removed = 0;
  for (let i = fromTop; i >= 0 && removed < toPour; i--) {
    if (result[from][i] === color) {
      result[from][i] = null;
      removed++;
    } else break;
  }

  let added = 0;
  for (let i = 0; i < result[to].length && added < toPour; i++) {
    if (result[to][i] === null) {
      result[to][i] = color;
      added++;
    }
  }

  return result;
}

export function solve(initialTubes: TubeState[]): SolverResult {
  if (isGoal(initialTubes)) {
    return { solved: true, moves: [], states: [cloneTubes(initialTubes)] };
  }

  const visited = new Set<string>();
  visited.add(serializeTubes(initialTubes));

  interface QueueItem {
    tubes: TubeState[];
    moves: SolverMove[];
    states: TubeState[][];
  }

  const queue: QueueItem[] = [
    {
      tubes: cloneTubes(initialTubes),
      moves: [],
      states: [cloneTubes(initialTubes)],
    },
  ];

  const n = initialTubes.length;
  let iterations = 0;
  const MAX_ITERATIONS = 500_000;

  while (queue.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    const current = queue.shift()!;

    for (let from = 0; from < n; from++) {
      for (let to = 0; to < n; to++) {
        if (from === to) continue;

        const next = pourWater(current.tubes, from, to);
        if (!next) continue;

        const key = serializeTubes(next);
        if (visited.has(key)) continue;

        visited.add(key);

        const newMoves = [...current.moves, { from, to }];
        const newStates = [...current.states, cloneTubes(next)];

        if (isGoal(next)) {
          return { solved: true, moves: newMoves, states: newStates };
        }

        queue.push({ tubes: next, moves: newMoves, states: newStates });
      }
    }
  }

  return { solved: false, moves: [], states: [cloneTubes(initialTubes)] };
}
