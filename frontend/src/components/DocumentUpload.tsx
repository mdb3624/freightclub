import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Props {
  loadId: string;
  documentType: 'BOL_PHOTO' | 'POD_PHOTO';
  onSuccess?: () => void;
}

async function uploadDocument(loadId: string, documentType: Props['documentType'], file: File) {
  const endpoint =
    documentType === 'BOL_PHOTO'
      ? `/api/v1/documents/${loadId}/bol-photo`
      : `/api/v1/documents/${loadId}/pod-photo`;

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(endpoint, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(err.message || 'Upload failed');
  }
  return res.json();
}

export function DocumentUpload({ loadId, documentType, onSuccess }: Props) {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (file: File) => uploadDocument(loadId, documentType, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['load', loadId] });
      queryClient.invalidateQueries({ queryKey: ['documents', loadId] });
      onSuccess?.();
      setError(null);
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Client-side size guard (server limit is 25 MB)
    if (file.size > 25 * 1024 * 1024) {
      setError('File must be under 25 MB');
      return;
    }
    setError(null);
    mutation.mutate(file);
    // Reset input so the same file can be re-selected after an error
    e.target.value = '';
  };

  const label =
    documentType === 'BOL_PHOTO' ? 'Bill of Lading (BOL)' : 'Proof of Delivery (POD)';

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
      <p className="text-sm font-medium text-gray-700 mb-2">Upload {label}</p>
      <label className="cursor-pointer">
        <span className="inline-block px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors">
          {mutation.isPending ? 'Uploading…' : 'Choose File'}
        </span>
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleChange}
          disabled={mutation.isPending}
        />
      </label>
      {error && (
        <p className="text-red-500 text-xs mt-2" role="alert">
          {error}
        </p>
      )}
      {mutation.isSuccess && (
        <p className="text-green-600 text-xs mt-2">&#10003; {label} uploaded</p>
      )}
      <p className="text-gray-400 text-xs mt-1">JPG, PNG, or WebP — max 25 MB</p>
    </div>
  );
}
