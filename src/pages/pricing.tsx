import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import dynamic from 'next/dynamic'

interface PricingTier {
  name: string;
  id: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  mostPopular: boolean;
}

// Create a client-only component for auth-dependent content
const PricingContent = dynamic(() => import('../components/PricingContent'), {
  ssr: false,
  loading: () => <div className="text-center py-8">Loading...</div>
})

export default function Pricing() {
  return (
    <>
      <Head>
        <title>Pricing | LegalHelper</title>
      </Head>
      <PricingContent />
    </>
  )
} 