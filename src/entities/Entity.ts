export class Entity {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public angle: number = 0,
    public parent: Entity | null = null
  ) {
    if (parent) {
      this.x = parent.x;
      this.y = parent.y;
      this.width = parent.width;
      this.height = parent.height;
      this.angle = parent.angle;
    }
  }
}
