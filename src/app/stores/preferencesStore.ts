import { createJSONStorage, persist } from 'zustand/middleware'
import cookiesStorage from './cookiesStorage'
import { create } from 'zustand'

export interface PreferencesState {
  blockedContent: string[]
  debug: boolean
  useProxy: boolean
  privacyMode: boolean
  sawWarning: boolean

  hasHydrated: boolean
}

interface PreferencesActions {
  addBlockedContent: (content: string) => void
  removeBlockedContent: (content: string) => void
  setDebug: (debug: boolean) => void
  setUseProxy: (useProxy: boolean) => void
  setPrivacyMode: (privacyMode: boolean) => void
  setSawWarning: (sawWarning: boolean) => void

  setHasHydrated: (hasHydrated: boolean) => void
  reset: () => void
}

const initialState: Omit<PreferencesState, 'hasHydrated'> = {
  blockedContent: [],
  debug: false,
  useProxy: true,
  privacyMode: false,
  sawWarning: false,
}

const usePreferencesStore = create(
  persist<PreferencesState & PreferencesActions>(
    set => ({
      ...initialState,

      addBlockedContent: content => set((state) => ({ blockedContent: [...state.blockedContent, content] })),
      removeBlockedContent: content => set((state) => ({ blockedContent: state.blockedContent.filter((c) => c !== content) })),
      setDebug: debug => set(() => ({ debug })),
      setUseProxy: useProxy => set(() => ({ useProxy })),
      setPrivacyMode: privacyMode => set(() => ({ privacyMode })),
      setSawWarning: sawWarning => set(() => ({ sawWarning })),

      hasHydrated: false,
      setHasHydrated: hasHydrated => set(() => ({ hasHydrated })),
      reset: () => set(() => ({ ...initialState }))
    }),
    {
      name: 'preferences-storage',
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true)
      },
      storage: createJSONStorage(() => cookiesStorage)
    }
  )
)

export default usePreferencesStore
