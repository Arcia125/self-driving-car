import { CarControls } from '../controls';
import { CarEntity, SensorEntity } from '../entities';
import { CarRenderer, SensorRenderer } from '../render';
import { TrafficManager } from './TrafficManager';

type SensorEntityConstructorParams = ConstructorParameters<typeof SensorEntity>;

type NecessarySensorEntityConstructorParams = [
  SensorEntityConstructorParams[1],
  SensorEntityConstructorParams[2],
  SensorEntityConstructorParams[3],
  SensorEntityConstructorParams[4],
  SensorEntityConstructorParams[5],
];

export class CarManager {
  public carEntity: CarEntity;
  public carRenderer: CarRenderer;
  public controls: CarControls;
  public sensorEntity?: SensorEntity;
  public sensorRenderer?: SensorRenderer;

  constructor(private parameters: {
    carEntity: ConstructorParameters<typeof CarEntity>;
    carRenderer: [ConstructorParameters<typeof CarRenderer>[0]];
    carControls: ConstructorParameters<typeof CarControls>;
    sensorEntity?: NecessarySensorEntityConstructorParams | [
      SensorEntityConstructorParams[1]
    ];
    sensorRenderer?: [ConstructorParameters<typeof SensorRenderer>[0]];
  }) {
    this.carEntity = new CarEntity(
      ...parameters.carEntity
    );

    this.carRenderer = new CarRenderer(
      ...parameters.carRenderer,
      this.carEntity
    );

    this.controls = new CarControls(...parameters.carControls);

    if (parameters.sensorEntity) {
      this.sensorEntity = new SensorEntity(this.carEntity, ...parameters.sensorEntity as NecessarySensorEntityConstructorParams)
      if (parameters.sensorRenderer) {
        this.sensorRenderer = new SensorRenderer(...parameters.sensorRenderer, this.sensorEntity)
      }
    }
  }

  public update = (traffic?: TrafficManager[]) => {
    this.carEntity.update(this.controls, traffic);
    this.sensorEntity?.update(this.controls);
  }

  public render = () => {
    this.carRenderer.render();
    this.sensorRenderer?.render();
  }

  public get polygon() {
    return this.carEntity.polygon;
  }
}
