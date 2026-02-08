import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Order } from '../backend';

export function useCreateOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ url, price, packageName, packageId }: { url: string; price: number; packageName: string; packageId: string }) => {
      if (!actor) throw new Error('Actor not initialized');
      
      // Convert price to bigint and packageId to bigint
      const priceInBigInt = BigInt(price);
      const packageIdNum = parseInt(packageId.replace(/\D/g, ''), 10) || 0;
      const packageIdBigInt = BigInt(packageIdNum);
      
      // Use addOrderWithWallet which deducts from user balance and adds to admin wallet
      const orderId = await actor.addOrderWithWallet(url, priceInBigInt, packageName, packageIdBigInt);
      return orderId;
    },
    onSuccess: async () => {
      // Invalidate orders, user balance, and admin wallet balance
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['balance'] }),
        queryClient.invalidateQueries({ queryKey: ['adminWalletBalance'] }),
      ]);
      
      // Force immediate refetch to update UI
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['balance'] }),
        queryClient.refetchQueries({ queryKey: ['adminWalletBalance'] }),
      ]);
    },
  });
}

export function useGetOrderById(orderId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Order | null>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const orderIdBigInt = BigInt(orderId);
      return await actor.getOrderById(orderIdBigInt);
    },
    enabled: !!actor && !isFetching && !!orderId,
    retry: false,
  });
}
