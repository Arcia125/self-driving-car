import { CarManager } from './CarManager';
import { CarEntitySettings, RoadEntity } from '../entities';
import { Coordinates } from '../interfaces';

export class TrafficManager {
  public carManager: CarManager;
  constructor(
    private ctx: CanvasRenderingContext2D,
    private roadEntity: RoadEntity,
    private carEntitySettings: CarEntitySettings = {
    acceleration: 0.35,
    maxSpeed: Math.random() * 5 + 10,
    friction: 0.05,
    turnRate: 0.03,
  },
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {
    this.carManager = new CarManager({
      carEntity: [
        this.roadEntity,
        carEntitySettings,
        x,
        y,
        width,
        height
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
