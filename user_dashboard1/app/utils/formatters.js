/**
 * Formats a number as INR (Indian Rupee) string without the currency symbol.
 * @param {number} amount 
 * @returns {string}
 */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN').format(amount)
}
