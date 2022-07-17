import { CarControls } from '../controls';
import { Coordinates } from '../interfaces';
import { polysIntersect } from '../utils';
import { Entity } from './Entity';
import { RoadEntity } from './RoadEntity';

type CarPolygon = [Coordinates, Coordinates, Coordinates, Coordinates];

export class CarEntity extends Entity {
  private speed: number = 0;
  private acceleration: number = 0.35;
  private maxSpeed: number = 10;
  private friction: number = 0.05;
  private turnRate: number = 0.03;
  public polygon: CarPolygon;
  public damaged: boolean = false;

  constructor(private roadEntity: RoadEntity, ...params: ConstructorParameters<typeof Entity>) {
    super(...params);
    this.polygon = this.#getPolygon();
  }

  #getPolygon =  () => {
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);

    return [
      {
        x: this.x - Math.sin(this.angle - alpha) * rad,
        y: this.y - Math.cos(this.angle - alpha) * rad
      },
      {
        x: this.x - Math.sin(this.angle + alpha) * rad,
        y: this.y - Math.cos(this.angle + alpha) * rad
      },
      {
        x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
        y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
      },
      {
        x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
        y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
      }
    ] as CarPolygon;
  }

  #assessDamage = () => {
    if (this.damaged) return true;
    for (let i = 0; i < this.roadEntity.borders.length; i++) {
      if (polysIntersect(this.polygon, this.roadEntity.borders[i])) {
        return true
      }
    }
    return false;
  }

  #move = (controls: CarControls) => {
    // Go forward
    if (controls.forward) {
      this.speed += this.acceleration;
    }

    // Go Backwards
    if (controls.reverse) {
      this.speed -= this.acceleration;
    }

    // Speed limit
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }

    // Reverse speed limit
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }


    // Slowdown from friction
    if (this.speed > 0) {
      this.speed -= this.friction;
    }

    // Slowdown from friction in reverse
    if (this.speed < 0) {
      this.speed += this.friction;
    }


    // Turning
    if (this.speed != 0) {
      // 1 if the car is going forward or -1 if backward
      const flip = this.speed > 0 ? 1 : -1;

      if (controls.left) {
        this.angle += this.turnRate * flip;
      }
      if (controls.right) {
        this.angle -= this.turnRate * flip;
      }
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  update = (controls: CarControls) => {
    if (!this.damaged) this.#move(controls)
    this.polygon = this.#getPolygon();
    this.damaged = this.#assessDamage();
  };
}
