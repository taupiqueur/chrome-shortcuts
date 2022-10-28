// This module contains additional `Array` functions.
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array

// Returns a `Tuple` with two arrays.
// The first one contains the elements in the collection for which the passed block is truthy,
// and the second one those for which the block is falsy.
// Reference: https://crystal-lang.org/api/master/Enumerable.html#:~:text=#partition
export function partition(array, predicate) {
  return array.reduce((partition, element) => (
    partition[predicate(element) ? 0 : 1].push(element),
    partition
  ), [[], []])
}

// Returns an `Array` that enumerates over the items, chunking them together based on the return value of the block.
// Consecutive elements which return the same block value are chunked together.
// Reference: https://crystal-lang.org/api/master/Enumerable.html#:~:text=#chunks
export function chunk(array, callback) {
  const chunks = []
  let lastKey
  for (const element of array) {
    const key = callback(element)
    if (key === lastKey) {
      chunks.at(-1).at(1).push(element)
    } else {
      lastKey = key
      chunks.push([key, [element]])
    }
  }
  return chunks
}
