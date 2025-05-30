// Locale-sensitive text segmentation
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter
const segmenter = new Intl.Segmenter([], {
  granularity: 'word'
})

/**
 * Regular expression to match Unicode characters that should be normalized.
 *
 * @type {RegExp}
 */
const UNICODE_CHARS = /[“”‘’]/g

/**
 * Mapping of Unicode characters to their ASCII approximations.
 *
 * @type {Object<string, string>}
 */
const UNICODE_MAP = {
  '“': '"',
  '”': '"',
  '‘': "'",
  '’': "'",
}

/**
 * This class provides the functionality to match strings,
 * similarly to macOS menu search.
 *
 * App menus: https://support.apple.com/en-gb/guide/mac-help/mchlp1446/mac#apdee3084317a564
 */
class StringMatcher {
  /**
   * Creates a new string matcher with the given query.
   *
   * @param {string} query
   */
  constructor(query) {
    this.queryList = tokenize(query)
  }

  /**
   * Returns true if there is a match; false otherwise.
   *
   * @param {string} string
   * @returns {boolean}
   */
  matches(string) {
    const stringList = tokenize(string)
    return this.queryList.every((query) =>
      stringList.some((string) =>
        string.startsWith(query)
      )
    )
  }
}

/**
 * Normalizes a string by replacing Unicode characters with their ASCII equivalents.
 *
 * @param {string} string
 * @returns {string}
 */
function normalize(string) {
  return string
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(UNICODE_CHARS, char => UNICODE_MAP[char])
}

/**
 * Returns a list of tokens.
 *
 * @param {string} string
 * @returns {string[]}
 */
function tokenize(string) {
  return Array
    .from(
      segmenter.segment(
        normalize(string).toLowerCase()
      )
    )
    .filter((segment) =>
      segment.isWordLike
    )
    .map((segment) =>
      segment.segment
    )
}

export default StringMatcher
