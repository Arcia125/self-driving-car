import { CarControls } from '../controls';
import { Coordinates } from '../interfaces';
import { TrafficManager } from '../managers';
import { polysIntersect } from '../utils';
import { Entity } from './Entity';
import { RoadEntity } from './RoadEntity';

type CarPolygon = [Coordinates, Coordinates, Coordinates, Coordinates];

export type CarEntitySettings = {
  acceleration: number,
  maxSpeed: number,
  friction: number,
  turnRate: number
}

export class CarEntity extends Entity {
  public speed: number = 0;
  public polygon: CarPolygon;
  public damaged: boolean = false;

  constructor(
    private roadEntity: RoadEntity,
    public settings: CarEntitySettings,
    ...params: ConstructorParameters<typeof Entity>
  ) {
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

  #assessDamage = (traffic?: TrafficManager[]) => {
    if (this.damaged) return true;
    for (let i = 0; i < this.roadEntity.borders.length; i++) {
      // if (polysIntersect(this.polygon, this.roadEntity.borders[i])) {
      if (this.collides(this.roadEntity.borders[i])) {
        return true
      }
    }
    if (traffic) {
      for (let i = 0; i < traffic.length; i++) {
        // if (polysIntersect(this.polygon, traffic[i].carManager.carEntity.polygon)) {
        if (this.collides(traffic[i].polygon)) {
          return true;
        }
      }
    }
    return false;
  }

  #move = (controls: CarControls) => {
    // Go forward
    if (controls.forward) {
      this.speed += this.settings.acceleration;
    }

    // Go Backwards
    if (controls.reverse) {
      this.speed -= this.settings.acceleration;
    }

    // Speed limit
    if (this.speed > this.settings.maxSpeed) {
      this.speed = this.settings.maxSpeed;
    }

    // Reverse speed limit
    if (this.speed < -this.settings.maxSpeed / 2) {
      this.speed = -this.settings.maxSpeed / 2;
    }


    // Slowdown from friction
    if (this.speed > 0) {
      this.speed -= this.settings.friction;
    }

    // Slowdown from friction in reverse
    if (this.speed < 0) {
      this.speed += this.settings.friction;
    }


    // Turning
    if (this.speed != 0) {
      // 1 if the car is going forward or -1 if backward
      const flip = this.speed > 0 ? 1 : -1;

      if (controls.left) {
        this.angle += this.settings.turnRate * flip;
      }
      if (controls.right) {
        this.angle -= this.settings.turnRate * flip;
      }
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  update = (controls: CarControls, traffic?: TrafficManager[]) => {
    if (!this.damaged) this.#move(controls)
    this.polygon = this.#getPolygon();
    this.damaged = this.#assessDamage(traffic);
  };

  collides = (polygon: Coordinates[]) => {
    return polysIntersect(this.polygon, polygon)
  }
}
