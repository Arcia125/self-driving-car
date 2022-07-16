import { CarControls } from '../controls';
import { Entity } from './Entity';

export class CarEntity extends Entity {
  private speed: number = 0;
  private acceleration: number = 0.2;
  private maxSpeed: number = 3;
  private friction: number = 0.05;
  private turnRate: number = 0.03;

  #move = (controls: CarControls) => {
    // Go forward
    if (controls.forward) {
      this.speed += this.acceleration;
      console.table({ ...this, ...controls });
    }

    // Go Backwards
    if (controls.reverse) {
      this.speed -= this.acceleration;
      console.table({ ...this, ...controls });
    }

    // Speed limit
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
      console.table({ ...this, ...controls });
    }

    // Reverse speed limit
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
      console.table({ ...this, ...controls });
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
    this.#move(controls)
  };
}
