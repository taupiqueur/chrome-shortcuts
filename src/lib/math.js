// This module contains mathematical functions.

// Returns the remainder of a division.
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder
export function modulo(dividend, divisor) {
  return ((dividend % divisor) + divisor) % divisor
}

// Clamps a value between *min* and *max*.
// Reference: https://crystal-lang.org/api/master/Comparable.html#clamp(min,max)-instance-method
export function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max))
}
