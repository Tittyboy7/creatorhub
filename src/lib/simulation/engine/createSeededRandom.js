export default function createSeededRandom(seed) {
  let state = Number(seed) || 1;

  return function seededRandom() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;

    let value = Math.imul(
      state ^ (state >>> 15),
      1 | state
    );

    value =
      value +
      Math.imul(
        value ^ (value >>> 7),
        61 | value
      ) ^
      value;

    return (
      ((value ^ (value >>> 14)) >>> 0) /
      4294967296
    );
  };
}