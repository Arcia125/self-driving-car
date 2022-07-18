import { RoadRenderer, Visualizer } from '../render';
import { RoadEntity } from '../entities';
import { CarManager, TrafficManager } from '../managers';
import { NeuralNetwork } from '../neuralnet';
import { getRandomNumber } from '../utils';

type DriverRecord = {
  record: number;
  neuralNetwork: NeuralNetwork;
}

export type EnvironmentSettings = {
  laneCount: number;
  isHumanControlled: boolean;
  sensorCount: number;
  trafficCount: number;
  carManagerCount: number;
  rayLength: number;
  raySpread: number;
}

export class Environment {
  private networkCanvas: HTMLCanvasElement = document.getElementById('network-canvas') as HTMLCanvasElement;
  private networkCanvasContext: CanvasRenderingContext2D;

  private carCanvas: HTMLCanvasElement = document.getElementById('car-canvas') as HTMLCanvasElement;
  private carCanvasContext: CanvasRenderingContext2D;
  private carManagers: CarManager[];

  private roadEntity: RoadEntity;
  private roadRenderer: RoadRenderer;

  private traffic: TrafficManager[];

  private updateInterval: number | null = null;

  private handleResize: any;

  private bestDriverRecord: DriverRecord | null;

  public static get configDefaults(): EnvironmentSettings {
    return {
      laneCount: 4,
      isHumanControlled: false,
      sensorCount: 20,
      trafficCount: 70,
      carManagerCount: 300,
      rayLength: 250,
      raySpread: Math.PI
    };
  }

  public settings: EnvironmentSettings;

  constructor(private initialSettings?: Partial<EnvironmentSettings>) {
    this.settings = {
      ...Environment.configDefaults,
      ...initialSettings
    }
    this.bestDriverRecord = this.getBestDriverFromStorage();
    if (!this.bestDriverRecord) {
      this.settings.carManagerCount *= 2;
    }
    this.carCanvasContext = this.carCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.roadEntity = new RoadEntity(this.settings.laneCount, this.carCanvas.width / 2, 0, this.carCanvas.width * 0.9, this.carCanvas.height);
    this.roadRenderer = new RoadRenderer(this.carCanvasContext, this.roadEntity);

    this.networkCanvasContext = this.networkCanvas.getContext('2d') as CanvasRenderingContext2D;

    this.resizeCanvas();

    this.carManagers = this.generateCarManagers(this.settings.carManagerCount);


    this.traffic = [];

    const maxSpeed = this.carManagers[0].carEntity.settings.maxSpeed ;
    const firstCarY = (Math.random() * -200) -200;
    const iterationOffset = 200;
    for (let i = 0; i < this.settings.trafficCount; i++) {
      this.traffic.push(

        new TrafficManager(
          this.carCanvasContext,
          this.roadEntity,
          {
            acceleration: 0.35,
            maxSpeed: i === 0 ? 2 : getRandomNumber(maxSpeed / 2, maxSpeed - 2),
            friction: 0.05,
            turnRate: 0.03,
          },
          // this.roadEntity.getLaneCenter(Math.floor(Math.random() * this.roadEntity.laneCount)),
          i === 0 ? this.roadEntity.getLaneCenter(Math.floor(this.roadEntity.laneCount / 2)) : this.roadEntity.getLaneCenter(Math.floor(Math.random() * this.roadEntity.laneCount)),
          // Math.random() * -20000,

          i === 0 ? firstCarY : getRandomNumber(firstCarY - ((i - 1) * iterationOffset), firstCarY - (i * iterationOffset)),
          30,
          50
        ));
    }
  }

  generateCarManagers = (count: number) => {
    const carManagers = [];
    for (let i = 0; i < count; i++) {
      carManagers.push(new CarManager({
        carEntity: [
          this.roadEntity,
          {
            acceleration: 1,
            maxSpeed: 15,
            friction: 0.2,
            turnRate: 0.05
          },
          this.roadEntity.getLaneCenter(Math.floor(this.roadEntity.laneCount / 2)),
          100,
          30,
          50
        ],
        carRenderer: [this.carCanvasContext, '#169DDE'],
        carControls: [],
        sensorEntity: [this.roadEntity, this.settings.sensorCount, this.settings.rayLength, this.settings.raySpread, []],
        sensorRenderer: [this.carCanvasContext],
        neuralNetwork: [
          // [this.config.sensorCount + 1, this.config.sensorCount / 2, 6, 4]
          // [this.config.sensorCount + 1, 9, 6, 4]
          [this.settings.sensorCount, 6, 4]
        ]
      }))
    }
    return carManagers;
  }

