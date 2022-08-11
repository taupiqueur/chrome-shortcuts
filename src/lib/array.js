// This module contains additional `Array` functions.
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array

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
