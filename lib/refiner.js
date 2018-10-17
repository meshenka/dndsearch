import _ from 'lodash';
import knownBadWords from './bad-words.json';

const module = {
  /**
   * Parses the raw content as a list of lines
   * @param {String} input Raw textual content
   * @returns {Array} List of lines with type and content
   **/
  lines(input) {
    const lines = input.split('\n');
    const emptyPattern = /^$/;

    return _.map(lines, line => {
      // Title
      if (this.lineIsTitle(line)) {
        const value = _.chain(line)
          .replace(/ ([^ ])/g, '$1')
          .value();
        return {
          type: 'title',
          value,
        };
      }

      if (line.match(emptyPattern)) {
        return {
          type: 'empty',
          value: line,
        };
      }

      let value = line;
      value = this.fixBadSpacing(value);
      value = _.chain(value)
        .replace(/ {2}/g, ' ')
        .replace(/ ’/g, "'")
        .replace(/’/g, "'")
        .value();

      return {
        type: 'text',
        value,
      };
    });
  },
  /**
   * Some words aren't correctly extracted and have weird space after some
   * characters. We'll build a list of words to change
   * @param {String} input Input string to fix
   * @returns {String} Fixed string
   **/
  fixBadSpacing(input) {
    let output = input;

    // Fix the most common issues
    _.each(knownBadWords, word => {
      const match = output.match(new RegExp(word, 'i'));
      if (!match) {
        return;
      }
      const badlyWritten = match[0];
      const wellWritten = _.replace(badlyWritten, / /g, '');
      output = _.replace(output, new RegExp(badlyWritten, 'g'), wellWritten);
    });

    return output;
  },
  /**
   * Guess if a line is a title. Titles have a lot of empty spaces.
   * @param {String} input String to test
   * @returns {Boolean} True if we think it's a title
   **/
  lineIsTitle(input) {
    // Titles have additional spaces almost between each letter. We'll just
    // check if the ratio of spaces to characters seems too high.
    const spaceCount = (input.match(/ /g) || []).length;
    const length = input.length;
    return spaceCount / length > 0.4;
  },
  /**
   * Guess if a record should be skipped from indexing
   * @param {Object} record The record to test
   * @returns {Boolean} True if this is garbage
   **/
  shouldNotBeIndexed(record) {
    const content = record.content;
    if (record.isText) {
      if (content.match(/\.{5}/)) {
        return true;
      }
    }

    return false;
  },
};

export default _.bindAll(module, _.functions(module));
