import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext';
import NavBar from '@/components/NavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Legal Helper',
  description: 'AI-powered legal document analysis',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SupabaseAuthProvider>
          <LanguageProvider>
            <NavBar />
            <main className="container mx-auto px-4 py-8">
              {children}
            </main>
          </LanguageProvider>
        </SupabaseAuthProvider>
      </body>
    </html>
  );
} 