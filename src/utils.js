// This module contains various utility functions.

/**
 * Creates a new range with *step*.
 *
 * https://hexdocs.pm/elixir/1.16.0/Range.html
 *
 * @param {number} begin
 * @param {number} end
 * @param {number} [step]
 * @returns {number[]}
 */
export function range(begin, end, step = end >= begin ? 1 : -1) {
  return Array.from({ length: (end - begin) / step + 1 }, (_, index) =>
    begin + index * step
  )
}

/**
 * Takes the elements from the beginning of the enumerable
 * while the function returns a truthy value.
 *
 * https://hexdocs.pm/elixir/1.16.0/Enum.html#take_while/2
 *
 * @template Element
 * @param {Array<Element>} array
 * @param {(element: Element) => boolean} predicate
 * @returns {Array<Element>}
 */
export function takeWhile(array, predicate) {
  const index = array.findIndex(
    (element) => !predicate(element)
  )

  return index === -1
    ? []
    : array.slice(0, index)
}

/**
 * Drops elements at the beginning of the enumerable
 * while the function returns a truthy value.
 *
 * https://hexdocs.pm/elixir/1.16.0/Enum.html#drop_while/2
 *
 * @template Element
 * @param {Array<Element>} array
 * @param {(element: Element) => boolean} predicate
 * @returns {Array<Element>}
 */
export function dropWhile(array, predicate) {
  const index = array.findIndex(
    (element) => !predicate(element)
  )

  return index === -1
    ? array
    : array.slice(index)
}

/**
 * Splits enumerable in two at the position of the element for which the function
 * returns a falsy value for the first time.
 * It returns a two-element tuple with two lists of elements.
 * The element that triggered the split is part of the second list.
 *
 * https://hexdocs.pm/elixir/1.16.0/Enum.html#split_while/2
 *
 * @template Element
 * @param {Array<Element>} array
 * @param {(element: Element) => boolean} predicate
 * @returns {[Array<Element>, Array<Element>]}
 */
export function splitWhile(array, predicate) {
  const index = array.findIndex(
    (element) => !predicate(element)
  )

  return index === -1
    ? [array, []]
    : [array.slice(0, index), array.slice(index)]
}

/**
 * Returns an array that enumerates over the items,
 * chunking them together based on the return value of the block.
 * Consecutive elements which return the same block value are chunked together.
 *
 * https://crystal-lang.org/api/master/Enumerable.html#chunks(&block:T-%3EU)forallU-instance-method
 *
 * @template Element,Result
 * @param {Array<Element>} array
 * @param {(element: Element) => Result} callback
 * @returns {[Result, Array<Element>][]}
 */
export function chunk(array, callback) {
  if (array.length === 0) {
    return []
  }

  const chunks = [
    [
      callback(array[0]), [array[0]]
    ]
  ]

  for (const element of array.slice(1)) {
    const [lastKey, chunkedValues] = chunks.at(-1)

    const key = callback(element)

    if (key === lastKey) {
      chunkedValues.push(element)
    } else {
      const newChunk = [
        key, [element]
      ]
      chunks.push(newChunk)
    }
  }

  return chunks
}

/**
 * Returns the remainder of a division.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
 *
 * @param {number} dividend
 * @param {number} divisor
 * @returns {number}
 */
export function modulo(dividend, divisor) {
  return ((dividend % divisor) + divisor) % divisor
}

/**
 * Clamps a value between *min* and *max*.
 *
 * https://crystal-lang.org/api/master/Comparable.html#clamp(min,max)-instance-method
 *
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Returns the ISO date portion of the specified date.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
 *
 * @param {Date} date
 * @returns {string}
 */
export function getISODateString(date) {
  return date.toLocaleDateString('en-CA')
}
