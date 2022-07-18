import { Entity } from './Entity';
import { CarEntity } from './CarEntity';
import { RoadEntity } from './RoadEntity';
import { CarControls } from '../controls';
import { getIntersection, lerp } from '../utils';
import { Ray, Touch } from '../interfaces';
import { TrafficManager } from '../managers';

export class SensorEntity extends Entity {
  public readings: (Touch | null | undefined)[] = [];
  constructor(
    public carEntity: CarEntity,
    public roadEntity: RoadEntity,
    public rayCount: number = 5,
    public rayLength: number = 400,
    public raySpread: number = Math.PI / 5,
    public rays: Ray[] = []
  ) {
    super(0, 0, 0, 0, 0, carEntity);
  }

  #castRays = () => {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle = lerp(
        this.raySpread / 2,
        -this.raySpread / 2,
        this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
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
  }

  #getReading = (ray: Ray, traffic?: TrafficManager[]) => {
    const { roadEntity } = this;
    let touches: Touch[] = [];
    for (let i = 0; i < roadEntity.borders.length; i++) {
      const touch = getIntersection(
        ray[0],
        ray[1],
        roadEntity.borders[i][0],
        roadEntity.borders[i][1]
      );

      if (touch) {
        touches.push(touch);
      }
    }

    if (traffic) {
      for (let i = 0; i < traffic.length; i++) {
        const polygon = traffic[i].polygon;
        for (let j = 0; j < polygon.length; j++) {
          const touch = getIntersection(
            ray[0],
            ray[1],
            polygon[j],
            polygon[(j + 1) % polygon.length]
          );

          if (touch) {
            touches.push(touch);
          }
        }
      }
    }

    if (touches.length == 0) {
      return null
    } else {
      const offsets = touches.map(e => e.offset);
      const minOffset = Math.min(...offsets);
      return touches.find(e => e.offset == minOffset)
    }
  }

  update = (controls: CarControls, traffic?: TrafficManager[]) => {
    this.#castRays();
    this.readings = [];
    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(
        this.#getReading(this.rays[i], traffic)
      );
    }
  };

}
