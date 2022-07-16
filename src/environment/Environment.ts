import { CarRenderer, RoadRenderer } from '../render';
import { CarControls } from '../controls';
import { CarEntity, RoadEntity } from '../entities';

export class Environment {
  private carCanvas: HTMLCanvasElement = document.getElementById('car-canvas') as HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private carRenderer: CarRenderer;
  private carControls: CarControls = new CarControls();
  private carEntity: CarEntity;

  private roadEntity: RoadEntity;
  private roadRenderer: RoadRenderer;

  private updateInterval: number | null = null;
  constructor() {
    this.ctx = this.carCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.roadEntity = new RoadEntity(4, this.carCanvas.width/2, 0, this.carCanvas.width * 0.9, this.carCanvas.height);
    this.roadRenderer = new RoadRenderer(this.ctx, this.roadEntity);

    this.carEntity = new CarEntity(this.roadEntity.getLaneCenter(this.roadEntity.laneCount - 1), 100, 30, 50);
    this.carRenderer = new CarRenderer(this.ctx, this.carEntity);
  }

  start = () => {
    this.carControls.listen();
    this.updateInterval = setInterval(() => {
      this.update();
    }, 1000 / 60);
    this.animate();
  };

  stop = () => {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.carControls.close();
  };

  update = () => {
    this.carEntity.update(this.carControls);
    this.roadEntity.update(this.carControls);
  };

  animate = () => {
    this.carCanvas.height = window.innerHeight;
    this.roadRenderer.render();
    this.carRenderer.render();
    requestAnimationFrame(this.animate);
  };
}
