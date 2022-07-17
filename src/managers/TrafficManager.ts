import { CarManager } from './CarManager';
import { RoadEntity } from '../entities';

export class TrafficManager {
  public carManager: CarManager;
  constructor(private ctx: CanvasRenderingContext2D, private roadEntity: RoadEntity) {
    this.carManager = new CarManager({
      carEntity: [
        this.roadEntity,
        {
          acceleration: 0.35,
          maxSpeed: Math.random() * 5 + 10,
          friction: 0.05,
          turnRate: 0.03,
        },
        roadEntity.getLaneCenter(Math.floor(Math.random() * roadEntity.laneCount)),
        Math.random() * -20000,
        30,
        50
      ],
      carRenderer: [this.ctx, '#20D1AC'],
      carControls: [true],
    });

  }

  public render = () => {
    this.carManager.render();
  };

  public update = () => {
    this.carManager.update();
  };

  public get polygon() {
    return this.carManager.polygon;
  };
}
