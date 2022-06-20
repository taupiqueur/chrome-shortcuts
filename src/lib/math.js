// This module contains mathematical functions.

// Returns the remainder of a division.
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
export function modulo(dividend, divisor) {
  return ((dividend % divisor) + divisor) % divisor
}