  start = () => {
    const saveButton = document.getElementById('save');
    const discardButton = document.getElementById('discard');
    const takeControlButton = document.getElementById('takeControl')

    saveButton?.addEventListener('click', () => {
      this.saveBestDriverToStorage();
    });
    discardButton?.addEventListener('click', () => {
      this.discardBestCarManagerFromStorage();
    });
    takeControlButton?.addEventListener('click', () => {
      if (this.settings.isHumanControlled) {
        CarManager.closeControlListeners();
        this.settings.isHumanControlled = false;
        console.log('dropping control')
      } else {
        this.takeControlOfBestCarManager();
        this.settings.isHumanControlled = true;
        console.log('taking control')
      }
    });

    this.handleResize = () => {
      this.resizeCanvas();
    };
    document.addEventListener('resize', this.handleResize);

    this.bestDriverRecord = this.getBestDriverFromStorage();
    if (this.bestDriverRecord) {
      for (let i = 0; i < this.carManagers.length; i++) {
        this.bestDriverRecord = this.getBestDriverFromStorage() as DriverRecord;
        this.carManagers[i].neuralNetwork = this.bestDriverRecord.neuralNetwork;
        if (i != 0) {
          const mutationRate = .13;
          NeuralNetwork.mutate(this.carManagers[i].neuralNetwork as NeuralNetwork, mutationRate);
        }
      }
    }
    this.updateInterval = setInterval(() => {
      this.update();
    }, 1000 / 40);
    this.animate(0);
    if (this.settings.isHumanControlled) this.carManagers[0].makeControlled();
  };

  stop = () => {
    if (this.updateInterval) clearInterval(this.updateInterval);
    document.removeEventListener('resize', this.handleResize);
    if (this.settings.isHumanControlled) this.carManagers[0].closeControls();
  };

  getBestCarManager = (filterAlive: boolean = false) => {
    let carManagers = this.carManagers.filter(carManager => filterAlive ? !carManager.carEntity.damaged : true)
    if (!carManagers.length) carManagers = this.carManagers;
    const furthestY = Math.min(...carManagers.map(carManager => carManager.carEntity.y));

    return this.carManagers.find(carManager => carManager.carEntity.y === furthestY);
  }

  getBestDriver = (): DriverRecord | null => {
    const bestCarManager = this.getBestCarManager();
    if (!bestCarManager) return null;
    return {
      record: Math.max(Math.abs(bestCarManager?.carEntity.y || 0), this.bestDriverRecord?.record || 0),
      neuralNetwork: bestCarManager.neuralNetwork as NeuralNetwork
    };
  };

  saveBestDriverToStorage = () => {
    const bestDriver = this.getBestDriver();
    localStorage.setItem('bestDriver', JSON.stringify(bestDriver));
  }

  getBestDriverFromStorage = (): DriverRecord | null => {
    const bestDriver = localStorage.getItem('bestDriver');
    return bestDriver ? JSON.parse(bestDriver) : null;
  }

  discardBestCarManagerFromStorage = () => {
    localStorage.removeItem('bestDriver');
  }

  takeControlOfBestCarManager = () => {
    this.getBestCarManager(true)?.makeControlled();
  }

  update = () => {
    const bestCarManager = this.getBestCarManager();
    if (bestCarManager) {
      this.roadEntity.update(bestCarManager.controls);
    }

    this.carManagers.forEach(carManager => {
      if (!carManager.carEntity.damaged) {
        carManager.update(this.traffic)
      }
    });
    this.traffic.forEach(t => {
      t.update()
    });
  };

