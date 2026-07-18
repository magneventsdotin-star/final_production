
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN').format(amount)
}
