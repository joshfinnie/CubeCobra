/* eslint-disable no-underscore-dangle */
const sinon = require('sinon');

const cubefn = require('../../serverjs/cubefn');
const carddb = require('../../serverjs/cards');
const cubefixture = require('../../fixtures/examplecube');
const landsfixture = require('../../fixtures/examplelands');
const Cube = require('../../models/cube');

const fixturesPath = 'fixtures';

beforeEach(() => {
  sinon.stub(Cube, 'findOne');
});

afterEach(() => {
  Cube.findOne.restore();
  carddb.unloadCardDb();
});

test('get_cube_id returns urlAlias when defined', () => {
  const testCube = {
    urlAlias: 'a',
    shortID: 'bbb',
    _id: 'c',
  };
  const result = cubefn.get_cube_id(testCube);
  expect(result).toBe(testCube.urlAlias);
});

test('get_cube_id returns shortId when urlAlias is not present', () => {
  const testCube = {
    shortID: 'bbb',
    _id: 'c',
  };
  const result = cubefn.get_cube_id(testCube);
  expect(result).toBe(testCube.shortID);
});

test('get_cube_id returns _id when other ID fields are not present', () => {
  const testCube = {
    _id: 'c',
  };
  const result = cubefn.get_cube_id(testCube);
  expect(result).toBe(testCube._id);
});

test('build_id_query returns a simple query when passed a 24-character alphanumeric string', () => {
  const testId = 'a1a1a1a1a1a1a1a1a1a1a1a1';
  const result = cubefn.build_id_query(testId);
  expect(result._id).toBe(testId);
});

test('build_id_query returns a boolean query when passed a non-alphanumeric string', () => {
  const testId = 'a1a-a1a1a1a1a1a1a1a1a1a1';
  const result = cubefn.build_id_query(testId);
  const condition = result.$or;
  expect(condition.length).toBe(2);
  expect(condition[0].shortID).toBe(testId);
  expect(condition[1].urlAlias).toBe(testId);
});

test('cardsAreEquivalent returns true for two equivalent cards', () => {
  const testCard1 = {
    cardID: 'abcdef',
    status: 'Owned',
    cmc: 1,
    type_line: 'Creature - Hound',
    tags: ['New'],
    colors: ['W'],
    randomField: 'y',
    finish: 'Foil',
  };
  const testCard2 = JSON.parse(JSON.stringify(testCard1));
  const result = cubefn.cardsAreEquivalent(testCard1, testCard2);
  expect(result).toBe(true);
});

test('cardsAreEquivalent returns false for two nonequivalent cards', () => {
  const testCard1 = {
    cardID: 'abcdef',
    status: 'Owned',
    cmc: 1,
    type_line: 'Creature - Hound',
    tags: ['New'],
    colors: ['W'],
    randomField: 'y',
  };
  const testCard2 = JSON.parse(JSON.stringify(testCard1));
  testCard2.cmc = 2;
  const result = cubefn.cardsAreEquivalent(testCard1, testCard2);
  expect(result).toBe(false);
});

test('intToLegality returns the expected values', () => {
  expect(cubefn.intToLegality(0)).toBe('Vintage');
  expect(cubefn.intToLegality(1)).toBe('Legacy');
  expect(cubefn.intToLegality(2)).toBe('Modern');
  expect(cubefn.intToLegality(3)).toBe('Standard');
  expect(cubefn.intToLegality(4)).toBe(undefined);
});

test('legalityToInt returns the expected values', () => {
  expect(cubefn.legalityToInt('Vintage')).toBe(0);
  expect(cubefn.legalityToInt('Legacy')).toBe(1);
  expect(cubefn.legalityToInt('Modern')).toBe(2);
  expect(cubefn.legalityToInt('Standard')).toBe(3);
  expect(cubefn.legalityToInt('not a format')).toBe(undefined);
});

test('generate_short_id returns a valid short ID', async () => {
  const dummyModel = {
    shortID: '1x',
    urlAlias: 'a real alias',
  };
  const queryMockPromise = new Promise((resolve, reject) => {
    process.nextTick(() => {
      resolve([dummyModel]);
    });
  });
  const queryMock = jest.fn();
  queryMock.mockReturnValue(queryMockPromise);
  const initialCubeFind = Cube.find;
  Cube.find = queryMock;
  const result = await cubefn.generate_short_id();
  expect(result).toBe('1y');
  Cube.find = initialCubeFind;
});

