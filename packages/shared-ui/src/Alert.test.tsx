import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Alert } from './Alert'

describe('Alert', () => {
  it('renders default error variant correctly', () => {
    render(<Alert>Error message</Alert>)
    const alertElement = screen.getByRole('alert')

    expect(alertElement).toBeInTheDocument()
    expect(alertElement).toHaveTextContent('Error message')
    expect(alertElement).toHaveClass('border-red-200 bg-red-50 text-red-700')
  })

  it('renders success variant correctly', () => {
    render(<Alert variant="success">Success message</Alert>)
    const alertElement = screen.getByRole('alert')

    expect(alertElement).toBeInTheDocument()
    expect(alertElement).toHaveTextContent('Success message')
    expect(alertElement).toHaveClass('border-green-200 bg-green-50 text-green-700')
  })
})
