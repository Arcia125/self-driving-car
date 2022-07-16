import { CarControls } from '../controls';
import { Entity } from './Entity';

export class RoadEntity extends Entity {
  public left: number;
  public right: number;
  public top: number = -1000000;
  public bottom: number = 1000000;

  public borders: { x: number, y: number }[][];

  constructor(public laneCount: number = 3, ...params: ConstructorParameters<typeof Entity>) {
    super(...params);
    this.left = this.x - this.width / 2;
    this.right = this.x + this.width / 2;

    const topLeft = { x: this.left, y: this.top };
    const topRight = { x: this.right, y: this.top };
    const bottomLeft = { x: this.left, y: this.bottom };
    const bottomRight = { x: this.right, y: this.bottom };

    this.borders = [
      [topLeft, bottomLeft],
      [topRight, bottomRight]
    ]
  }

  update = (controls: CarControls) => {

  };

  getLaneCenter = (laneIndex: number) => {
    const laneWidth = this.width / this.laneCount;
    return this.left + laneWidth / 2 + laneIndex * laneWidth;
  }
}
