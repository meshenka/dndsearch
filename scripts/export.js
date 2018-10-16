/* eslint-disable no-process-exit */
import path from 'path';
import os from 'os';
import pietro from '../src/pietro';
import firost from 'firost';
import pMap from 'p-map';
import ProgressBar from 'progress';
const cpuCount = os.cpus().length;

// Split large PDF into smaller versions, one per page
async function splitInPages(input, destination) {
  const pdf = pietro.init(input);
  await firost.mkdirp(destination);
  await pdf.toIndividualPages(destination);
}

// Convert to PNG
async function generateImages(source, destination) {
  await firost.mkdirp(destination);
  const pages = await firost.glob(`${source}/*.pdf`);
  const pageCount = pages.length;

  const progress = new ProgressBar(
    `Converting to PNG: [:bar] :percent :current/:total`,
    { total: pageCount }
  );
  await pMap(
    pages,
    async pagePath => {
      const page = pietro.init(pagePath);
      const paddedBasename = path.basename(pagePath, '.pdf');
      const result = await page.toImage(
        path.join(destination, `${paddedBasename}.png`)
      );
      progress.tick();
      return result;
    },
    { concurrency: cpuCount }
  );
}

// Extract text
async function generateText(source, destination) {
  await firost.mkdirp(destination);
  const pages = await firost.glob(`${source}/*.pdf`);
  const pageCount = pages.length;

  const progress = new ProgressBar(
    `Extracting raw text: [:bar] :percent :current/:total`,
    { total: pageCount }
  );
  await pMap(
    pages,
    async pagePath => {
      const page = pietro.init(pagePath);
      const paddedBasename = path.basename(pagePath, '.pdf');
      const result = await page.toText(
        path.join(destination, `${paddedBasename}.txt`)
      );
      progress.tick();
      return result;
    },
    { concurrency: cpuCount }
  );
}

(async () => {
  try {
    if (!pietro.checkDependencies()) {
      process.exit(1);
      return;
    }

    // Folders
    const input = path.resolve(process.argv[2]);
    const basename = path.basename(input, path.extname(input));
    const tmpFolder = path.join('./tmp', basename);
    const pageFolder = path.join(tmpFolder, 'pages');
    const imageFolder = path.join(tmpFolder, 'images');
    const textFolder = path.join(tmpFolder, 'text');

    await splitInPages(input, pageFolder);
    await generateImages(pageFolder, imageFolder);
    await generateText(pageFolder, textFolder);
  } catch (err) {
    console.info(err);
  }
})();
