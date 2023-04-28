export const getGridDrafterState = ({ gridDraft, seatNumber }) => {
  const { cards, InitialState } = gridDraft;
  const numPacks = gridDraft.InitialState.length;
  const seatNum = parseInt(seatNumber, 10);
  let curStep = 0;
  const seen = [];
  const pickedIndices = [gridDraft.seats[0].pickedIndices, gridDraft.seats[1].pickedIndices];
  let curPickNum = 0;
  const pickedNums = [0, 0];
  let currentPicker = 0;
  let cardsInPack = InitialState[0];
  let packNum = 0;

  if (currentPicker === seatNum) {
    seen.push(...cardsInPack);
  }

  while (packNum < numPacks && pickedIndices[currentPicker].length > pickedNums[currentPicker]) {
    cardsInPack = InitialState[packNum].slice();
    cardsInPack[pickedIndices[currentPicker][pickedNums[currentPicker]]] = null;
    cardsInPack[pickedIndices[currentPicker][pickedNums[currentPicker] + 1]] = null;
    cardsInPack[pickedIndices[currentPicker][pickedNums[currentPicker] + 2]] = null;
    pickedNums[currentPicker] += 3;

    currentPicker = (currentPicker + 1) % 2;
    curStep += 1;

    if (currentPicker === seatNum) {
      curPickNum += 1;
      seen.push(...cardsInPack.filter((x) => x || x === 0));
    }

    if (pickedIndices[currentPicker].length > pickedNums[currentPicker]) {
      const firstPicked = pickedIndices[currentPicker][pickedNums[currentPicker]];
      const secondPicked = pickedIndices[currentPicker][pickedNums[currentPicker] + 1];
      pickedNums[currentPicker] += 2;

      // This is the second pick plus the difference between the second and first picks.
      const thirdPicked = 2 * secondPicked - firstPicked;
      if (thirdPicked < 9 && cardsInPack[thirdPicked] !== null) {
        pickedNums[currentPicker] += 1;
      }
      if (currentPicker === seatNum) curPickNum += 1;
      curStep += 1;
      packNum += 1;
      if (packNum < numPacks && currentPicker === seatNum) {
        seen.push(...gridDraft.InitialState[packNum]);
        cardsInPack = InitialState[packNum].slice();
      }
    } else {
      // packNum += 1;
      break;
    }
  }

  return {
    // Note this currently includes all cards. Having this just include cards from open
    // packs would prevent cheating.
    cards,
    picked: gridDraft.seats[seatNum].pickorder.slice(0, pickedNums[seatNum]),
    basics: gridDraft.basics,
    seen,
    cardsInPack,
    packNum,
    pickNum: currentPicker === packNum % 2 ? 0 : 1,
    numPacks,
    packSize: 2,
    pickedNum: pickedNums[seatNum],
    stepNumber: curStep,
    pickNumber: curPickNum,
    turn: currentPicker === seatNum && packNum < numPacks,
  };
};

const GRID_DRAFT_OPTIONS = [0, 1, 2]
  .map((ind) => [[0, 1, 2].map((offset) => 3 * ind + offset), [0, 1, 2].map((offset) => ind + 3 * offset)])
  .flat(1);

export const calculateGridBotPick = (drafterState) => {
  const { cardsInPack, cards } = drafterState;

  const elos = cardsInPack.map((index) => (index ? cards[index].details.elo : 0));

  // get the index with the highest sum elo
  const optionElos = GRID_DRAFT_OPTIONS.map((option) => option.map((index) => elos[index]).reduce((a, b) => a + b, 0));

  const best = optionElos.map((elo, index) => [elo, index]).sort((a, b) => b[0] - a[0])[0][1];

  console.log(best);

  return GRID_DRAFT_OPTIONS[best].map((x) => [cardsInPack[x], x]).filter(([x]) => x !== null);
};
