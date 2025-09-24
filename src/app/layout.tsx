import type { Metadata } from 'next'
import { Nunito_Sans } from 'next/font/google'
import GDPRConsent from '@/components/GDPRConsent'
import './globals.css'

// const geistSans = Geist({
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

const nunitoSans = Nunito_Sans({
  variable: '--font-nunito-sans',
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Second Body Montessori Family Directory',
  description: 'Connect with other families in our Montessori community',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${nunitoSans.variable}`}
        suppressHydrationWarning={true}
      >
        {children}
        <GDPRConsent />
      </body>
    </html>
  )
}
