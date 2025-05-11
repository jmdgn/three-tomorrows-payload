import dynamic from 'next/dynamic'
import type { CardStackBlock as CardStackBlockProps } from '@/payload-types'

export { CardStackBlock } from './Component'
export { CardStack as CardStackConfig } from './config'

// Dynamically import the component to avoid SSR issues with GSAP
const CardStackClient = dynamic(
  () => import('./Component').then((mod) => ({ default: mod.CardStackBlock })),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center">Loading card stack...</div>
    ),
  },
)

export const CardStackBlock: React.FC<CardStackBlockProps> = (props) => {
  return <CardStackClient {...props} />
}
