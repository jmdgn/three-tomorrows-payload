'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type PostHeaderContextType = {
  postData: {
    title?: string;
    slug?: string;
  } | null;
  setPostData: (data: { title?: string; slug?: string } | null) => void;
}

const PostHeaderContext = createContext<PostHeaderContextType>({
  postData: null,
  setPostData: () => {},
})

export const usePostHeader = () => useContext(PostHeaderContext)

export function PostHeaderProvider({ children }: { children: React.ReactNode }) {
  const [postData, setPostData] = useState<{ title?: string; slug?: string } | null>(null)

  return (
    <PostHeaderContext.Provider value={{ postData, setPostData }}>
      {children}
    </PostHeaderContext.Provider>
  )
}

export function SetPostHeaderData({ title, slug }: { title?: string; slug?: string }) {
  const { setPostData } = usePostHeader()
  
  useEffect(() => {
    if (title || slug) {
      setPostData({ title, slug })
    }
    
    return () => {
      setPostData(null)
    }
  }, [title, slug, setPostData])
  
  return null
}

export default PostHeaderProvider