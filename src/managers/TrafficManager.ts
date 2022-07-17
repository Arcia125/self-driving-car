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
          maxSpeed: 7,
          friction: 0.05,
          turnRate: 0.03,
        },
        roadEntity.getLaneCenter(1),
        -100,
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
