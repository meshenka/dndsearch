/* eslint-disable no-process-exit */
import chalk from 'chalk';
import ProgressBar from 'progress';
import firost from 'firost';
import os from 'os';
import pMap from 'p-map';
import path from 'path';
import pietro from '../src/pietro';
import refiner from '../src/refiner';
import _ from 'lodash';
const cpuCount = os.cpus().length;

// Split large PDF into smaller versions, one per page
async function splitInPages(input, destination) {
  const pdf = pietro.init(input);
  await firost.mkdirp(destination);
  await pdf.toIndividualPages(destination);
}

// Convert to PNG
async function generateImages(pages, destination) {
  await firost.mkdirp(destination);
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
async function generateText(pages, destination) {
  await firost.mkdirp(destination);
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

// Convert text to records
async function generateRecords(texts, destination) {
  await firost.mkdirp(destination);
  const pageCount = texts.length;

  const progress = new ProgressBar(
    `Converting to records: [:bar] :percent :current/:total`,
    { total: pageCount }
  );

  await pMap(
    texts,
    async textPath => {
      const raw = await firost.read(textPath);
      const lines = refiner.lines(raw);
      const records = [];
      const pageIndex = _.parseInt(path.basename(textPath, '.txt'));
      let currentContent = [];
      const commonData = {
        pageIndex,
      };

      _.each(lines, line => {
        const isText = line.type === 'text';
        const isEmpty = line.type === 'empty';
        const value = line.value;

        // Store all text content to create a paragraph
        if (isText) {
          currentContent.push(value);
          return;
        }

        // End of paragraph, we add it
        if (!_.isEmpty(currentContent)) {
          records.push({
            type: 'text',
            ...commonData,
            content: currentContent.join(' '),
          });
          currentContent = [];
        }

        if (isEmpty) {
          return;
        }

        records.push({
          type: 'title',
          ...commonData,
          content: value,
        });
      });

      const paddedBasename = path.basename(textPath, '.txt');
      const recordPath = path.join(destination, `${paddedBasename}.json`);
      const result = await firost.writeJson(recordPath, records);
      progress.tick();
      return result;
    },
    { concurrency: 10 }
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
    const recordFolder = path.join(tmpFolder, 'records');

    // await splitInPages(input, pageFolder);

    // const pages = await firost.glob(`${pageFolder}/*.pdf`);
    // await generateImages(pages, imageFolder);
    // await generateText(pages, textFolder);

    const texts = await firost.glob(`${textFolder}/*.txt`);
    await generateRecords(texts, recordFolder);
  } catch (err) {
    console.info(err);
  }
})();
