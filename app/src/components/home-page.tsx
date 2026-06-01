'use client'

import { useFlowStore } from '@/store/flow-store'
import dynamic from 'next/dynamic'
import LandingHero from '@/components/landing-hero'

const FlowPage = dynamic(() => import('@/components/flow-page'), { ssr: false })

export default function HomePage() {
  const step = useFlowStore((s) => s.step)

  if (step === 'landing') return <LandingHero />
  return <FlowPage />
}
