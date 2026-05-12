import { describe, it, expect } from 'vitest'
import { calcItemTotal, calcSubtotal, calcTax, calcGrandTotal, formatCurrency } from '../lib/calc'

describe('calcItemTotal', () => {
  it('multiplies qty by price', () => {
    expect(calcItemTotal(3, 15000)).toBe(45000)
  })
  it('handles decimal qty', () => {
    expect(calcItemTotal(1.5, 1000)).toBe(1500)
  })
  it('returns 0 when qty is 0', () => {
    expect(calcItemTotal(0, 15000)).toBe(0)
  })
})

describe('calcSubtotal', () => {
  it('sums cash totals', () => {
    const items = [
      { qty: 2, cash_price: 10000, card_price: 11000 },
      { qty: 1, cash_price: 5000,  card_price: 5500 },
    ]
    expect(calcSubtotal(items, 'cash_price')).toBe(25000)
  })
  it('sums card totals', () => {
    const items = [
      { qty: 2, cash_price: 10000, card_price: 11000 },
      { qty: 1, cash_price: 5000,  card_price: 5500 },
    ]
    expect(calcSubtotal(items, 'card_price')).toBe(27500)
  })
  it('returns 0 for empty array', () => {
    expect(calcSubtotal([], 'cash_price')).toBe(0)
  })
})

describe('calcTax', () => {
  it('calculates 5% tax', () => {
    expect(calcTax(100000, 5)).toBe(5000)
  })
  it('returns 0 when rate is 0', () => {
    expect(calcTax(100000, 0)).toBe(0)
  })
})

describe('calcGrandTotal', () => {
  it('adds subtotal and tax', () => {
    expect(calcGrandTotal(100000, 5000)).toBe(105000)
  })
})

describe('formatCurrency', () => {
  it('formats with commas', () => {
    expect(formatCurrency(1234567)).toBe('1,234,567')
  })
  it('handles 0', () => {
    expect(formatCurrency(0)).toBe('0')
  })
})
