import { CarEntity } from '../entities';

export class CarRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private carEntity: CarEntity,
  ) {}

  public render = () => {
    const { ctx, carEntity } = this;
    ctx.beginPath();
    ctx.save();
    ctx.translate(carEntity.x, carEntity.y);
    ctx.rotate(-carEntity.angle)
    ctx.rect(
      -carEntity.width / 2,
      -carEntity.height / 2,
      carEntity.width,
      carEntity.height
    );
    ctx.fill();
    ctx.restore();
  }
}
