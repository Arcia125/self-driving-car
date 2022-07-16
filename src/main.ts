import './styles/styles.css';
import { CarRenderer } from './render';
import { CarControls } from './controls';
import { CarEntity } from './entities';



class Environment {
  private carCanvas: HTMLCanvasElement = document.getElementById('car-canvas') as HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private carRenderer: CarRenderer;
  private carControls: CarControls = new CarControls();
  private carEntity: CarEntity;
  constructor() {
    this.ctx = this.carCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.carEntity = new CarEntity(100, 100, 30, 50);
    this.carRenderer = new CarRenderer(this.ctx, this.carEntity);
  }

  start = () => {
    this.carControls.listen();
    this.animate();
  }

  stop = () => {
    this.carControls.close();
  }

  update = () => {
    this.carEntity.update(this.carControls);
  }

  animate = () => {
    this.update();
    this.carCanvas.height = window.innerHeight;
    this.carRenderer.render();
    requestAnimationFrame(this.animate);
  }
}

const env = new Environment();

env.start();
