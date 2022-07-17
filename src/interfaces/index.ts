export type Coordinates = {
  x: number,
  y: number
}

export type Ray = Coordinates[];

export type Touch = Coordinates & {
  offset: number,
}
