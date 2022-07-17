import { CarRenderer, RoadRenderer, SensorRenderer } from '../render';
import { CarControls } from '../controls';
import { CarEntity, RoadEntity, SensorEntity } from '../entities';

export class Environment {
  private carCanvas: HTMLCanvasElement = document.getElementById('car-canvas') as HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private carRenderer: CarRenderer;
  private carControls: CarControls = new CarControls();
  private carEntity: CarEntity;

  private roadEntity: RoadEntity;
  private roadRenderer: RoadRenderer;

  private sensorEntity: SensorEntity;
  private sensorRenderer: SensorRenderer;

  private updateInterval: number | null = null;
  constructor() {
    this.ctx = this.carCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.roadEntity = new RoadEntity(3, this.carCanvas.width/2, 0, this.carCanvas.width * 0.9, this.carCanvas.height);
    this.roadRenderer = new RoadRenderer(this.ctx, this.roadEntity);

    this.carEntity = new CarEntity(this.roadEntity, this.roadEntity.getLaneCenter(Math.floor(this.roadEntity.laneCount / 2)), 100, 30, 50);
    this.carRenderer = new CarRenderer(this.ctx, this.carEntity);

    this.sensorEntity = new SensorEntity(this.carEntity, this.roadEntity);
    this.sensorRenderer = new SensorRenderer(this.ctx, this.sensorEntity)
  }

  start = () => {
    this.carControls.listen();
    this.updateInterval = setInterval(() => {
      this.update();
    }, 1000 / 40);
    this.animate();
  };

  stop = () => {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.carControls.close();
  };

  update = () => {
    this.carEntity.update(this.carControls);
    this.roadEntity.update(this.carControls);
    this.sensorEntity.update(this.carControls);
  };

  animate = () => {
    this.carCanvas.height = window.innerHeight;

    this.ctx.save();
    this.ctx.translate(0, -this.carEntity.y + this.carCanvas.height * 0.7);

    this.roadRenderer.render();
    this.carRenderer.render();
    this.sensorRenderer.render();

    this.ctx.restore();

    requestAnimationFrame(this.animate);
  };
}
