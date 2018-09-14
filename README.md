# dndsearch

- Split the large file into one file per page (pdf-split)
- Extract textual content of each page using Apache Tika (make sure you have all
  the fonts, it will make text recognition better, otherwise you'll have blanks
  in the middle of text)


# TODO

- Extract each script (pdf-page-count, pdf-split, pdf-extract-text) into their
  own npm package, exposing both a command line and a script interface

