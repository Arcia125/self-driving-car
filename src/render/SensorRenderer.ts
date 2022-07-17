import { SensorEntity } from '../entities';

export class SensorRenderer {
  constructor(private ctx: CanvasRenderingContext2D, private sensorEntity: SensorEntity) {}

  render() {
    const { ctx, sensorEntity: { rays, readings } } = this;

    for (let i = 0; i < rays.length; i++) {
      let [_, end] = rays[i];

      const reading = readings[i];
      if (reading) {
        end = reading;
      }
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#D1CA15';
      ctx.moveTo(rays[i][0].x, rays[i][0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'black';
      ctx.moveTo(rays[i][1].x, rays[i][1].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }
  }
}
