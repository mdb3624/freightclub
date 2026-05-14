import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useShipperProfile, useSaveShipperProfile, useUpdateShipperProfile } from '../hooks/useShipperProfile';
import { shipperProfileFormSchema, type ShipperProfileFormData } from '../schemas/shipper.schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/types';

export function ShipperProfileForm() {
  const { data: profile, isLoading: isLoadingProfile } = useShipperProfile();
  const saveProfile = useSaveShipperProfile();
  const updateProfile = useUpdateShipperProfile();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ShipperProfileFormData>({
    resolver: zodResolver(shipperProfileFormSchema),
    defaultValues: {
      companyName: '',
      billingEmail: '',
      phoneNumber: '',
      city: '',
      state: '',
      zipCode: '',
      mcNumber: '',
      usdotNumber: '',
      logoUrl: '',
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        companyName: profile.companyName || '',
        billingEmail: profile.billingEmail || '',
        phoneNumber: profile.phoneNumber || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zipCode || '',
        mcNumber: profile.mcNumber || '',
        usdotNumber: profile.usdotNumber || '',
        logoUrl: profile.logoUrl || '',
      });
    }
  }, [profile, reset]);

  const onSubmit = (data: ShipperProfileFormData) => {
    if (profile?.id) {
      updateProfile.mutate(data);
    } else {
      saveProfile.mutate(data);
    }
  };

  const isLoading = isLoadingProfile || saveProfile.isPending || updateProfile.isPending;
  const error = saveProfile.error || updateProfile.error;
  const apiErrorMessage = error
    ? ((error as AxiosError<ApiError>).response?.data?.message ?? 'Failed to save profile. Please try again.')
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {apiErrorMessage && <ErrorBanner message={apiErrorMessage} />}

      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
          Company Name *
        </label>
        <Input
          id="companyName"
          placeholder="Apex Freight Solutions LLC"
          {...register('companyName')}
          aria-invalid={!!errors.companyName}
          disabled={isLoading}
        />
        {errors.companyName && (
          <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="billingEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Billing Email *
        </label>
        <Input
          id="billingEmail"
          type="email"
          placeholder="billing@company.com"
          {...register('billingEmail')}
          aria-invalid={!!errors.billingEmail}
          disabled={isLoading}
        />
        {errors.billingEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.billingEmail.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <Input
          id="phoneNumber"
          placeholder="(512) 555-0182"
          {...register('phoneNumber')}
          aria-invalid={!!errors.phoneNumber}
          disabled={isLoading}
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City *
          </label>
          <Input
            id="city"
            placeholder="Austin"
            {...register('city')}
            aria-invalid={!!errors.city}
            disabled={isLoading}
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            State *
          </label>
          <Input
            id="state"
            placeholder="TX"
            maxLength={2}
            {...register('state')}
            aria-invalid={!!errors.state}
            disabled={isLoading}
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
          ZIP Code *
        </label>
        <Input
          id="zipCode"
          placeholder="78701"
          maxLength={5}
          {...register('zipCode')}
          aria-invalid={!!errors.zipCode}
          disabled={isLoading}
        />
        {errors.zipCode && (
          <p className="mt-1 text-sm text-red-600">{errors.zipCode.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="mcNumber" className="block text-sm font-medium text-gray-700 mb-1">
            MC Number
          </label>
          <Input
            id="mcNumber"
            placeholder="Optional"
            maxLength={8}
            {...register('mcNumber')}
            aria-invalid={!!errors.mcNumber}
            disabled={isLoading}
          />
          {errors.mcNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.mcNumber.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="usdotNumber" className="block text-sm font-medium text-gray-700 mb-1">
            USDOT Number
          </label>
          <Input
            id="usdotNumber"
            placeholder="Optional"
            maxLength={8}
            {...register('usdotNumber')}
            aria-invalid={!!errors.usdotNumber}
            disabled={isLoading}
          />
          {errors.usdotNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.usdotNumber.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
          Logo URL
        </label>
        <Input
          id="logoUrl"
          type="url"
          placeholder="https://s3.example.com/logo.png"
          {...register('logoUrl')}
          aria-invalid={!!errors.logoUrl}
          disabled={isLoading}
        />
        {errors.logoUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.logoUrl.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} size="lg">
        {isLoading ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
}
