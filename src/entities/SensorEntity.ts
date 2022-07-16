import { CarControls } from '../controls';
import { Entity } from './Entity';
import { CarEntity } from './CarEntity';
import { lerp } from '../utils';

export class SensorEntity extends Entity {
  constructor(
    public carEntity: CarEntity,
    public rayCount: number = 3,
    public rayLength: number = 100,
    public raySpread: number = Math.PI / 4,
    public rays: { x: number, y: number }[][] = []
  ) {
    super(0, 0, 0, 0, 0, carEntity);
  }

  update = (controls: CarControls) => {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle = lerp(
        this.raySpread / 2,
        -this.raySpread / 2,
        i / (this.rayCount - 1)
      ) + this.carEntity.angle;

      const start = {
        x: this.carEntity.x,
        y: this.carEntity.y
      };
      const end = {
        x: this.carEntity.x - Math.sin(rayAngle) * this.rayLength,
        y: this.carEntity.y - Math.cos(rayAngle) * this.rayLength
      }

      this.rays.push([start, end])
    }
  };

}
