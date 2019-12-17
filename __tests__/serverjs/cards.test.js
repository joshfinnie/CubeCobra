/* eslint-disable no-underscore-dangle */
const carddb = require('../../serverjs/cards');

const fixturesPath = 'fixtures';
const firstLetterCount = 21;
const fixtureCardCount = 99;
const placeholderCard = {
  set: '',
  collector_number: '',
  promo: false,
  digital: false,
  full_name: 'Invalid Card',
  name: 'Invalid Card',
  name_lower: 'Invalid Card',
  artist: '',
  scryfall_uri: '',
  rarity: '',
  legalities: {},
  oracle_text: '',
  image_normal: 'https://img.scryfall.com/errors/missing.jpg',
  cmc: 0,
  type: '',
  colors: [],
  color_identity: [],
  parsed_cost: [],
  colorcategory: 'c',
  error: true,
};

afterEach(() => {
  carddb.unloadCardDb();
});

test('initializeCardDb loads files properly', () => {
  expect.assertions(6);
  const promise = carddb.initializeCardDb(fixturesPath, true);
  return promise.then(() => {
    expect(Object.keys(carddb.cardtree).length).toBe(firstLetterCount);
    expect(Object.keys(carddb.imagedict).length).toBe(fixtureCardCount);
    expect(Object.keys(carddb.cardimages).length).toBe(fixtureCardCount);
    expect(carddb.cardnames.length).toBe(fixtureCardCount);
    expect(Object.keys(carddb.full_names).length).toBe(firstLetterCount);
    expect(Object.keys(carddb.nameToId).length).toBe(fixtureCardCount);
  });
});

test('unloadCardDb unloads the card database correctly', () => {
  expect.assertions(6);
  const promise = carddb.initializeCardDb(fixturesPath, true);
  return promise.then(() => {
    carddb.unloadCardDb();
    expect(carddb.cardtree).toBe(undefined);
    expect(carddb.imagedict).toBe(undefined);
    expect(carddb.cardimages).toBe(undefined);
    expect(carddb.cardnames).toBe(undefined);
    expect(carddb.full_names).toBe(undefined);
    expect(carddb.nameToId).toBe(undefined);
  });
});

test('cardFromId returns a well-formed card object', () => {
  expect.assertions(1);
  const _id = 'ee4d196e-7ce4-4dc1-9d58-102a89aca2a4';
  const expected = {
    _id: 'ee4d196e-7ce4-4dc1-9d58-102a89aca2a4',
    art_crop: 'https://img.scryfall.com/cards/art_crop/front/e/e/ee4d196e-7ce4-4dc1-9d58-102a89aca2a4.jpg?1571746204',
    artist: 'Dmitry Burmak',
    border_color: 'black',
    cmc: 4,
    collector_number: '356',
    color_identity: ['B'],
    colorcategory: 'b',
    colors: ['B'],
    digital: false,
    full_name: 'Rankle, Master of Pranks [celd-356]',
    full_name: 'Rankle, Master of Pranks [eld-356]',
    image_normal: 'https://img.scryfall.com/cards/normal/front/e/e/ee4d196e-7ce4-4dc1-9d58-102a89aca2a4.jpg?1571746204',
    image_small: 'https://img.scryfall.com/cards/small/front/e/e/ee4d196e-7ce4-4dc1-9d58-102a89aca2a4.jpg?1571746204',
    isToken: false,
    legalities: {
      Legacy: true,
      Modern: true,
      Pauper: false,
      Standard: true,
    },
    name: 'Rankle, Master of Pranks',
    name_lower: 'rankle, master of pranks',
    oracle_text:
      'Flying, haste\nWhenever Rankle, Master of Pranks deals combat damage to a player, choose any number —\n• Each player discards a card.\n• Each player loses 1 life and draws a card.\n• Each player sacrifices a creature.',
    parsed_cost: ['b', 'b', '2'],
    power: '3',
    promo: true,
    rarity: 'mythic',
    scryfall_uri: 'https://scryfall.com/card/eld/356/rankle-master-of-pranks?utm_source=api',
    set: 'eld',
    tcgplayer_id: 198372,
    toughness: '3',
    type: 'Legendary Creature — Faerie Rogue',
  };
  const promise = carddb.initializeCardDb(fixturesPath, true);
  return promise.then(() => {
    const result = carddb.cardFromId(_id);
    expect(result).toEqual(expected);
  });
});

