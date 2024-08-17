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
    this.queryList = StringMatcher.tokenize(query)
  }

  /**
   * Returns true if there is a match; false otherwise.
   *
   * @param {string} string
   * @returns {boolean}
   */
  matches(string) {
    const stringList = StringMatcher.tokenize(string)
    return this.queryList.every((query) =>
      stringList.some((string) =>
        string.startsWith(query)
      )
    )
  }

  /**
   * Removes diacritics from string.
   *
   * @param {string} string
   * @returns {string}
   */
  static normalize(string) {
    return string.normalize('NFD').replace(/\p{Diacritic}/gu, '')
  }

  /**
   * Returns a list of tokens.
   *
   * @param {string} string
   * @returns {string[]}
   */
  static tokenize(string) {
    return StringMatcher.normalize(string).toLowerCase().split(/\s/)
  }
}

export default StringMatcher
