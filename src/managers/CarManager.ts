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
  public static userControl: CarManager | null = null;
  public carEntity: CarEntity;
  public carRenderer: CarRenderer;
  public controls: CarControls;
  public sensorEntity?: SensorEntity;
  public sensorRenderer?: SensorRenderer;
  public neuralNetwork?: NeuralNetwork;
  public lastOffsets: number[][] = [];

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
    if (this.sensorEntity && this.neuralNetwork && this !== CarManager.userControl) {
      const offsets = this.sensorEntity.readings.map(r => r == null ? 0 : 1 - r.offset);
      // const outputs = NeuralNetwork.feedForward(offsets.concat(this.lastOffsets.reduce((acc, curr) => acc.length === 0 ? curr : acc.map((value, i) => (value + (curr[i])) / 2), [])), this.neuralNetwork);
      // const outputs = NeuralNetwork.feedForward(offsets.concat(this.lastOffsets.reduce((acc, curr) => acc + curr.reduce((a, c) => a + c, 0), 0)), this.neuralNetwork);
      const outputs = NeuralNetwork.feedForward(offsets, this.neuralNetwork);
      // const outputs = NeuralNetwork.feedForward(offsets.concat(this.lastOffsets.flat().reduce((acc, cur) => acc + cur, 0) / this.lastOffsets.flat().length), this.neuralNetwork);
      // if (this.lastOffsets.flat().length > (((this.neuralNetwork.neuronCounts[0] - 1) - offsets.length) * 50)) {
      //   this.lastOffsets.pop();
      // }
      // this.lastOffsets.push(offsets);
      // this.lastOffsets.unshift(offsets);
      this.controls.forward = outputs[0]
      this.controls.left = outputs[1];
      this.controls.right = outputs[2];
      this.controls.reverse = outputs[3];
    }
    this.carEntity.update(this.controls, traffic);
    this.sensorEntity?.update(this.controls, traffic);
  }

  public render = (options?: { sensors: boolean }) => {
    this.carRenderer.render();
    if (options?.sensors) {
      this.sensorRenderer?.render();
    }
  }

  public get polygon() {
    return this.carEntity.polygon;
  }

  public makeControlled = () => {
    CarManager.makeManagerControlled(this);
  }

  public closeControls = () => {
    CarManager.closeControlListeners();
  }

  public static closeControlListeners(): void {
    if (CarManager.userControl) {
      CarManager.userControl.controls.close();
      CarManager.userControl = null;
    }
  }

  public static makeManagerControlled(manager: CarManager): void {
    CarManager.closeControlListeners();
    CarManager.userControl = manager;
    CarManager.userControl.controls.listen();
  }
}
