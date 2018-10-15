/* eslint-disable no-process-exit */
import path from 'path';
import pietro from '../src/pietro';
import firost from 'firost';
import pMap from 'p-map';
import ProgressBar from 'progress';

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
    // const textFolder = path.join(tmpFolder, 'text');
    await firost.mkdirp(pageFolder);
    await firost.mkdirp(imageFolder);

    // Split large PDF into smaller versions, one per page
    function splitInPages() {
      const pdf = pietro.init(input);
      await pdf.toIndividualPages(pageFolder);
    }

    // Convert to PNG
    function generateImages() {
      const pages = await firost.glob(`${pageFolder}/*.pdf`);
      const pageCount = pages.length;

      const pngProgress = new ProgressBar(
        `Converting to PNG: [:bar] :percent :current/:total`,
        { total: pageCount }
      );
      await pMap(
        pages,
        async pagePath => {
          const page = pietro.init(pagePath);
          const paddedBasename = path.basename(pagePath, '.pdf');
          const result = await page.toImage(
            path.join(imageFolder, `${paddedBasename}.png`)
          );
          pngProgress.tick();
          return result;
        },
        { concurrency: 10 }
      );
    }

    function generateText() {
    }


    // splitInPages();
    // generateImages();
    generateText();


  } catch (err) {
    console.info(err);
  }
})();
