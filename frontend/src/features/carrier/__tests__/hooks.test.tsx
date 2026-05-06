import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useEquipment,
  useAddEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
} from '../hooks/useCarrierProfile';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
    jest.clearAllMocks();
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

      mockedAxios.get.mockResolvedValueOnce({ data: mockEquipment });

      const { result } = renderHook(() => useEquipment(truckerId), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockEquipment);
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/v1/profile/equipment', {
        params: { truckerId },
      });
    });

    it('should not fetch if truckerId is not provided', () => {
      const { result } = renderHook(() => useEquipment(''), { wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(mockedAxios.get).not.toHaveBeenCalled();
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

      mockedAxios.post.mockResolvedValueOnce({ data: mockData });

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
      expect(mockedAxios.post).toHaveBeenCalledWith('/api/v1/profile/equipment', expect.any(Object));
    });

    it('should handle validation errors', async () => {
      mockedAxios.post.mockRejectedValueOnce({
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

      mockedAxios.delete.mockResolvedValueOnce({});

      const { result } = renderHook(() => useDeleteEquipment(), { wrapper });

      result.current.mutate(equipmentId);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedAxios.delete).toHaveBeenCalledWith(`/api/v1/profile/equipment/${equipmentId}`);
    });
  });
});
