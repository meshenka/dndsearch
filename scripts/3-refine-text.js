import refiner from '../src/refiner';
import firost from 'firost';

(async () => {
  const rawPaths = await firost.glob('./tmp/player-handbook/txt-raw/*.txt');

  // Read raw files by group of 5 in parallel
  // Transform content into list of nodes, with type and value
  // Save it into json file
  console.info(rawPaths);
})();
