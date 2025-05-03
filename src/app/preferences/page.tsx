'use client'
import usePreferencesStore from '../stores/preferencesStore'
import { useEffect, useState } from 'react'

const BLOCKED_CONTENT = {
  'AI Generated': 'ai_generated',
  Futanari: 'futanari',
  Gore: 'gore',
  Scat: 'scat',
  // https://github.com/kurozenzen/kurosearch/tree/main/src/lib/logic/blocking-group-data.ts
  'Animal-Related': [
    'zoophilia',
    'zoo',
    'canine*',
    'equine*',
    'feral_*',
    '*_feral',
    'bestiality*',
    'zoophilia*',
    'animal'
  ].join(' '),
}

export default function Preferences() {
  const preferencesStore = usePreferencesStore(state => state)
  const [initialPrivacyMode, setInitialPrivacyMode] = useState<boolean | null>(null)

  useEffect(() => {
    setInitialPrivacyMode(preferencesStore.privacyMode)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBlockedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, id } = event.target
    preferencesStore[checked ? 'addBlockedContent' : 'removeBlockedContent'](id)
  }

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-5xl text-white mb-10">Preferences</h1>
      <h2 className="text-2xl text-white">Blocked Content</h2>
      <p className="text-gray-400 text-base">
        Blocked content is content that you have chosen to hide from results.
      </p>
      <div className="flex flex-col my-2 text-sm">
        {Object.entries(BLOCKED_CONTENT).map(([key, value]) => (
          <label key={value} htmlFor={value} className="flex items-center cursor-pointer select-none py-1 px-2 hover:bg-primary-light rounded">
            <input type="checkbox" className="mr-2" id={value} checked={preferencesStore.blockedContent.includes(value)} onChange={handleBlockedChange} />
            {key}
          </label>
        ))}
      </div>
      <h2 className="text-2xl text-white mt-5">Proxy Settings</h2>
      <p className="text-gray-400 text-base">
        Can’t reach rule34.xxx because of country blocks? No worries—we’ll fetch the images for you through our servers, <span className="text-yellow-500">but keep in mind that it might add a slight delay!</span>
      </p>
      <label htmlFor="proxy" className="flex items-center cursor-pointer select-none py-1 px-2 hover:bg-primary-light rounded">
        <input type="checkbox" className="mr-2" id="proxy" checked={preferencesStore.useProxy} onChange={() => preferencesStore.setUseProxy(!preferencesStore.useProxy)} />
        Use Proxy to Fetch Images
      </label>
      <h2 className="text-2xl text-white mt-5">Privacy Mode</h2>
      <p className="text-gray-400 text-base">
        Privacy mode: because sometimes you just don’t want your roommate asking why &apos;base34 furry dance party&apos; is in your history. No judgment, just stealth. 🕵️‍♂️✨
        <br />
        <span className="text-red-500">Warning: This only dresses up the tab. The page itself is still totally naked, just chilling there for anyone to see.</span>
      </p>
      <label htmlFor="privacy" className="flex items-center cursor-pointer select-none py-1 px-2 hover:bg-primary-light rounded">
        <input type="checkbox" className="mr-2" id="privacy" checked={preferencesStore.privacyMode} onChange={() => preferencesStore.setPrivacyMode(!preferencesStore.privacyMode)} />
        Enable Privacy Mode
        {initialPrivacyMode !== null && initialPrivacyMode !== preferencesStore.privacyMode && (
          <span className="text-red-500 text-sm ml-2">
            Reload the page to apply changes
          </span>
        )}
      </label>
      <h2 className="text-2xl text-white mt-5">Debug for Nerds</h2>
      <label htmlFor="debug" className="flex items-center cursor-pointer select-none py-1 px-2 hover:bg-primary-light rounded">
        <input type="checkbox" className="mr-2" id="debug" checked={preferencesStore.debug} onChange={() => preferencesStore.setDebug(!preferencesStore.debug)} />
        Enable Debug
      </label>
      <br />
      {preferencesStore.debug && (
        <div className="text-sm text-gray-400">
          <h2 className="text-2xl text-white">Debug Information</h2>
          <p className="text-gray-400 text-base mb-2">
            This is the current state of the preferences store.
          </p>
          <pre className="bg-primary-light p-4 mb-2 rounded overflow-x-auto">
            <code>
              {JSON.stringify(preferencesStore, null, 2)}
            </code>
          </pre>
          <button
            type="button"
            className="w-40 h-9 font-light text-sm bg-secondary hover:bg-secondary/75 transition-colors duration-300 text-white rounded cursor-pointer"
            onClick={() => {
              preferencesStore.reset()
              alert('Preferences store cleared')
            }}
          >
            Clear Preferences Store
          </button>
        </div>
      )}
    </div>
  )
}