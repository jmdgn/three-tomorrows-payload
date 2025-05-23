import React from 'react'

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="post-layout">
      {children}
    </div>
  )
}
