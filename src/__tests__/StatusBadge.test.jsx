import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatusBadge from '../components/StatusBadge'

describe('StatusBadge', () => {
  it('renders draft', () => {
    render(<StatusBadge status="draft" />)
    expect(screen.getByText('草稿')).toBeInTheDocument()
  })
  it('renders sent', () => {
    render(<StatusBadge status="sent" />)
    expect(screen.getByText('已送出')).toBeInTheDocument()
  })
  it('renders deal', () => {
    render(<StatusBadge status="deal" />)
    expect(screen.getByText('已成交')).toBeInTheDocument()
  })
  it('renders expired', () => {
    render(<StatusBadge status="expired" />)
    expect(screen.getByText('已過期')).toBeInTheDocument()
  })
})
