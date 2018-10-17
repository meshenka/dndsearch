import helper from './helper';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import tailwind from 'tailwindcss';
import postcssNested from 'postcss-nested';
import postcssImport from 'postcss-import';
import postcssPurge from '@fullhuman/postcss-purgecss';
import postcssClean from 'postcss-clean';
import path from 'path';
import pMap from 'p-map';

export default {
  postcssPlugins() {
    const plugins = [
      postcssImport(),
      tailwind('./tailwind.config.js'),
      postcssNested,
    ];

    // Add more plugins when building
    if (!this.isProduction()) {
      return plugins;
    }

    plugins.push(
      postcssPurge({
        content: [`./dist/*.html`],
        whitelistPatterns: [/^ais-/],
      })
    );

    plugins.push(autoprefixer);

    const cleanCssOptions = {
      level: {
        1: {
          specialComments: false,
        },
      },
    };

    plugins.push(postcssClean(cleanCssOptions));

    return plugins;
  },

  // Are we building (as opposed to local serve)
  isProduction() {
    return process.env.NODE_ENV === 'production';
  },

  // Compile the css source file to docs
  async compile(source) {
    const rawContent = await helper.readFile(source);
    const relativePath = path.relative('./src', source);
    const destination = `./dist/${relativePath}`;

    const plugins = this.postcssPlugins();
    const result = await postcss(plugins).process(rawContent, {
      from: source,
      to: destination,
    });
    await helper.writeFile(destination, result.css);
  },

  // Compile all css files
  async run() {
    const cssFiles = await helper.getFiles('style.css');

    await pMap(cssFiles, async filepath => {
      await this.compile(filepath);
    });
  },

  // Listen to changes in css files and rebuild them
  watch() {
    // Rebuild main file when changed
    helper.watch('./src/style.css', filepath => {
      this.compile(filepath);
    });
    // Rebuild main file when includes are changed
    helper.watch('./src/_styles/*.css', () => {
      this.compile('./src/style.css');
    });
    // Rebuild all files when main tailwind config is changed
    helper.watch('./tailwind.config.js', () => {
      this.run();
    });
  },
};
