import { SensorEntity } from '../entities';

export class SensorRenderer {
  constructor(private ctx: CanvasRenderingContext2D, private sensorEntity: SensorEntity) {}

  render() {
    const { ctx, sensorEntity: { rays } } = this;

    for (let i = 0; i < rays.length; i++) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'yellow';
      ctx.moveTo(rays[i][0].x, rays[i][0].y);
      ctx.lineTo(rays[i][1].x, rays[i][1].y);
      ctx.stroke();
    }
  }
}
