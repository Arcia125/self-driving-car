import { RoadEntity } from '../entities';
import { lerp } from '../utils';

export class RoadRenderer {
  constructor(
    private ctx: CanvasRenderingContext2D,
    private roadEntity: RoadEntity,
  ) { }

  public render = () => {
    const { ctx, roadEntity } = this;
    // ctx.beginPath();
    // ctx.save();
    // ctx.translate(roadEntity.x, roadEntity.y);
    // ctx.rotate(-roadEntity.angle)
    // ctx.rect(
    //   -roadEntity.width / 2,
    //   -roadEntity.height / 2,
    //   roadEntity.width,
    //   roadEntity.height
    // );
    // ctx.fill();
    // ctx.restore();
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'white';

    for (let i = 1; i <= roadEntity.laneCount - 1; i++) {
      const x = lerp(roadEntity.left, roadEntity.right, i / roadEntity.laneCount);

      ctx.setLineDash([20, 20]);

      ctx.beginPath();
      ctx.moveTo(x, roadEntity.top);
      ctx.lineTo(x, roadEntity.bottom);
      ctx.stroke();
    }

    ctx.setLineDash([]);
    roadEntity.borders.forEach((border) => {
      ctx.beginPath();
      const top = border[0];
      const bottom = border[1];
      ctx.moveTo(top.x, top.y);
      ctx.lineTo(bottom.x, bottom.y);
      ctx.stroke();
    });

  }
}
