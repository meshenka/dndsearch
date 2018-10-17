import _ from 'lodash';

const search = instantsearch({
  appId: 'O3F8QXYK6R',
  apiKey: '952162b9152ef3ee64c4c3d287d0dc24',
  indexName: 'dndsearch',
  routing: true,
  searchParameters: {
    hitsPerPage: 9,
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
function snippet(hit, key) {
  return _.get(hit, `_snippetResult.${key}.value`, _.get(hit, key));
}

function thumbnailPath(item) {
  const imageIndex = _.get(item, 'pageIndex') + 1;
  const paddedIndex = _.padStart(imageIndex, 4, '0');
  return `./assets/thumbnails/players-handbook/${paddedIndex}.png`;
}

function content(item) {
  if (item.isTitle) {
    const title = highlight(item, 'content');
    return `<div class="ais-hits--custom-title">${title}</div>`;
  }
  return snippet(item, 'content');
}

function hitTemplate(item) {
  return `
  <div class="ais-hits--custom">
    <div 
      class="ais-hits--custom-wrapper" 
      style="background-image:url(${thumbnailPath(item)})"
    >
      <div class="ais-hits--custom-thumbnail">
        Page ${item.pageIndex}
      </div>

      <div class="ais-hits--custom-content">
        ${content(item)}
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
