/* eslint-disable no-process-exit */
import _ from 'lodash';
import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import zeroFill from 'zero-fill';
import firost from 'firost';
import ProgressBar from 'progress';
import scissors from 'scissors';
import pMap from 'p-map';
import which from 'which';

const instance = {
  cache: {},
  /**
   * Returns the number of pages in the PDF
   * @returns {Number} Number of pages
   **/
  async pageCount() {
    if (!this.cache.pageCount) {
      this.cache.pageCount = await this.pdf.getNumPages();
    }
    return this.cache.pageCount;
  },

  /**
   * Save the given stream to the specific destination file
   * @param {Stream} stream Read stream
   * @param {String} destination Path to save the content
   * @returns {Promise} Promise fulfilled when file completely written to file
   **/
  async saveStream(stream, destination) {
    return await new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(destination);
      stream
        .pipe(writeStream)
        .on('finish', () => {
          resolve();
        })
        .on('error', reject);
    });
  },

  /**
   * Save each page to a specific PDF
   * @param {String} destinationDirectory Path where to save the files
   * @returns {Promise} Promise fulfilled when all pages are saved to disk
   **/
  async toIndividualPages(destinationDirectory) {
    // Create directory if needed
    await firost.mkdirp(destinationDirectory);

    // Loop through all pages
    const pageCount = await this.pageCount();
    const progress = new ProgressBar(
      `Extracting individual pages: [:bar] :percent :current/:total`,
      { total: pageCount }
    );
    const range = _.range(1, pageCount + 1);

    await pMap(
      range,
      async pageIndex => {
        const paddedIndex = zeroFill(4, pageIndex);
        const destinationPath = `${destinationDirectory}/${paddedIndex}.pdf`;

        // Skipping if already exists in destination
        if (fs.existsSync(destinationPath)) {
          progress.tick();
          return false;
        }

        // Read the stream, and save it to destination
        const readStream = this.pdf.pages(pageIndex).pdfStream();
        const savedStream = await this.saveStream(readStream, destinationPath);
        progress.tick();
        return savedStream;
      },
      { concurrency: 10 }
    );
  },

  /**
   * Convert the PDF to an image
   * @param {String} destination Path to save the png file
   * @returns {Promise} Resolves when saved, rejected if error
   **/
  async toImage(destination) {
    if (fs.existsSync(destination)) {
      return;
    }

    const command = [
      'convert',
      '-flatten',
      '-density 300',
      '-quality 100',
      `"${this.path}"`,
      `"${path.resolve(destination)}"`,
    ].join(' ');

    try {
      await firost.shell(command);
      return;
    } catch (err) {
      // Default ImageMagick installation have a policy to prevent converting
      // PDF. We'll try to catch that and explain how to fix it
      if (_.includes(err, 'not authorized')) {
        console.warn(
          chalk.yellow(`
  It seems that your ImageMagick is configured to disallow PDF conversion.
  Check this StackOverflow question to see how to fix this
  https://stackoverflow.com/questions/42928765/convertnot-authorized-aaaa-error-constitute-c-readimage-453
        `)
        );
        process.exit(1);
      }
      console.info(err);
    }
  },
};

const module = {
  init(inputPath) {
    return {
      pdf: scissors(inputPath),
      path: path.resolve(inputPath),
      ...instance,
    };
  },
  /**
   * Check that all the required binaries are installed.
   * Will display the list of missing dependencies in case of failure
   * @returns {Boolean} True if all is installed, false otherwise
   **/
  checkDependencies() {
    const dependencies = {
      pdftk: 'PDFToolkit',
      convert: 'ImageMagick',
      gs: 'Ghostscript',
    };
    const missingDependencies = _.compact(
      _.map(
        dependencies,
        (name, command) =>
          which.sync(command, { nothrow: true }) ? false : { name, command }
      )
    );

    if (_.isEmpty(missingDependencies)) {
      return true;
    }

    const errorMessage = ['Missing dependencies:'];
    _.each(missingDependencies, dependency => {
      errorMessage.push(`- ${dependency.command} (${dependency.name})`);
    });
    console.error(chalk.red(errorMessage.join('\n')));
    return false;
  },
};

export default _.bindAll(module, _.functions(module));
