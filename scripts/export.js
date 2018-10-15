/* eslint-disable no-process-exit */
import path from 'path';
import pietro from '../src/pietro';
import firost from 'firost';
import pMap from 'p-map';

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

    const pdf = pietro.init(input);
    // Split large PDF into smaller versions, one per page
    await pdf.toIndividualPages(pageFolder);

    // Convert each small file
    // const pages = await firost.glob(`${pageFolder}/*.pdf`);
    const pages = await firost.glob(`${pageFolder}/0264.pdf`);
    await pMap(
      pages,
      async pagePath => {
        const page = pietro.init(pagePath);
        const paddedBasename = path.basename(pagePath, '.pdf');
        await page.toImage(path.join(imageFolder, `${paddedBasename}.png`));
      },
      { concurrency: 10 }
    );
  } catch (err) {
    console.info(err);
  }
})();
