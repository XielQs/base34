import { VscSearch, VscSettingsGear } from 'react-icons/vsc'
import { Zen_Kaku_Gothic_New } from 'next/font/google'
import BackToTop from '@/components/BackToTop'
import { Roboto } from 'next/font/google'
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

export const metadata: Metadata = {
  title: "Base34",
  description: "Base34 cuz rule34 is basesd",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-US">
      <body className={`${roboto.className} ${zenKakuGothicNew.variable} antialiased flex items-center justify-center flex-col`}>
        <div className="flex items-center justify-between flex-col w-full lg:max-w-3xl h-full pb-5 pt-3 px-2">
          <header className="flex items-center gap-2 w-full">
            <div className="grow"></div>
            <Link href="/" className="w-8 h-8 inline-flex items-center justify-center hover:bg-primary-light hover:text-white rounded-full transition-colors duration-500">
              <VscSearch size={16} />
            </Link>
            <Link href="/preferences" className="w-8 h-8 inline-flex items-center justify-center hover:bg-primary-light hover:text-white hover:rotate-180 rounded-full transition-all duration-500">
              <VscSettingsGear size={16} />
            </Link>
          </header>
          <main className="flex flex-col gap-3.5 w-full h-full relative">
            {children}
            <BackToTop />
          </main>
          <footer className="text-center text-xs mt-4">
            <p>&copy; {new Date().getFullYear()} Base34 - because rule34 is based</p>
            <p>Design inspired by <a href="https://kurosearch.com" target="_blank" rel="noopener noreferrer" className="underline">Kurosearch</a></p>
          </footer>
        </div>
      </body>
    </html>
  )
}