test('getBasics returns the expected set of basic lands', () => {
  const basicLands = ['Plains', 'Island', 'Swamp', 'Mountain', 'Forest'];
  const mockNameToId = {
    plains: ['1d7dba1c-a702-43c0-8fca-e47bbad4a00f'],
    mountain: ['42232ea6-e31d-46a6-9f94-b2ad2416d79b'],
    forest: ['19e71532-3f79-4fec-974f-b0e85c7fe701'],
    swamp: ['8365ab45-6d78-47ad-a6ed-282069b0fabc'],
    island: ['0c4eaecf-dd4c-45ab-9b50-2abe987d35d4'],
  };
  const expectedDisplayImages = {
    plains: 'https://img.scryfall.com/cards/normal/front/1/d/1d7dba1c-a702-43c0-8fca-e47bbad4a00f.jpg?1565989378',
    mountain: 'https://img.scryfall.com/cards/normal/front/4/2/42232ea6-e31d-46a6-9f94-b2ad2416d79b.jpg?1565989372',
    forest: 'https://img.scryfall.com/cards/normal/front/1/9/19e71532-3f79-4fec-974f-b0e85c7fe701.jpg?1565989358',
    swamp: 'https://img.scryfall.com/cards/normal/front/8/3/8365ab45-6d78-47ad-a6ed-282069b0fabc.jpg?1565989387',
    island: 'https://img.scryfall.com/cards/normal/front/0/c/0c4eaecf-dd4c-45ab-9b50-2abe987d35d4.jpg?1565989364',
  };
  const mockCarddict = {};
  const expected = {};
  let exampleLand;
  let expectedLandObject;
  basicLands.forEach((name) => {
    mockCarddict[mockNameToId[name.toLowerCase()]] = landsfixture.exampleBasics[name.toLowerCase()];
    exampleLand = landsfixture.exampleBasics[name.toLowerCase()];
    expectedLandObject = {
      // copy necessary because getBasics modifies carddb (bad)
      details: JSON.parse(JSON.stringify(exampleLand)),
    };
    expectedLandObject.details.display_image = expectedDisplayImages[name.toLowerCase()];
    expected[name] = expectedLandObject;
  });
  const initialCarddict = carddb._carddict;
  const initialNameToId = carddb.nameToId;

  carddb._carddict = mockCarddict;
  carddb.nameToId = mockNameToId;

  const result = cubefn.getBasics(carddb);
  expect(result).toEqual(expected);
  basicLands.forEach((name) => {
    expect(result[name].details).toEqual(expected[name].details);
  });

  carddb._carddict = initialCarddict;
  carddb.nameToId = initialNameToId;
});

test('setCubeType correctly sets the type and card_count of its input cube', () => {
  expect.assertions(4);
  const exampleCube = JSON.parse(JSON.stringify(cubefixture.exampleCube));
  const promise = carddb.initializeCardDb(fixturesPath, true);
  return promise.then(() => {
    const result = cubefn.setCubeType(exampleCube, carddb);
    expect(result.card_count).toBe(exampleCube.cards.length);
    expect(result.type).toBe('Standard');
    expect(exampleCube.card_count).toBe(exampleCube.cards.length);
    expect(exampleCube.type).toBe('Standard');
  });
});

test('sanitize allows the correct tags', () => {
  const exampleHtml =
    '<html><head></head><body><div>lkgdfsge</div><strong>kjggggsgggg</strong><ol><li>gfgwwerer</li></ol></body></html>';
  const expected = '<div>lkgdfsge</div><strong>kjggggsgggg</strong><ol><li>gfgwwerer</li></ol>';
  const result = cubefn.sanitize(exampleHtml);
  expect(result).toBe(expected);
});

test('addAutocard correctly replaces autocard format strings', () => {
  expect.assertions(1);
  const promise = carddb.initializeCardDb(fixturesPath, true);
  return promise.then(() => {
    const exampleHtml = '<div>lkgdfsge</div><strong>[[Embercleave]]</strong><ol><li>gfgwwerer</li></ol>';
    const expected =
      '<div>lkgdfsge</div><strong><a class="autocard" card="https://img.scryfall.com/cards/normal/front/9/3/939b8bcc-b9ac-4d8c-9db4-2bf91a853f03.jpg?1571537886">Embercleave</a></strong><ol><li>gfgwwerer</li></ol>';
    const result = cubefn.addAutocard(exampleHtml, carddb);
    expect(result).toBe(expected);
  });
});

test('generatePack generates a valid pack of cards', () => {
  expect.assertions(16);
  const seed = 1569704729;
  const exampleCube = JSON.parse(JSON.stringify(cubefixture.exampleCube));
  Cube.findOne.yields(null, exampleCube);
  const callback = sinon.stub();
  const promise = carddb.initializeCardDb(fixturesPath, true);
  return promise.then(() => {
    cubefn.generatePack('', carddb, seed, callback);
    const argument = callback.getCall(0).args[1];
    argument.pack.forEach((card, index) => {
      expect(card).toEqual(cubefixture.examplePack.pack[index]);
    });
    expect(argument.seed).toBe(seed);
  });
});
