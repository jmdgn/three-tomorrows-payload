'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'
import { SetPostHeaderData } from '@/providers/PostHeaderProvider'
import dynamic from 'next/dynamic'

type PageClientProps = {
  title?: string;
  slug?: string;
}

const PageClient: React.FC<PageClientProps> = ({ title, slug }) => {
  const { setHeaderTheme } = useHeaderTheme()

  useEffect(() => {
    setHeaderTheme('light')

  }, [setHeaderTheme])
  
  return (
    <>
      <SetPostHeaderData title={title} slug={slug} />
    </>
  )
}

export default PageClient