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

      let value = _.chain(line)
        .replace(/\b(w) /gi, '$1')
        .replace(/ {2}/g, ' ')
        .replace(/o f\b/g, 'of')
        .replace(/ ’/g, "'")
        .replace(/’/g, "'")
        // .replace(/som e/g, 'some')
        .value();

      value = this.fixBadSpacing(value);

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
      const match = output.match(new RegExp(`${word}`, 'i'));
      if (!match) {
        return;
      }
      const badlyWritten = match[0];
      const wellWritten = _.replace(badlyWritten, / /g, '');
      output = _.replace(output, badlyWritten, wellWritten);
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
};

export default _.bindAll(module, _.functions(module));
