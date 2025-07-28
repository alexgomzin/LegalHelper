import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Script from 'next/script'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import NavBar from '@/components/NavBar'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext'
import { PaddleProvider } from '@/components/PaddleProvider'

const GA_TRACKING_ID = 'G-663DMJSLEN'

// Ensure the LanguageProvider wraps the entire app
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', GA_TRACKING_ID, {
          page_path: url,
        })
      }
    }
    
    router.events.on('routeChangeComplete', handleRouteChange)
    router.events.on('hashChangeComplete', handleRouteChange)
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
      router.events.off('hashChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      {/* Google Analytics */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_TRACKING_ID}');
        `}
      </Script>
      
      <SupabaseAuthProvider>
        <LanguageProvider>
          <PaddleProvider>
            <NavBar />
            <Component {...pageProps} />
          </PaddleProvider>
        </LanguageProvider>
      </SupabaseAuthProvider>
    </>
  )
} 