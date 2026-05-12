export function calcItemTotal(qty, price) {
  return qty * price
}

export function calcSubtotal(items, priceKey) {
  return items.reduce((sum, item) => sum + calcItemTotal(item.qty, item[priceKey]), 0)
}

export function calcTax(subtotal, taxRate) {
  return subtotal * (taxRate / 100)
}

export function calcGrandTotal(subtotal, tax) {
  return subtotal + tax
}

export function formatCurrency(amount) {
  return Math.round(amount).toLocaleString('zh-TW')
}
