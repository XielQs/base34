'use client'
import usePreferencesStore from '@/app/stores/preferencesStore'
import Image from './Image'

export default function Provider({ children }: { children: React.ReactNode }) {
  const preferencesStore = usePreferencesStore(state => state)

  if (!preferencesStore.hasHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-t-transparent border-secondary rounded-full animate-spin"></div>
      </div>
    )
  }
  
  return (
    <>
      {children}
      {!preferencesStore.sawWarning && (
        <div className="fixed top-0 left-0 w-full h-full backdrop-blur-md flex items-center justify-center z-50 p-6">
          <div className="bg-primary shadow-[0_0_100px_100px_#000] border-2 border-secondary border-solid p-4 gap-4 rounded-lg max-w-[500px] text-center">
            <Image src="/astolfo.png" alt="Warning Icon" width={200} height={200} className="h-[200px] mx-auto mb-4" />
            <h1 className="text-7xl text-center font-gothic text-secondary">base34</h1>
            <h2 className="text-xl my-4">Terms of Use</h2>
            <hr className="border-t-2 border-primary-light my-4" />
            <h3 className="text-lg font-semibold mb-2">Mature Content</h3>
            <p className="text-sm mb-4">
              This site contains explicit content that is not suitable for all audiences. By using this site, you acknowledge that you are at least 18 years old and agree to view such content.
            </p>
            <div className="flex justify-center gap-4">
              <button type="button" onClick={() => preferencesStore.setSawWarning(true)} className="w-32 h-9 font-light text-sm bg-secondary hover:bg-secondary/75 transition-colors duration-300 uppercase text-white rounded-md cursor-pointer">
                Accept
              </button>
              <button type="button" onClick={() => window.location.href = 'https://www.google.com'} className="w-32 h-9 font-light text-sm bg-primary-tone hover:bg-primary-tone/75 transition-colors duration-300 uppercase text-white rounded-md cursor-pointer">
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
