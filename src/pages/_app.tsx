import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import NavBar from '@/components/NavBar'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext'
import { PaddleProvider } from '@/components/PaddleProvider'

// Ensure the LanguageProvider wraps the entire app
export default function App({ Component, pageProps }: AppProps) {
  return (
    <SupabaseAuthProvider>
      <LanguageProvider>
        <PaddleProvider>
          <NavBar />
          <Component {...pageProps} />
        </PaddleProvider>
      </LanguageProvider>
    </SupabaseAuthProvider>
  )
} 