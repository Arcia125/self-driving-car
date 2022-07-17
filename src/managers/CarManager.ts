import { CarControls } from '../controls';
import { CarEntity, SensorEntity } from '../entities';
import { NeuralNetwork } from '../neuralnet';
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
  public neuralNetwork?: NeuralNetwork;

  constructor(private parameters: {
    carEntity: ConstructorParameters<typeof CarEntity>;
    carRenderer: [ConstructorParameters<typeof CarRenderer>[1], ConstructorParameters<typeof CarRenderer>[2]];
    carControls: ConstructorParameters<typeof CarControls>;
    sensorEntity?: NecessarySensorEntityConstructorParams | [
      SensorEntityConstructorParams[1],
      SensorEntityConstructorParams[2]
    ];
    sensorRenderer?: [ConstructorParameters<typeof SensorRenderer>[0]];
    neuralNetwork?: ConstructorParameters<typeof NeuralNetwork>;
  }) {
    this.carEntity = new CarEntity(
      ...parameters.carEntity
    );

    this.carRenderer = new CarRenderer(
      this.carEntity,
      ...parameters.carRenderer,
    );

    this.controls = new CarControls(...parameters.carControls);

    if (parameters.sensorEntity) {
      this.sensorEntity = new SensorEntity(this.carEntity, ...parameters.sensorEntity as NecessarySensorEntityConstructorParams)
      if (parameters.sensorRenderer) {
        this.sensorRenderer = new SensorRenderer(...parameters.sensorRenderer, this.sensorEntity)
      }
    }

    if (parameters.neuralNetwork) {
      this.neuralNetwork = new NeuralNetwork(...parameters.neuralNetwork);
    }
  }

  public update = (traffic?: TrafficManager[]) => {
    if (this.sensorEntity && this.neuralNetwork) {
      const offsets = this.sensorEntity.readings.map(r => r == null ? 0 : 1 - r.offset);
      const outputs = NeuralNetwork.feedForward(offsets, this.neuralNetwork);
      this.controls.forward = outputs[0]
      this.controls.left = outputs[1];
      this.controls.right = outputs[2];
      this.controls.reverse = outputs[3];
    }
    this.carEntity.update(this.controls, traffic);
    this.sensorEntity?.update(this.controls, traffic);
  }

  public render = () => {
    this.carRenderer.render();
    this.sensorRenderer?.render();
  }

  public get polygon() {
    return this.carEntity.polygon;
  }
}
