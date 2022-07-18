import './styles/styles.css';
import { Environment, type EnvironmentSettings } from './environment';

const initialSettings: Partial<EnvironmentSettings> = {

};

const env = new Environment(initialSettings);

env.start();
