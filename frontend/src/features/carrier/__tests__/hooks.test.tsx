import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useEquipment,
  useAddEquipment,
  useDeleteEquipment,
} from '../hooks/useCarrierProfile';
import { carrierApi } from '../api';
import { vi } from 'vitest';

vi.mock('../api', () => ({
  carrierApi: {
    equipment: {
      list: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
    lanes: {
      list: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    },
    availability: {
      get: vi.fn(),
      set: vi.fn(),
    },
    publicProfile: vi.fn(),
  },
}));

const mockedEquipment = carrierApi.equipment as {
  list: ReturnType<typeof vi.fn>;
  add: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('Carrier Profile Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('useEquipment', () => {
    it('should fetch equipment for trucker', async () => {
      const truckerId = 'trucker-1';
      const mockEquipment = [
        {
          id: 'eq-1',
          equipmentType: 'FLATBED',
          lengthFeet: 48,
          widthFeet: 8,
          heightFeet: 6,
          capacityLbs: 45000,
          equipmentCondition: 'GOOD',
          yearModel: '2022',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
        },
      ];

      mockedEquipment.list.mockResolvedValueOnce(mockEquipment);

      const { result } = renderHook(() => useEquipment(truckerId), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockEquipment);
      expect(mockedEquipment.list).toHaveBeenCalledWith(truckerId);
    });

    it('should not fetch if truckerId is not provided', () => {
      const { result } = renderHook(() => useEquipment(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(mockedEquipment.list).not.toHaveBeenCalled();
    });
  });

  describe('useAddEquipment', () => {
    it('should add equipment and invalidate cache', async () => {
      const mockData = {
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

      mockedEquipment.add.mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useAddEquipment(), { wrapper });

      result.current.mutate({
        equipmentType: 'FLATBED',
        lengthFeet: 48,
        widthFeet: 8,
        heightFeet: 6,
        capacityLbs: 45000,
        equipmentCondition: 'GOOD',
        yearModel: '2022',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(mockedEquipment.add).toHaveBeenCalledWith(expect.objectContaining({
        equipmentType: 'FLATBED',
      }));
    });

    it('should handle validation errors', async () => {
      mockedEquipment.add.mockRejectedValueOnce({
        response: {
          status: 400,
          data: { message: 'Invalid equipment type' },
        },
      });

      const { result } = renderHook(() => useAddEquipment(), { wrapper });

      result.current.mutate({
        equipmentType: 'FLATBED',
        lengthFeet: 48,
        widthFeet: 8,
        heightFeet: 6,
        capacityLbs: 45000,
        equipmentCondition: 'GOOD',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('useDeleteEquipment', () => {
    it('should delete equipment and invalidate cache', async () => {
      const equipmentId = 'eq-1';

      mockedEquipment.remove.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useDeleteEquipment(), { wrapper });

      result.current.mutate(equipmentId);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedEquipment.remove).toHaveBeenCalledWith(equipmentId);
    });
  });
});
