import _ from 'lodash';

const module = {
  /**
   * Parses the raw content as a list of lines
   * @param {String} input Raw textual content
   * @returns {Array} List of lines with type and content
   **/
  lines(input) {
    const lines = input.split('\n');
    const titlePattern = /^(([a-zA-Z] )+).$/;
    const emptyPattern = /^$/;

    return _.map(lines, line => {
      // Title
      if (line.match(titlePattern)) {
        return {
          type: 'title',
          value: _.replace(line, / /g, ''),
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
};

export default _.bindAll(module, _.functions(module));
