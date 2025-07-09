import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { createCoin, DeployCurrency, InitialPurchaseCurrency } from '@zoralabs/coins-sdk';
import { publicClient } from '@/providers/Web3Provider';
import { base } from 'viem/chains';
import { Address, parseEther } from 'viem';
import { useCreateMetadata } from './useCreateMetadata';

interface CreateCoinParams {
  name: string;
  symbol: string;
  description: string;
  image: File;
  payoutRecipient: Address;
  platformReferrer?: Address;
  initialPurchaseAmount?: string; // in ETH
}

export const useCreateCoin = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { createMetadata, isLoading: isMetadataLoading, error: metadataError } = useCreateMetadata();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (params: CreateCoinParams) => {
    if (!address || !walletClient) {
      throw new Error('Wallet not connected');
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create metadata first
      const metadataParams = await createMetadata({
        name: params.name,
        symbol: params.symbol,
        description: params.description,
        image: params.image,
        creatorAddress: address
      });

      // Prepare coin creation parameters
      const coinParams = {
        ...metadataParams,
        payoutRecipient: params.payoutRecipient,
        platformReferrer: params.platformReferrer,
        chainId: base.id,
        currency: DeployCurrency.ZORA,
        owners: [address, params.payoutRecipient],
        ...(params.initialPurchaseAmount && {
          initialPurchase: {
            currency: InitialPurchaseCurrency.ETH,
            amount: parseEther(params.initialPurchaseAmount)
          }
        })
      };

      // Create the coin
      const result = await createCoin(coinParams, walletClient, publicClient);
      return result;

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create coin');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    create,
    isLoading: isLoading || isMetadataLoading,
    error: error || metadataError
  };
}; 