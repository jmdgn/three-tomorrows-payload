'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface HeaderData {
  navItems?: Array<{
    id: string
    link?: {
      type?: string
      label?: string
      url?: string
      newTab?: boolean
      reference?: {
        relationTo?: string
        value?: {
          slug?: string
          title?: string
          id?: string
        }
      }
    }
  }> | null
  logo?: any
  ctaLink?: any
  ctaLabel?: string
  mobileCta?: {
    label: string
    url: string
  }
}

interface SocialLink {
  platform: string
  url: string
  openInNewTab: boolean
}

interface FooterData {
  socialLinks?: SocialLink[]
}

interface BlogPostCategory {
  id: string
  title: string
}

interface BlogPost {
  id: string
  title: string
  slug: string
  featuredImage?: {
    url: string
    alt?: string
  }
  heroImage?: {
    url?: string
    alt?: string
    sizes?: {
      webp?: {
        url: string
      }
    }
    filename?: string
  }
  meta?: {
    image?: {
      url?: string
      alt?: string
    }
  }
  publishedAt?: string
  categories?: BlogPostCategory[] | string[]
  excerpt?: string
}

const FALLBACK_NAV_ITEMS = [
  { label: 'Services', url: '/services' },
  { label: 'Approach', url: '/our-approach' },
  { label: 'Why This Matters', url: '/why-this-matters' },
  { label: 'Expertise', url: '/expertise' },
  { label: 'Blog', url: '/posts' },
]

const FALLBACK_SOCIAL_LINKS = [
  {
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/company/three-tomorrows/',
    openInNewTab: true,
  },
  { platform: 'Bluesky', url: '#', openInNewTab: true },
]

