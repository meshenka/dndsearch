# dndsearch

This repository contains code to quickly search into the D&D5th edition source
books. When you're DMing and need to quickly look up some rule in your books,
you don't want to let the action settle. This tools will help you quickly check
which page of which book you need to open.

_This does not replace your books. You **need** the books. It will make finding
relevant information in them faster._

# Usage

Run `yarn run export ./path-to-your-book.pdf`. It will split it into several smaller
PDF files, take screenshots of each page, extract textual data and convert them
to a JSON file in `./records/`.

Run `yarn run push` to push all the generated JSON files to Algolia.

Run `yarn run serve` to check a local version of the website and `yarn run
build` to generate the files in the `./dist` folder.

# Structure

`./scripts` contains all the scripts called by `yarn run`. The
`./scripts/website` specifically contains the scripts related the front-end
part.

`./lib` contains all the code related to converting the PDF files to JSON
records. JSON files are extracted into `./records` and a `./tmp` folder is used
for caching results.

`./src` contains all the front-end code. Final website is written to `./dist`.


