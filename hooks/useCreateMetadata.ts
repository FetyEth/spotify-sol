import { useState } from 'react';
import { Address } from 'viem';
import { createMetadataBuilder, createZoraUploaderForCreator } from '@zoralabs/coins-sdk';

interface CreateMetadataParams {
  name: string;
  symbol: string;
  description: string;
  image: File;
  creatorAddress: Address;
}

export const useCreateMetadata = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMetadata = async (params: CreateMetadataParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const { createMetadataParameters } = await createMetadataBuilder()
        .withName(params.name)
        .withSymbol(params.symbol)
        .withDescription(params.description)
        .withImage(params.image)
        .upload(createZoraUploaderForCreator(params.creatorAddress));

      return createMetadataParameters;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create metadata'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createMetadata,
    isLoading,
    error
  };
}; 