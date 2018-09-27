import _ from 'lodash';

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
          .replace(/ /g, '')
          .startCase()
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

      return {
        type: 'text',
        value: line,
      };
    });
  },
  lineIsTitle(input) {
    const titlePattern = /^(.  ?)+.?$/;
    const match = input.match(titlePattern);
    return Boolean(match);
  },
};

export default _.bindAll(module, _.functions(module));
