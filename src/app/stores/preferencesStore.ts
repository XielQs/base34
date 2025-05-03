import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PreferencesState {
  blockedContent: string[]
  debug: boolean
  useProxy: boolean
  sawWarning: boolean

  hasHydrated: boolean
}

interface PreferencesActions {
  addBlockedContent: (content: string) => void
  removeBlockedContent: (content: string) => void
  setDebug: (debug: boolean) => void
  setUseProxy: (useProxy: boolean) => void
  setSawWarning: (sawWarning: boolean) => void

  setHasHydrated: (hasHydrated: boolean) => void
}

const usePreferencesStore = create(
  persist<PreferencesState & PreferencesActions>(
    set => ({
      blockedContent: [],
      debug: false,
      useProxy: true,
      sawWarning: false,

      addBlockedContent: content => set((state) => ({ blockedContent: [...state.blockedContent, content] })),
      removeBlockedContent: content => set((state) => ({ blockedContent: state.blockedContent.filter((c) => c !== content) })),
      setDebug: debug => set(() => ({ debug })),
      setUseProxy: useProxy => set(() => ({ useProxy })),
      setSawWarning: sawWarning => set(() => ({ sawWarning })),

      hasHydrated: false,
      setHasHydrated: hasHydrated => set(() => ({ hasHydrated }))
    }),
    {
      name: 'preferences-storage',
      onRehydrateStorage: () => (state) => {
        if (state) state.setHasHydrated(true)
      }
    }
  )
)

export default usePreferencesStore
