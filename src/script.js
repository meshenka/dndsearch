import _ from 'lodash';

const search = instantsearch({
  appId: 'O3F8QXYK6R',
  apiKey: '952162b9152ef3ee64c4c3d287d0dc24',
  indexName: 'dndsearch',
  routing: true,
  searchParameters: {
    hitsPerPage: 15,
  },
});

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#searchbox',
    placeholder: 'Search for rules, spells, races, classes, etc',
    poweredBy: false,
    wrapInput: false,
    loadingIndicator: false,
  })
);

function highlight(hit, key) {
  return _.get(hit, `_highlightResult.${key}.value`, _.get(hit, key));
}

// There is a slight variation in number between the pdf page index and the
// real page notation
function pageNumber(item) {
  return _.get(item, 'pageIndex') + 6;
}

function thumbnailPath(item) {
  const imageIndex = _.get(item, 'pageIndex') - 1;
  const paddedIndex = _.padStart(imageIndex, 4, '0');
  return `./assets/thumbnails/players-handbook/${paddedIndex}.png`;
}

function hitTemplate(item) {
  console.info(item);
  return `
  <div class="w-100 md_w-50 border border-red-3 flex flrnw p-0x">
    <div 
      class="min-h-5 bg-4x bg-no-repeat flex flrnw flc" 
      style="background-image:url(${thumbnailPath(item)})"
    >
      <div class="ml-3x mr-0x bg-black-90 text-grey--1 rounded-2 p-1 leading-1">
        <div>Page ${pageNumber(item)}</div>
        <div>${highlight(item, 'content')}</div>
      </div>
    </div>
  </div>
  `;
}

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      item: hitTemplate,
      empty: 'Sorry, no results found',
    },
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    maxPages: 20,
    // default is to scroll to 'body', here we disable this behavior
    scrollTo: false,
    showFirstLast: false,
  })
);

search.start();
