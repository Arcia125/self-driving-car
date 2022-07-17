import { Coordinates } from '../interfaces';
import { getIntersection } from './getIntersection';

export const polysIntersect = (polyA: Coordinates[], polyB: Coordinates[]) => {
  for (let i = 0; i < polyA.length; i++) {
    for (let j = 0; j < polyB.length; j++) {
      const touch = getIntersection(
        polyA[i],
        polyA[(i + 1) % polyA.length],
        polyB[j],
        polyB[(j + 1) % polyB.length]
      );

      if (touch) {
        return true
      }
    }
  }

  return false
};
