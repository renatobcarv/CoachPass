'use client'

import dynamic from 'next/dynamic'

const App = dynamic(() => import('@/web/App'), { ssr: false })

export default function FrontendApp() {
  return <App />
}
