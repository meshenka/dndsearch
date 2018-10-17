import html from './html';
import css from './css';
import js from './js';
import assets from './assets';
import pAll from 'p-all';

(async function() {
  await pAll([
    async () => {
      await html.run();
      await css.run();
    },
    async () => await js.run(),
    async () => await assets.run(),
  ]);
})();
