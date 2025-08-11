import React from 'react';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { QueryClient } from '@tanstack/react-query';
import { asyncStoragePersister } from './_storage/queryPersister';

interface QueryClientWrapperProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export function QueryClientWrapper({
  children,
  queryClient,
}: QueryClientWrapperProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        dehydrateOptions: {
          shouldDehydrateMutation: () => true, // Always persist mutations
        },
      }}
      onSuccess={() => {
        // Resume any paused mutations after successful hydration
        queryClient.resumePausedMutations().then(() => {
          queryClient.invalidateQueries();
        });
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
