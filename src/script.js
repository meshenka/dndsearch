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

function hitTemplate(item) {
  return `
  <div class="w-100 mr-3">
    <div class="flex flcnw border-b-1 border-r-1 border-black-pure">
      <div>Page ${item.pageIndex}</div>
      <div>${highlight(item, 'content')}</div>
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
