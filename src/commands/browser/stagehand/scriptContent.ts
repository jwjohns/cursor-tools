import { readFileSync } from 'fs';
import { once } from '../../../utils/once';

export const scriptContent = once(() =>
  readFileSync('./node_modules/@browserbasehq/stagehand/lib/dom/build/index.js').toString()
);
