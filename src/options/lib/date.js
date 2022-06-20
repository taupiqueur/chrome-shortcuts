// This module contains date-time functions.
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date

// Returns the ISO date portion of the specified date.
export function getISODateString(date) {
  return date.toLocaleDateString('en-CA')
}
