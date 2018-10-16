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

    describe('titles', () => {
      it('should convert Path of the Berserker', () => {
        const input = 'P a t h  o f  t h e  B e r s e r k e r';

        const actual = module.lines(input);

        expect(actual[0]).toHaveProperty('type', 'title');
        expect(actual[0]).toHaveProperty('value', 'Path of the Berserker');
      });
    });

    describe('text', () => {
      it('should fix "of"', () => {
        const input =
          'modifier) or be frightened o f you until the end o f your';

        const actual = module.lines(input);

        expect(actual[0]).toHaveProperty('type', 'text');
        expect(actual[0]).toHaveProperty(
          'value',
          'modifier) or be frightened of you until the end of your'
        );
      });
      it('should fix "W hen"', () => {
        const input = 'W hen you do so, choose one creature that you can see';

        const actual = module.lines(input);

        expect(actual[0]).toHaveProperty('type', 'text');
        expect(actual[0]).toHaveProperty(
          'value',
          'When you do so, choose one creature that you can see'
        );
      });
      it('should fix "som e"', () => {
        const input = 'frighten som eone with your menacing presence.';

        const actual = module.lines(input);

        expect(actual[0]).toHaveProperty('type', 'text');
        expect(actual[0]).toHaveProperty(
          'value',
          'frighten someone with your menacing presence.'
        );
      });
      it('should fix double spacing', () => {
        const input = 'you, it must succeed on a Wisdom  saving throw (DC';

        const actual = module.lines(input);

        expect(actual[0]).toHaveProperty('type', 'text');
        expect(actual[0]).toHaveProperty(
          'value',
          'you, it must succeed on a Wisdom saving throw (DC'
        );
      });
      it('should fix "can ’t"', () => {
        const input = 'Beginning at 6th level, you can ’t be charmed or';

        const actual = module.lines(input);

        expect(actual[0]).toHaveProperty('type', 'text');
        expect(actual[0]).toHaveProperty(
          'value',
          "Beginning at 6th level, you can't be charmed or"
        );
      });
      it('should fix "charm ed"', () => {
        const input = 'frightened while raging. If you are charm ed or';

        const actual = module.lines(input);

        expect(actual[0]).toHaveProperty('type', 'text');
        expect(actual[0]).toHaveProperty(
          'value',
          'frightened while raging. If you are charmed or'
        );
      });
    });
  });

  describe('fixBadSpacing', () => {
    it('should fix "maximum"', () => {
      const input = 'm axim um for those scores is now 24.';

      const actual = module.fixBadSpacing(input);

      expect(actual).toEqual('maximum for those scores is now 24.');
    });
    it('should fix "Gnom es"', () => {
      const input = 'They are Gnom es hey';

      const actual = module.fixBadSpacing(input);

      expect(actual).toEqual('They are Gnomes hey');
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
      it('should match "Pr i m a l  Pa t h s"', () => {
        const input = 'Pr i m a l  Pa t h s';

        const actual = module.lineIsTitle(input);

        expect(actual).toEqual(true);
      });
    });
  });
});
