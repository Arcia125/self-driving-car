import { lerp } from '../utils';
import { Level } from './Level'

export class NeuralNetwork {
  public levels: Level[];
  constructor(public neuronCounts: number[]) {
    this.levels = [];
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(
        neuronCounts[i], neuronCounts[i + 1]
      ));
    }
  }

  static feedForward(givenInputs: any[], network: NeuralNetwork) {
    let outputs = Level.feedForward(
      givenInputs, network.levels[0]);
    for (let i = 1; i < network.levels.length; i++) {
      outputs = Level.feedForward(
        outputs, network.levels[i]);
    }
    return outputs;
  }

  static mutate(network: NeuralNetwork, amount: number = 1) {
    for (let l = 0; l < network.levels.length; l++) {
      for (let i = 0; i < network.levels[l].biases.length; i++) {
        const newBias = lerp(
          network.levels[l].biases[i],
          Math.random() * 2 - 1,
          amount
        );
        network.levels[l].biases[i] = newBias;
      }
      for (let i = 0; i < network.levels[l].weights.length; i++) {
        for (let j = 0; j < network.levels[l].weights[i].length; j++) {
          const newWeight = lerp(
            network.levels[l].weights[i][j],
            Math.random() * 2 - 1,
            amount
          );
          network.levels[l].weights[i][j] = newWeight
        }
      }
    }

  }
}
