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

  describe('lineIsTitle', () => {
    it('should match title with trailing space', () => {
      const input = 'R a g e ';

      const actual = module.lineIsTitle(input);

      expect(actual).toEqual(true);
    });
    it('should match title without trailing space', () => {
      const input = 'R a g e';

      const actual = module.lineIsTitle(input);

      expect(actual).toEqual(true);
    });
    it('should not match regular line', () => {
      const input = 'This is a normal line';

      const actual = module.lineIsTitle(input);

      expect(actual).toEqual(false);
    });
    describe('several words', () => {
      it('should match title with trailing space', () => {
        const input = 'G r o g  R a g e ';

        const actual = module.lineIsTitle(input);

        expect(actual).toEqual(true);
      });
      it('should match title without trailing space', () => {
        const input = 'G r o g  R a g e';

        const actual = module.lineIsTitle(input);

        expect(actual).toEqual(true);
      });
    });
  });
});
