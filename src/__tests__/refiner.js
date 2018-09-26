import module from '../refiner';
import helper from '../test-helper';
const mock = helper.mock(module);

describe('refiner', () => {
  describe('lines', () => {
    it('should create one entry per line', () => {
      const input = 'Foo\nBar\nBaz';

      const actual = module.lines(input);

      expect(actual).toHaveLength(3);
    });

    it('should identify titles, new lines and normal lines', () => {
      const input = 'R a g e\n\nI would like to rage.';

      const actual = module.lines(input);

      expect(actual[0]).toHaveProperty('type', 'title');
      expect(actual[0]).toHaveProperty('value', 'Rage');

      expect(actual[1]).toHaveProperty('type', 'empty');
      expect(actual[1]).toHaveProperty('value', '');

      expect(actual[2]).toHaveProperty('type', 'text');
      expect(actual[2]).toHaveProperty('value', 'I would like to rage.');
    });
  });
});
