import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it('renders input field with placeholder', () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    const input = screen.getByPlaceholderText(/Search by Load ID or destination city/)
    expect(input).toBeInTheDocument()
  })

  it('updates input value on change', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<SearchBar onSearch={onSearch} />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.type(input, 'Load123')
    expect(input.value).toBe('Load123')
  })

  it('debounces search callback', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<SearchBar onSearch={onSearch} />)
    const input = screen.getByRole('textbox')

    await user.type(input, 'test')
    expect(onSearch).not.toHaveBeenCalled()

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test')
    }, { timeout: 500 })
  })

  it('cancels previous timeout on rapid input', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<SearchBar onSearch={onSearch} />)
    const input = screen.getByRole('textbox') as HTMLInputElement

    await user.type(input, 'Lo', { delay: 50 })
    await user.type(input, 'ad', { delay: 50 })

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledTimes(1)
      expect(onSearch).toHaveBeenCalledWith('Load')
    }, { timeout: 500 })
  })

  it('calls onSearch with empty string when cleared', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<SearchBar onSearch={onSearch} />)
    const input = screen.getByRole('textbox') as HTMLInputElement

    await user.type(input, 'test')
    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test')
    })

    onSearch.mockClear()
    await user.clear(input)

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('')
    }, { timeout: 500 })
  })
})
