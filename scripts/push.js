/* eslint-disable no-process-exit */
import firost from 'firost';
import pMap from 'p-map';
import indexing from 'algolia-indexing';
indexing.verbose();

const credentials = {
  appId: 'O3F8QXYK6R',
  apiKey: process.env.ALGOLIA_WRITE_API_KEY,
  indexName: 'dndsearch',
};
const settings = {
  searchableAttributes: ['content'],
  customRanking: [
    'desc(isTitle)',
    'desc(isText)',
    'asc(pageIndex)',
    'asc(positionInPage)',
  ],
  attributesForFaceting: ['bookName'],
  distinct: 3,
  attributeForDistinct: 'distinctKey',
  highlightPreTag: '<span class="ais-highlight">',
  highlightPostTag: '</span>',
};

(async () => {
  try {
    const recordFiles = await firost.glob('./records/*.json');
    const records = [];
    await pMap(recordFiles, async recordPath => {
      const thoseRecords = await firost.readJson(recordPath);
      records.push(...thoseRecords);
    });

    await indexing.fullAtomic(credentials, records, settings);
  } catch (err) {
    console.info(err);
  }
})();
