import { RoadRenderer } from '../render';
import { RoadEntity } from '../entities';
import { CarManager, TrafficManager } from '../managers';

export class Environment {
  private carCanvas: HTMLCanvasElement = document.getElementById('car-canvas') as HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private carManager: CarManager;

  private roadEntity: RoadEntity;
  private roadRenderer: RoadRenderer;

  private traffic: TrafficManager[];

  private updateInterval: number | null = null;

  constructor() {
    this.ctx = this.carCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.roadEntity = new RoadEntity(3, this.carCanvas.width/2, 0, this.carCanvas.width * 0.9, this.carCanvas.height);
    this.roadRenderer = new RoadRenderer(this.ctx, this.roadEntity);

    this.carManager = new CarManager({
      carEntity: [
        this.roadEntity,
        {
          acceleration: 0.35,
          maxSpeed: 10,
          friction: 0.05,
          turnRate: 0.03
        },
        this.roadEntity.getLaneCenter(Math.floor(this.roadEntity.laneCount / 2)),
        100,
        30,
        50
      ],
      carRenderer: [this.ctx],
      carControls: [],
      sensorEntity: [this.roadEntity],
      sensorRenderer: [this.ctx]
    });

    this.traffic = [
      new TrafficManager(this.ctx, this.roadEntity)
    ];
  }

  start = () => {
    this.carManager.controls.listen();
    this.updateInterval = setInterval(() => {
      this.update();
    }, 1000 / 40);
    this.animate();
  };

  stop = () => {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.carManager.controls.close();
  };

  update = () => {
    this.carManager.update(this.traffic);
    this.roadEntity.update(this.carManager.controls);
    this.traffic.forEach(t => {
      t.update()
    });
  };

  animate = () => {
    this.carCanvas.height = window.innerHeight;

    this.ctx.save();
    this.ctx.translate(0, -this.carManager.carEntity.y + this.carCanvas.height * 0.7);

    this.roadRenderer.render();

    this.carManager.render();

    this.traffic.forEach(t => {
      t.render();
    });

    this.ctx.restore();

    requestAnimationFrame(this.animate);
  };
}
