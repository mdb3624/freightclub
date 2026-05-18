import { useRef, FormEvent } from 'react';
import { ErrorMessage } from './ErrorMessage';

export interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => void;
  error?: string;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, error, isLoading }: LoginFormProps) {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = emailRef.current?.value.trim() || '';
    const password = passwordRef.current?.value || '';

    if (!email || !password || !email.includes('@')) {
      return;
    }

    onSubmit({ email, password });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      {error && <ErrorMessage message={error} />}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="email" style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Email
          </label>
          <input
            id="email"
            ref={emailRef}
            type="email"
            placeholder="Enter your email"
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            disabled={isLoading}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor="password" style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Password
          </label>
          <input
            id="password"
            ref={passwordRef}
            type="password"
            placeholder="Enter your password"
            style={{
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px 16px',
            backgroundColor: isLoading ? '#ccc' : '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