test('cardFromId returns a placeholder card object when given a nonexistent ID', () => {
  expect.assertions(1);
  const _id = 'not real';
  const expected = placeholderCard;
  expected._id = _id;
  const promise = carddb.initializeCardDb(fixturesPath, true);
  return promise.then(() => {
    const result = carddb.cardFromId(_id);
    expect(result).toEqual(expected);
  });
});

test('getCardDetails returns a well-formed card object', () => {
  expect.assertions(1);
  const _id = 'ee4d196e-7ce4-4dc1-9d58-102a89aca2a4';
  const expected = {
    _id: 'ee4d196e-7ce4-4dc1-9d58-102a89aca2a4',
    art_crop: 'https://img.scryfall.com/cards/art_crop/front/e/e/ee4d196e-7ce4-4dc1-9d58-102a89aca2a4.jpg?1571746204',
    artist: 'Dmitry Burmak',
    border_color: 'black',
    cmc: 4,
    collector_number: '356',
    color_identity: ['B'],
    colorcategory: 'b',
    colors: ['B'],
    digital: false,
    display_image:
      'https://img.scryfall.com/cards/normal/front/e/e/ee4d196e-7ce4-4dc1-9d58-102a89aca2a4.jpg?1571746204',
    full_name: 'Rankle, Master of Pranks [eld-356]',
    image_normal: 'https://img.scryfall.com/cards/normal/front/e/e/ee4d196e-7ce4-4dc1-9d58-102a89aca2a4.jpg?1571746204',
    image_small: 'https://img.scryfall.com/cards/small/front/e/e/ee4d196e-7ce4-4dc1-9d58-102a89aca2a4.jpg?1571746204',
    isToken: false,
    legalities: {
      Legacy: true,
      Modern: true,
      Pauper: false,
      Standard: true,
    },
    name: 'Rankle, Master of Pranks',
    name_lower: 'rankle, master of pranks',
    oracle_text:
      'Flying, haste\nWhenever Rankle, Master of Pranks deals combat damage to a player, choose any number —\n• Each player discards a card.\n• Each player loses 1 life and draws a card.\n• Each player sacrifices a creature.',
    parsed_cost: ['b', 'b', '2'],
    power: '3',
    promo: true,
    rarity: 'mythic',
    scryfall_uri: 'https://scryfall.com/card/eld/356/rankle-master-of-pranks?utm_source=api',
    set: 'eld',
    tcgplayer_id: 198372,
    toughness: '3',
    type: 'Legendary Creature — Faerie Rogue',
  };
  const promise = carddb.initializeCardDb(fixturesPath, true);
  return promise.then(() => {
    const result = carddb.getCardDetails({
      cardID: _id,
    });
    expect(result).toEqual(expected);
  });
});

test('getCardDetails returns a placeholder card object when given a nonexistent ID', () => {
  expect.assertions(1);
  const _id = 'not real';
  const expected = placeholderCard;
  expected._id = _id;
  const promise = carddb.initializeCardDb(fixturesPath, true);
  return promise.then(() => {
    const result = carddb.getCardDetails({
      cardID: _id,
    });
    expect(result).toEqual(expected);
  });
});

test('normalizedName normalized ascii correctly', () => {
  const rawName = 'Garruk, Primal Hunter';
  const expected = 'garruk, primal hunter';
  const result = carddb.normalizedName({
    name: rawName,
  });
  expect(result).toBe(expected);
});

test('normalizedName normalizes unicode correctly', () => {
  const rawName = 'Ætherspouts';
  const expected = 'ætherspouts';
  const result = carddb.normalizedName({
    name: rawName,
  });
  expect(result).toBe(expected);
});

test('allIds correctly maps a cardname to an ID', () => {
  expect.assertions(2);
  const promise = carddb.initializeCardDb(fixturesPath, true);
  return promise.then(() => {
    const expected = 'ee4d196e-7ce4-4dc1-9d58-102a89aca2a4';
    const result = carddb.allIds({
      name: 'Rankle, Master of Pranks',
    });
    expect(result.length).toBe(1);
    expect(result[0]).toBe(expected);
  });
});

test('loadJSONFile loads a JSON file into the correct attribute', () => {
  expect.assertions(1);
  const attribute = 'testAttribute';
  return carddb.loadJSONFile(`${fixturesPath}/names.json`, attribute).then(() => {
    expect(carddb[attribute].length).toBe(fixtureCardCount);
  });
});

test('getPlaceholderCard', () => {
  const _id = 'abckggght';
  const expected = placeholderCard;
  expected._id = _id;
  expect(carddb.getPlaceholderCard(_id)).toEqual(expected);
});
