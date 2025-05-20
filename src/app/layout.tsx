import { VscGithub, VscSearch, VscSettingsGear } from 'react-icons/vsc'
import type { PreferencesState } from './stores/preferencesStore'
import { Zen_Kaku_Gothic_New } from 'next/font/google'
import BackToTop from '@/components/BackToTop'
import Provider from '@/components/Provider'
import { Roboto } from 'next/font/google'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  weight: '700',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-gothic',
})

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies()
  const preferences: { state?: PreferencesState } = JSON.parse(cookieStore.get('preferences-storage')?.value || '{}')
  const privacyMode = preferences.state?.privacyMode || false

  if (privacyMode) {
    return {
      title: "Google",
      description: "Google Search",
      icons: {
        icon: 'https://google.com/favicon.ico',
        shortcut: 'https://google.com/favicon.ico',
      },
      metadataBase: new URL('https://base34.vercel.app'),
    }
  }

  return {
    title: 'base34',
    description: 'base34 cuz rule34 is based',
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
    },
    metadataBase: new URL('https://base34.vercel.app'),
    openGraph: {
      title: 'base34',
      description: 'base34 cuz rule34 is based',
      url: 'https://base34.vercel.app',
      siteName: 'base34',
      images: [
        {
          url: '/favicon.png',
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: 'base34',
      description: 'base34 cuz rule34 is based',
      images: [
        {
          url: '/favicon.png',
        },
      ],
    },
  }
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US">
      <body className={`${roboto.className} ${zenKakuGothicNew.variable} antialiased flex items-center justify-center flex-col`}>
        <div className="flex items-center justify-between flex-col w-full lg:max-w-[50rem] h-full pb-5 pt-3 px-2 gap-3">
          <header className="flex items-center gap-2 w-full">
            <Link href="https://github.com/XielQs/base34" target="_blank" className="w-8 h-8 inline-flex items-center justify-center hover:bg-primary-light hover:text-white rounded-full transition-colors duration-500">
              <VscGithub size={20} />
            </Link>
            <div className="grow"></div>
            <Link href="/" className="w-8 h-8 inline-flex items-center justify-center hover:bg-primary-light hover:text-white rounded-full transition-colors duration-500">
              <VscSearch size={16} />
            </Link>
            <Link href="/preferences" className="w-8 h-8 inline-flex items-center justify-center hover:bg-primary-light hover:text-white hover:rotate-180 rounded-full transition-all duration-500">
              <VscSettingsGear size={16} />
            </Link>
          </header>
          <main className="flex flex-col gap-3.5 w-full h-full relative p-2">
            <Provider>
              {children}
            </Provider>
            <BackToTop />
          </main>
          <footer className="text-center text-xs mt-4">
            <p>&copy; {new Date().getFullYear()} base34 - because rule34 is based</p>
            <p>Design inspired by <a href="https://kurosearch.com" target="_blank" rel="noopener noreferrer" className="underline">Kurosearch</a></p>
          </footer>
        </div>
      </body>
    </html>
  )
}
