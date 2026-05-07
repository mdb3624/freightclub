import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import EquipmentModal from '../components/modals/EquipmentModal';
import * as hooks from '../hooks/useCarrierProfile';
import { vi } from 'vitest';

vi.mock('../hooks/useCarrierProfile');
const mockedHooks = hooks as unknown as Record<string, ReturnType<typeof vi.fn>>;

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <Toaster />
  </QueryClientProvider>
);

describe('EquipmentModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedHooks.useAddEquipment.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    });

    mockedHooks.useUpdateEquipment.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    });
  });

  describe('Add Equipment Mode', () => {
    it('should render form with empty fields', () => {
      render(
        <EquipmentModal equipment={null} onClose={mockOnClose} />,
        { wrapper }
      );

      expect(screen.getByRole('heading', { name: 'Add Equipment' })).toBeInTheDocument();
      expect(screen.getByLabelText('Equipment Type *')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('48')).toHaveValue(null);
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();

      render(
        <EquipmentModal equipment={null} onClose={mockOnClose} />,
        { wrapper }
      );

      const submitButton = screen.getByRole('button', { name: /Add Equipment/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Equipment type required/i)).toBeInTheDocument();
      });
    });

    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const mockMutate = vi.fn().mockResolvedValue({});

      mockedHooks.useAddEquipment.mockReturnValue({
        mutateAsync: mockMutate,
        isPending: false,
      });

      render(
        <EquipmentModal equipment={null} onClose={mockOnClose} />,
        { wrapper }
      );

      const typeSelect = screen.getByLabelText('Equipment Type *');
      await user.selectOptions(typeSelect, 'FLATBED');

      const lengthInput = screen.getByPlaceholderText('48');
      await user.type(lengthInput, '48');

      const widthInput = screen.getByPlaceholderText('8.5');
      await user.type(widthInput, '8');

      const heightInput = screen.getByPlaceholderText('6');
      await user.type(heightInput, '6');

      const capacityInput = screen.getByPlaceholderText('45000');
      await user.type(capacityInput, '45000');

      const goodRadio = screen.getByLabelText('GOOD');
      await user.click(goodRadio);

      const submitButton = screen.getByRole('button', { name: /Add Equipment/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            equipmentType: 'FLATBED',
            lengthFeet: 48,
            widthFeet: 8,
            heightFeet: 6,
            capacityLbs: 45000,
            equipmentCondition: 'GOOD',
          })
        );
      });
    });
  });

  describe('Edit Equipment Mode', () => {
    const mockEquipment = {
      id: 'eq-1',
      equipmentType: 'FLATBED' as const,
      lengthFeet: 48,
      widthFeet: 8,
      heightFeet: 6,
      capacityLbs: 45000,
      equipmentCondition: 'GOOD' as const,
      yearModel: '2022',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
    };

    it('should pre-fill form with equipment data', () => {
      render(
        <EquipmentModal equipment={mockEquipment} onClose={mockOnClose} />,
        { wrapper }
      );

      expect(screen.getByText('Edit Equipment')).toBeInTheDocument();
      expect(screen.getByDisplayValue('48')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2022')).toBeInTheDocument();
    });

    it('should submit update with modified data', async () => {
      const user = userEvent.setup();
      const mockMutate = vi.fn().mockResolvedValue({});

      mockedHooks.useUpdateEquipment.mockReturnValue({
        mutateAsync: mockMutate,
        isPending: false,
      });

      render(
        <EquipmentModal equipment={mockEquipment} onClose={mockOnClose} />,
        { wrapper }
      );

      const fairRadio = screen.getByLabelText('FAIR');
      await user.click(fairRadio);

      const submitButton = screen.getByRole('button', { name: /Update Equipment/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith({
          id: 'eq-1',
          data: expect.objectContaining({
            equipmentCondition: 'FAIR',
          }),
        });
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <EquipmentModal equipment={null} onClose={mockOnClose} />,
        { wrapper }
      );

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByLabelText('Equipment Type *')).toHaveAttribute('aria-required', 'true');
    });

    it('should close on Escape key (TODO: implement)', () => {
      render(
        <EquipmentModal equipment={null} onClose={mockOnClose} />,
        { wrapper }
      );

      // TODO: fireEvent.keyDown(document, { key: 'Escape' });
      // expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
