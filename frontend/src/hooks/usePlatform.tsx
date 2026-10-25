/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react'
import { mockPlatform } from '../services/mockPlatform'
import type { PlatformService } from '../services/platformService'
import type { PlatformState } from '../domain/types'

const PlatformContext = createContext<PlatformService>(mockPlatform)

export function PlatformProvider({ children, service = mockPlatform }: { children: ReactNode; service?: PlatformService }) {
  return <PlatformContext.Provider value={service}>{children}</PlatformContext.Provider>
}

export function usePlatformService() {
  return useContext(PlatformContext)
}

export function usePlatformState(): PlatformState {
  const service = usePlatformService()
  return useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot)
}
