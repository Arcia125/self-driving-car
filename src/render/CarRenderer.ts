import { CarEntity } from '../entities';

export class CarRenderer {
  constructor(
    private carEntity: CarEntity,
    private ctx: CanvasRenderingContext2D,
    private color: string,
  ) {}

  public render = () => {
    const { ctx, carEntity } = this;
    ctx.beginPath();
    ctx.fillStyle = carEntity.damaged ? '#B00B00' : this.color;
    const polygon = carEntity.polygon;
    ctx.moveTo(polygon[0].x, polygon[0].y);
    for (let i = 1; i < polygon.length; i++) {
      ctx.lineTo(polygon[i].x, polygon[i].y);
    }
    ctx.fill();
  }
}
