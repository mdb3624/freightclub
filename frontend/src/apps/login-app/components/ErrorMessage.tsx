export interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      style={{
        padding: '12px',
        marginBottom: '16px',
        backgroundColor: '#fee',
        color: '#c33',
        border: '1px solid #fcc',
        borderRadius: '4px',
        fontSize: '14px',
      }}
    >
      {message}
    </div>
  );
}