export const DynamicHeaderNav: React.FC<{ data: HeaderData | null }> = ({ data }) => {
  const isClient = typeof window !== 'undefined'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(FALLBACK_SOCIAL_LINKS)
  const [footerLoaded, setFooterLoaded] = useState(false)
  const [latestPost, setLatestPost] = useState<BlogPost | null>(null)
  const [postsLoaded, setPostsLoaded] = useState(false)
  const [menuItemsVisible, setMenuItemsVisible] = useState(false)

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await fetch('/api/globals/footer')
        if (!response.ok) throw new Error('Failed to fetch footer data')
        const footerData: FooterData = await response.json()

        if (footerData?.socialLinks && footerData.socialLinks.length > 0) {
          setSocialLinks(footerData.socialLinks)
        }

        setFooterLoaded(true)

        if (isClient && process.env.NODE_ENV === 'development') {
          console.log('Footer data loaded:', footerData)
        }
      } catch (error) {
        console.error('Error fetching footer data:', error)
        setFooterLoaded(true)
      }
    }

    fetchFooterData()
  }, [isClient])

  useEffect(() => {
    const fetchLatestPost = async () => {
      try {
        const apiUrl =
          window.ENV?.SERVER_URL ||
          process.env.NEXT_PUBLIC_SERVER_URL ||
          'https://three-tomorrows-payload-production.up.railway.app'
        const response = await fetch(`${apiUrl}/api/posts?limit=1&sort=-publishedAt&depth=2`)

        if (!response.ok) throw new Error('Failed to fetch latest blog post')
        const data = await response.json()

        if (data && data.docs && data.docs.length > 0) {
          const post = data.docs[0]
          setLatestPost(post)

          if (isClient && process.env.NODE_ENV === 'development') {
            console.log('Latest post loaded:', post)
          }
        }

        setPostsLoaded(true)
      } catch (error) {
        console.error('Error fetching latest post:', error)
        setPostsLoaded(true)
      }
    }

    if (isClient) {
      fetchLatestPost()
    }
  }, [isClient])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (mobileMenuOpen) {
      timer = setTimeout(() => {
        setMenuItemsVisible(true)
      }, 100)
    } else {
      setMenuItemsVisible(false)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [mobileMenuOpen])

  React.useEffect(() => {
    if (isClient && process.env.NODE_ENV === 'development') {
      console.log('DynamicHeaderNav received data:', data ? 'yes' : 'no')
      console.log('navItems count:', data?.navItems?.length || 0)

      if (data?.navItems) {
        console.log('Raw navItems structure:', JSON.stringify(data.navItems, null, 2))
      }
    }
  }, [data, isClient])

  const navItems = React.useMemo(() => {
    if (!data || !data.navItems || !Array.isArray(data.navItems) || data.navItems.length === 0) {
      if (isClient && process.env.NODE_ENV === 'development') {
        console.log('Using FALLBACK_NAV_ITEMS due to missing navItems')
      }
      return FALLBACK_NAV_ITEMS
    }

    const validItems = data.navItems
      .filter((item) => {
        if (!item || !item.link || !item.link.label) {
          return false
        }

        if (item.link.url) {
          return true
        }

        if (item.link.type === 'reference' && item.link.reference?.value) {
          return true
        }

        if (item.link.type === 'custom') {
          return true
        }

        return false
      })
      .map((item) => {
        let url = '#'

        if (item.link?.url) {
          url = item.link.url
        } else if (item.link?.type === 'reference' && item.link?.reference?.value) {
          const refValue = item.link.reference.value
          url = `/${refValue.slug}` || '#'
        }

        return {
          label: item.link!.label!,
          url: url,
          newTab: item.link!.newTab || false,
        }
      })

    if (validItems.length === 0) {
      if (isClient && process.env.NODE_ENV === 'development') {
        console.log('No valid items after filtering, using fallback')
      }
      return FALLBACK_NAV_ITEMS
    }

    if (isClient && process.env.NODE_ENV === 'development') {
      console.log('Using', validItems.length, 'valid navigation items:')
      console.log('Final nav items:', JSON.stringify(validItems, null, 2))
    }
    return validItems
  }, [data, isClient])

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch (e) {
      return ''
    }
  }

  const getPostImageUrl = (post: BlogPost | null) => {
    if (!post) return null

    if (post.heroImage) {
      if (typeof post.heroImage === 'string') {
        return post.heroImage
      }

      if (typeof post.heroImage === 'object') {
        if (post.heroImage.url) {
          return post.heroImage.url
        }

        if (post.heroImage.sizes?.webp?.url) {
          return post.heroImage.sizes.webp.url
        }

        if (post.heroImage.filename) {
          return `/api/media/${post.heroImage.filename}`
        }
      }
    }

    if (post.featuredImage?.url) {
      return post.featuredImage.url
    }

    if (post.meta?.image?.url) {
      return post.meta.image.url
    }

    return '/assets/images/blog/default-post-image.jpg'
  }

  const getPostCategories = (post: BlogPost | null) => {
    if (!post || !post.categories) return []

    if (!Array.isArray(post.categories)) {
      return []
    }

    return post.categories.map((cat) => {
      if (typeof cat === 'string') {
        return { id: cat, title: cat }
      }

      if (typeof cat === 'object' && cat && (cat as any).title) {
        return {
          id: (cat as any).id || 'unknown',
          title: (cat as any).title,
        }
      }

      return { id: 'unknown', title: 'Unknown' }
    })
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const ctaLabel = data?.ctaLabel || "Let's Talk"
  const ctaLink = data?.ctaLink?.url || '/contact'

  const mobileCta = data?.mobileCta || { label: 'Plan Your Next Step', url: '/contact' }

  return (
    <header className="main-nav">
      <nav className="mainNav">
        <div className="header-container">
          <div className={`logo-container ${mobileMenuOpen ? 'fade-out' : ''}`}>
            <div className="headerLogo">
              <Link href="/">
                <Image
                  className="main-logo"
                  src="/assets/logo/logo.svg"
                  width={220}
                  height={58}
                  alt="Three Tomorrows"
                  priority
                />
              </Link>
            </div>
          </div>
          {/* Desktop Navigation Menu */}
          <div className="menu-container desktop-menu">
            <nav>
              <div className="nav-menu">
                <ul className="menu-ribbon">
                  {navItems.map((item, index) => (
                    <li key={`nav-${index}`}>
                      {item.newTab ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.label}
                        </a>
                      ) : (
                        <Link href={item.url}>{item.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
          <div className={`contactBtn-container ${mobileMenuOpen ? 'fade-out' : ''}`}>
            <div className="headerContact">
              <Link className="contactCta header" href={ctaLink}>
                {ctaLabel}
              </Link>
            </div>
            {/* Mobile Menu Toggle Button */}
            <div className="mobile-menu-toggle">
              <button onClick={toggleMobileMenu} className="menu-toggle-btn">
                {mobileMenuOpen ? 'Close' : 'Menu'}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <nav>
              <ul className={`mobile-menu-items ${menuItemsVisible ? 'items-visible' : ''}`}>
                {navItems.map((item, index) => (
                  <li
                    key={`mobile-nav-${index}`}
                    className="menu-item"
                    style={{
                      animationDelay: `${0.1 + index * 0.05}s`,
                    }}
                  >
                    {item.newTab ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link href={item.url} onClick={() => setMobileMenuOpen(false)}>
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className={`mobile-social-links ${menuItemsVisible ? 'section-visible' : ''}`}>
              <ul className="social-menu-items">
                {socialLinks.map((social, index) => (
                  <li
                    key={`social-${index}`}
                    className="social-item"
                    style={{
                      animationDelay: `${0.3 + index * 0.05}s`,
                    }}
                  >
                    <a
                      href={social.url}
                      target={social.openInNewTab ? '_blank' : '_self'}
                      rel={social.openInNewTab ? 'noopener noreferrer' : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {social.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className={`mobileMenu-ctaCon ${menuItemsVisible ? 'section-visible' : ''}`}>
              <a href={mobileCta.url}>
                <p>{mobileCta.label}</p>
              </a>
            </div>

            {latestPost && (
              <div className={`mobile-latest-post ${menuItemsVisible ? 'section-visible' : ''}`}>
                <div className="mobile-postInner">
                  <h6 className="latest-post-heading">Latest Article</h6>

                  <Link href={`/posts/${latestPost.slug}`} onClick={() => setMobileMenuOpen(false)}>
                    <div className="latest-post-card">
                      <div className="latest-post-top">
                        {getPostImageUrl(latestPost) && (
                          <div className="latest-post-image">
                            <img
                              src={getPostImageUrl(latestPost)}
                              alt={latestPost.featuredImage?.alt || latestPost.title}
                              width={300}
                              height={150}
                            />
                          </div>
                        )}
                      </div>

                      <div className="latest-post-content">
                        <h5 className="latest-post-title">{latestPost.title}</h5>
                        {latestPost.publishedAt && (
                          <div className="latest-post-date">
                            <span>{formatDate(latestPost.publishedAt)}</span>
                          </div>
                        )}

                        {latestPost.excerpt && (
                          <p className="latest-post-excerpt">{latestPost.excerpt}</p>
                        )}

                        {getPostCategories(latestPost).length > 0 && (
                          <div className="latest-post-category">
                            <span>{getPostCategories(latestPost)[0].title}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export default DynamicHeaderNav
