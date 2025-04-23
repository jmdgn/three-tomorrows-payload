'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { HeaderNav } from '../../Header/Nav';
import { DynamicHeaderNav } from '../../Header/Nav/dynamic';
import { BlogHeaderNav } from '@/components/Header/BlogHeaderNav';
import { HeaderShareButton } from '@/components/Header/HeaderShareButton.client';

interface DynamicHeaderWrapperProps {
  headerData: any;
  useStaticHeader: boolean;
}

export default function DynamicHeaderWrapper({ 
  headerData,
  useStaticHeader
}: DynamicHeaderWrapperProps) {
  const pathname = usePathname();
  
  const isBlogPostPage = pathname?.startsWith('/posts/') && pathname !== '/posts';
  
  React.useEffect(() => {
    console.log('Current pathname:', pathname);
    console.log('Is blog post page:', isBlogPostPage);
    console.log('Will use static header:', useStaticHeader);
  }, [pathname, isBlogPostPage, useStaticHeader]);

  return (
    <>
      {isBlogPostPage ? (
        <>
          <BlogHeaderNav data={headerData} />
          <HeaderShareButton />
        </>
      ) : (
        useStaticHeader ? <HeaderNav /> : <DynamicHeaderNav data={headerData} />
      )}
    </>
  );
}