'use client'
import usePreferencesStore from '../stores/preferencesStore'

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
        Use our servers to fetch images from the source site like rule34.xxx. This is useful if you are in a country where the site is blocked or your ISP is throttling your connection.
        <br />
        <span className="text-red-500">Warning: This may be slow and is not recommended if there are no issues with your connection.</span>
      </p>
      <label htmlFor="proxy" className="flex items-center cursor-pointer select-none py-1 px-2 hover:bg-primary-light rounded">
        <input type="checkbox" className="mr-2" id="proxy" checked={preferencesStore.useProxy} onChange={() => preferencesStore.setUseProxy(!preferencesStore.useProxy)} />
        Use Proxy to Fetch Images
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
          <pre className="bg-primary-light p-4 rounded">
            <code>
              {JSON.stringify(preferencesStore, null, 2)}
            </code>
          </pre>
        </div>
      )}
    </div>
  )
}