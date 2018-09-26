import refiner from '../src/refiner';
import firost from 'firost';

(async () => {
  try {
    const rawPaths = await firost.glob('./tmp/player-handbook/txt-raw/*.txt');

    const raw = await firost.read(rawPaths[42]);

    const lines = refiner.lines(raw);
    console.info(lines);

    // Read raw files by group of 5 in parallel
    // Transform content into list of nodes, with type and value
    // Save it into json file
  } catch (err) {
    console.info(err);
  }
})();
