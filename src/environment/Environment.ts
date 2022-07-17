import { RoadRenderer, Visualizer } from '../render';
import { RoadEntity } from '../entities';
import { CarManager, TrafficManager } from '../managers';
import { NeuralNetwork } from '../neuralnet';

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

  private sensorCount = 5;

  constructor() {
    this.carCanvasContext = this.carCanvas.getContext('2d') as CanvasRenderingContext2D;
    this.roadEntity = new RoadEntity(4, this.carCanvas.width/2, 0, this.carCanvas.width * 0.9, this.carCanvas.height);
    this.roadRenderer = new RoadRenderer(this.carCanvasContext, this.roadEntity);

    this.networkCanvasContext = this.networkCanvas.getContext('2d') as CanvasRenderingContext2D;

    this.resizeCanvas();

    this.carManagers = this.generateCarManagers(200);

    this.traffic = [];

    const trafficCount = 100;

    for (let i = 0; i < trafficCount; i++) {
      this.traffic.push(new TrafficManager(this.carCanvasContext, this.roadEntity));
    }
  }

  generateCarManagers = (count: number) => {
    const carManagers = [];
    for (let i = 0; i < count; i++) {
      carManagers.push(new CarManager({
        carEntity: [
          this.roadEntity,
          {
            acceleration: 0.45,
            maxSpeed: 25,
            friction: 0.05,
            turnRate: 0.05
          },
          this.roadEntity.getLaneCenter(Math.floor(this.roadEntity.laneCount / 2)),
          100,
          30,
          50
        ],
        carRenderer: [this.carCanvasContext, '#169DDE'],
        carControls: [],
        sensorEntity: [this.roadEntity, this.sensorCount],
        sensorRenderer: [this.carCanvasContext],
        neuralNetwork: [
          [this.sensorCount, 6, 4]
        ]
      }))
    }
    return carManagers;
  }

  start = () => {
    const bestCarManagerBrain = this.getBestCarManagerBrainFromStorage();
    if (bestCarManagerBrain) {
      for (let i = 0; i < this.carManagers.length; i++) {
        const parsedBrain = JSON.parse(bestCarManagerBrain);
        this.carManagers[i].neuralNetwork = parsedBrain;
        if (i != 0) {
          const mutationRate = .12;
          NeuralNetwork.mutate(this.carManagers[i].neuralNetwork as NeuralNetwork, mutationRate);
        }
      }
    }
    this.updateInterval = setInterval(() => {
      this.update();
    }, 1000 / 40);
    this.animate(0);


    this.handleResize = () => {
      this.resizeCanvas();
    };
    document.addEventListener('resize', this.handleResize);

    const saveButton = document.getElementById('save');
    const discardButton = document.getElementById('discard');
    saveButton?.addEventListener('click', () => {
      this.saveBestCarManager();
    });

    discardButton?.addEventListener('click', () => {
      this.discardBestCarManager();
    });
  };

  stop = () => {
    if (this.updateInterval) clearInterval(this.updateInterval);
    document.removeEventListener('resize', this.handleResize);
  };

  getBestCarManager =  () => {
    const furthestY = Math.min(...this.carManagers.map(carManager => carManager.carEntity.y));
    return this.carManagers.find(carManager => carManager.carEntity.y === furthestY);
  }

  saveBestCarManager = () => {
    const bestCarManager = this.getBestCarManager();
    localStorage.setItem('bestCarManagerBrain', JSON.stringify(bestCarManager?.neuralNetwork));
  }

  getBestCarManagerBrainFromStorage = () => {
    return localStorage.getItem('bestCarManagerBrain');
  }

  discardBestCarManager = () => {
    localStorage.removeItem('bestCarManagerBrain');
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
    this.networkCanvas.width = 300;
  }

  animate = (time: number) => {
    if (time > 20000 && this.carManagers.length > 100) {
      this.carManagers = this.carManagers.sort((a, b) => a.carEntity.y - b.carEntity.y).slice(0, this.carManagers.length - (time / 5000));
    }
    this.carCanvasContext.clearRect(0, 0, this.carCanvas.width, this.carCanvas.height);
    this.carCanvasContext.save();
    const bestCarManager = this.getBestCarManager();
    this.carCanvasContext.translate(0, -(bestCarManager?.carEntity?.y || 1) + this.carCanvas.height * 0.7);

    this.roadRenderer.render();

    this.traffic.forEach(t => {
      t.render();
    });


    [...this.carManagers].sort((a, b) => a.carEntity.y - b.carEntity.y)?.slice(0, 60).forEach((carManager, i) => {
      this.carCanvasContext.globalAlpha = Math.max(1 - (i / 25), 0);
      carManager.render();
    });


    this.carCanvasContext.restore();

    this.networkCanvasContext.clearRect(0, 0, this.networkCanvas.width, this.networkCanvas.height);
    this.networkCanvasContext.lineDashOffset = - time / 66

    Visualizer.drawNetwork(this.networkCanvasContext, bestCarManager?.neuralNetwork);

    const livingManagers = this.carManagers.filter(carManager => !carManager.carEntity.damaged).length;

    console.log(livingManagers);

    this.carCanvasContext.font = '48px serif';
    this.carCanvasContext.fillStyle = '#EFF';
    this.carCanvasContext.fillText(`Living: ${livingManagers}`, 25, 40);

    requestAnimationFrame(this.animate);
  };
}