  resizeCanvas = () => {
    this.carCanvas.height = window.innerHeight;
    this.networkCanvas.height = window.innerHeight;
    const carCanvasRect = this.carCanvas.getBoundingClientRect()
    this.networkCanvas.width = window.innerWidth - carCanvasRect.left - carCanvasRect.width;
  }

  animate = (time: number) => {
    this.carCanvasContext.clearRect(0, 0, this.carCanvas.width, this.carCanvas.height);
    this.carCanvasContext.save();
    const bestCarManager = this.getBestCarManager();
    const bestLivingCarManager = bestCarManager || this.getBestCarManager(true);
    const yPos = CarManager.userControl ? CarManager.userControl.carEntity.y : bestLivingCarManager?.carEntity?.y || 1;
    const position = -(yPos) + this.carCanvas.height * 0.7;
    this.carCanvasContext.translate(0, position);

    this.roadRenderer.render();

    this.traffic.forEach(t => {
      t.render();
    });

    const livingManagers = this.carManagers.filter(carManager => !carManager.carEntity.damaged).length;

    const carManagerRating = (carManager: CarManager) => {
      const damageWeighting = (carManager.carEntity.damaged ? 0.8 : 1.05);
      return carManager.carEntity.y * damageWeighting;
    }

    const renderedManagers = [...this.carManagers].sort((a, b) => carManagerRating(a) - carManagerRating(b))?.slice(0, 60);

    if (CarManager.userControl && renderedManagers.indexOf(CarManager.userControl) !== 0) CarManager.userControl.render({ sensors: true });

    renderedManagers.forEach((carManager, i) => {
      this.carCanvasContext.globalAlpha = Math.max(1 - (i / 25), 0);
      carManager.render({ sensors: i === 0 && !CarManager.userControl || carManager === CarManager.userControl });
    });



    this.carCanvasContext.restore();

    this.networkCanvasContext.clearRect(0, 0, this.networkCanvas.width, this.networkCanvas.height);
    this.networkCanvasContext.lineDashOffset = - time / 66

    Visualizer.drawNetwork(this.networkCanvasContext, bestLivingCarManager?.neuralNetwork);


    this.carCanvasContext.font = '28px serif';
    this.carCanvasContext.fillStyle = '#EFF';
    this.carCanvasContext.textAlign = 'left';
    this.carCanvasContext.fillText(`${livingManagers} 🏎`, 25, 40);

    this.carCanvasContext.font = '24px serif';
    this.carCanvasContext.fillStyle = '#EFF';
    this.carCanvasContext.fillText(`${Math.abs(Math.floor(bestCarManager?.carEntity.y || 0 - 100))}m`, 25, this.carCanvas.height - 30)

    if (this.bestDriverRecord) {
      this.carCanvasContext.font = '18px serif';
      this.carCanvasContext.fillStyle = '#EFF';
      this.carCanvasContext.fillText(`Record: ${Math.floor(this.bestDriverRecord.record)}m`, 25, this.carCanvas.height - 60);
    }

    const baseSpeed = CarManager.userControl?.carEntity.speed || bestLivingCarManager?.carEntity.speed || 0;
    this.carCanvasContext.font = '18px monospaced';
    this.carCanvasContext.fillStyle = '#EFF';
    this.carCanvasContext.fillText(' km/h', this.carCanvas.width - 50, this.carCanvas.height - 40);
    const speedIndex = Math.floor(((baseSpeed / (bestLivingCarManager?.carEntity?.settings?.maxSpeed || 1)) * 100) / 30);
    const speedColor = ['#B3CCF5', '#F7F1AF', '#F5CA7B', '#FF7F7F'][speedIndex];
    const speedFontSize = ['20px', '22px', '24px', '26px'][speedIndex];
    this.carCanvasContext.font = `${speedFontSize} monospaced`;
    this.carCanvasContext.fillStyle = speedColor;
    this.carCanvasContext.textAlign = 'right';
    this.carCanvasContext.textBaseline = 'middle';
    this.carCanvasContext.fillText(`${Math.round((baseSpeed) * 10)}`, this.carCanvas.width - 50, this.carCanvas.height - 40);

    requestAnimationFrame(this.animate);
  };
}
