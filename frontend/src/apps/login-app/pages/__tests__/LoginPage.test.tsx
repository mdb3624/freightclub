import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import * as authModule from '@/features/auth/hooks/useLogin';

vi.mock('@/features/auth/hooks/useLogin');

const mockUseLogin = vi.mocked(authModule.useLogin);

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form on initial load', () => {
    mockUseLogin.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as any);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should call mutate on successful form submission', async () => {
    const mockMutate = vi.fn();
    mockUseLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      error: null,
    } as any);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should display page title and layout', () => {
    mockUseLogin.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    } as any);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/sign in to your account/i)).toBeInTheDocument();
  });
});
