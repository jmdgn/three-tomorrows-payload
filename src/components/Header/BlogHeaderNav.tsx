'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { usePostHeader } from '../../providers/PostHeaderProvider'

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
}

const FALLBACK_NAV_ITEMS = [
  { label: 'Services', url: '/services' },
  { label: 'Approach', url: '/our-approach' },
  { label: 'Why This Matters', url: '/why-this-matters' },
  { label: 'Expertise', url: '/expertise' },
  { label: 'Blog', url: '/posts' },
]

export const BlogHeaderNav: React.FC<{ data: HeaderData | null }> = ({ data }) => {
  const pathname = usePathname()
  const { postData } = usePostHeader()
  const isPostPage = pathname?.startsWith('/posts/') || false

  // For debugging
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('BlogHeaderNav running with path:', pathname)
      console.log('Is post page:', isPostPage)
      console.log('Post data:', postData)
      console.log('Header data navItems count:', data?.navItems?.length || 0)
    }
  }, [pathname, isPostPage, postData, data])

  const navItems = React.useMemo(() => {
    if (!data?.navItems || !Array.isArray(data.navItems) || data.navItems.length === 0) {
      return FALLBACK_NAV_ITEMS
    }

    const validItems = data.navItems
      .filter((item) => {
        const hasLabel = Boolean(item.link?.label)

        // Enhanced validation logic for different link types
        let hasValidLink = false
        if (item.link?.url) {
          hasValidLink = true
        } else if (item.link?.type === 'custom') {
          hasValidLink = true
        } else if (item.link?.type === 'reference' && item.link?.reference?.value) {
          hasValidLink = true
        }

        return hasLabel && hasValidLink
      })
      .map((item) => {
        // Handle reference links specially
        if (item.link?.type === 'reference' && item.link?.reference?.value) {
          const refValue = item.link.reference.value
          return {
            label: item.link.label || refValue.title || 'Page',
            url: item.link.url || `/${refValue.slug}` || '#',
            newTab: item.link.newTab || false,
          }
        }

        return {
          label: item.link!.label!,
          url: item.link!.url || '#',
          newTab: item.link!.newTab || false,
        }
      })

    return validItems.length > 0 ? validItems : FALLBACK_NAV_ITEMS
  }, [data])

  return (
    <header className={isPostPage ? 'blog' : 'main-nav'}>
      <nav className="mainNav">
        <div className="header-container">
          <div className="logo-container">
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

          {isPostPage && postData?.title ? (
            <div className="articleDetails-nav">
              <div className="title-HeaderText">
                <p>{postData.title}</p>
              </div>
              <div className="shareButton-header">
                <button className="articleShare" data-menu="header-share">
                  <p>Share Article</p>
                  <span className="shareIcon">
                    <svg
                      className="shareSVG"
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="#000"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M11.9997 0.374735V3.17512C11.9997 3.27458 11.9602 3.36996 11.8899 3.44029C11.8196 3.51062 11.7242 3.55013 11.6247 3.55013C11.5253 3.55013 11.4299 3.51062 11.3595 3.44029C11.2892 3.36996 11.2497 3.27458 11.2497 3.17512V1.28023L6.58427 5.94512C6.55007 5.98237 6.50868 6.01232 6.4626 6.03317C6.41652 6.05401 6.36669 6.06531 6.31613 6.06639C6.26557 6.06747 6.2153 6.0583 6.16837 6.03945C6.12144 6.02059 6.07881 5.99244 6.04305 5.95668C6.00729 5.92091 5.97913 5.87828 5.96028 5.83135C5.94142 5.78442 5.93226 5.73416 5.93334 5.6836C5.93442 5.63303 5.94572 5.58321 5.96656 5.53713C5.9874 5.49104 6.01735 5.44966 6.05461 5.41545L10.7195 0.750017H8.72634C8.62688 0.750017 8.5315 0.710507 8.46117 0.64018C8.39084 0.569852 8.35133 0.474467 8.35133 0.375009C8.35133 0.27555 8.39084 0.180165 8.46117 0.109837C8.5315 0.0395097 8.62688 0 8.72634 0H11.625C11.7244 3.62748e-05 11.8197 0.0395288 11.8899 0.109797C11.9602 0.180066 11.9997 0.27536 11.9997 0.374735ZM11.625 5.62485C11.5757 5.62482 11.5269 5.63449 11.4814 5.65332C11.4359 5.67215 11.3945 5.69977 11.3596 5.7346C11.3248 5.76942 11.2971 5.81077 11.2783 5.85629C11.2594 5.90181 11.2497 5.95059 11.2497 5.99986V11.2497H0.750017V0.750017H5.92609C6.02555 0.750017 6.12094 0.710507 6.19126 0.64018C6.26159 0.569852 6.3011 0.474467 6.3011 0.375009C6.3011 0.27555 6.26159 0.180165 6.19126 0.109837C6.12094 0.0395097 6.02555 0 5.92609 0H0.374735C0.27536 3.62748e-05 0.180066 0.0395288 0.109797 0.109797C0.0395288 0.180066 3.62998e-05 0.27536 2.49958e-08 0.374735V11.625C-1.796e-05 11.6742 0.00966966 11.723 0.0285092 11.7685C0.0473488 11.814 0.074971 11.8554 0.109797 11.8902C0.144624 11.925 0.185972 11.9527 0.231478 11.9715C0.276984 11.9903 0.325757 12 0.375009 12H11.625C11.6742 12 11.723 11.9903 11.7685 11.9715C11.814 11.9527 11.8554 11.925 11.8902 11.8902C11.925 11.8554 11.9527 11.814 11.9715 11.7685C11.9903 11.723 12 11.6742 12 11.625V5.99986C12 5.9004 11.9605 5.80502 11.8902 5.73469C11.8198 5.66436 11.7244 5.62485 11.625 5.62485Z" />
                    </svg>
                  </span>
                </button>

                <div className="share-buttons" id="header-share">
                  <div className="shareButton-row">
                    <a
                      href={`mailto:?subject=${encodeURIComponent(postData.title || 'Check out this article')}&body=${encodeURIComponent(`I thought you might find this interesting: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                      className="share-button"
                    >
                      <span>
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M8.2248 1.00191L8.76726 0.549976C9.14356 0.236729 9.51497 0 10.0012 0C10.485 0 10.8564 0.236729 11.2327 0.549976L11.7752 1.00191H8.2248ZM3.63103 1.71688H16.3714C17.1045 1.71688 17.7056 2.30512 17.7056 3.02487V8.27116C17.7056 8.39072 17.6518 8.49115 17.5541 8.5605L17.0947 8.88809C17.0263 8.93592 16.9407 8.94309 16.8674 8.90483C16.7917 8.86896 16.7477 8.79723 16.7477 8.71354V3.06552C16.7477 2.86944 16.584 2.70684 16.3812 2.70684H3.61882C3.41845 2.70684 3.25229 2.86944 3.25229 3.06552V8.71354C3.25229 8.79723 3.20831 8.86657 3.135 8.90483C3.05925 8.94309 2.97373 8.93592 2.90531 8.88809L2.44594 8.5605C2.3482 8.49115 2.29444 8.39072 2.29444 8.27116V3.02487C2.29444 2.30512 2.89554 1.71688 3.63103 1.71688ZM10.0012 20H1.46121C0.6573 20 0 19.3568 0 18.5701V9.03156C0 8.51985 0.0244349 7.8527 0.799023 7.20708L0.962737 7.07078C1.07269 6.97752 1.2193 6.95839 1.35125 7.01817C1.4832 7.07795 1.56384 7.1999 1.56384 7.34338V8.45529C1.56384 8.68962 1.66891 8.89527 1.86683 9.03396L2.21869 9.28264L9.1289 14.3161C9.65425 14.6987 10.3458 14.6987 10.8736 14.3161L17.7813 9.28264L18.1356 9.03396C18.3311 8.89527 18.4362 8.68962 18.4362 8.45529V7.34338C18.4362 7.1999 18.5168 7.07795 18.6487 7.01817C18.7807 6.95839 18.9273 6.97752 19.0397 7.07078L19.201 7.20708C19.9756 7.8527 20 8.51985 20 9.03156V18.5701C20 19.3568 19.3427 20 18.5388 20H10.0012Z"
                            fill="#2D33E0"
                          />
                        </svg>
                      </span>
                      <p>Email</p>
                    </a>

                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      className="share-button"
                      rel="noopener noreferrer"
                    >
                      <span>
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M16.3636 0H1.63636C0.732273 0 0 0.732273 0 1.63636V16.3636C0 17.2677 0.732273 18 1.63636 18H16.3636C17.2677 18 18 17.2677 18 16.3636V1.63636C18 0.732273 17.2677 0 16.3636 0ZM5.68964 14.7273H3.276V6.96109H5.68964V14.7273ZM4.45827 5.85082C3.68018 5.85082 3.051 5.22 3.051 4.44355C3.051 3.66709 3.681 3.03709 4.45827 3.03709C5.23391 3.03709 5.86473 3.66791 5.86473 4.44355C5.86473 5.22 5.23391 5.85082 4.45827 5.85082ZM14.7305 14.7273H12.3185V10.9505C12.3185 10.0497 12.3022 8.89118 11.0643 8.89118C9.80836 8.89118 9.61527 9.87218 9.61527 10.8851V14.7273H7.20327V6.96109H9.51873V8.02227H9.55145C9.87382 7.41191 10.6609 6.768 11.835 6.768C14.2789 6.768 14.7305 8.37655 14.7305 10.4678V14.7273Z"
                            fill="#0A66C2"
                          />
                        </svg>
                      </span>
                      <p>LinkedIn</p>
                    </a>

                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      className="share-button"
                      rel="noopener noreferrer"
                    >
                      <span>
                        <svg
                          width="20"
                          height="18"
                          viewBox="0 0 20 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M15.7512 0H18.818L12.1179 7.62462L20 18H13.8284L8.99458 11.7074L3.46359 18H0.394938L7.5613 9.84462L0 0H6.32828L10.6976 5.75169L15.7512 0ZM14.6748 16.1723H16.3742L5.4049 1.73169H3.58133L14.6748 16.1723Z"
                            fill="black"
                          />
                        </svg>
                      </span>
                      <p>Twitter/X</p>
                    </a>

                    <a
                      href={`https://bsky.app/intent/compose?text=Check this out: ${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      className="share-button"
                      rel="noopener noreferrer"
                    >
                      <span>
                        <svg
                          width="20"
                          height="18"
                          viewBox="0 0 20 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4.33526 1.21162C6.62822 2.97119 9.09455 6.53886 10.0001 8.45349C10.9056 6.53901 13.3718 2.97116 15.6649 1.21162C17.3193 -0.0580136 20 -1.04038 20 2.08557C20 2.70987 19.6498 7.32999 19.4444 8.08004C18.7306 10.6878 16.1292 11.3529 13.8152 10.9503C17.86 11.654 18.8889 13.9848 16.6668 16.3156C12.4465 20.7423 10.601 15.205 10.1278 13.7861C10.0412 13.526 10.0006 13.4043 10 13.5078C9.9994 13.4043 9.95884 13.526 9.87215 13.7861C9.39925 15.205 7.55378 20.7424 3.33322 16.3156C1.11103 13.9848 2.13995 11.6538 6.18483 10.9503C3.87077 11.3529 1.26934 10.6878 0.555548 8.08004C0.350163 7.32991 0 2.7098 0 2.08557C0 -1.04038 2.68074 -0.0580136 4.33515 1.21162H4.33526Z"
                            fill="#1185FE"
                          />
                        </svg>
                      </span>
                      <p>Bluesky</p>
                    </a>
                  </div>

                  <button id="copy-link-header" className="copyLink">
                    <span>
                      <svg
                        className="copylink-icon"
                        width="14"
                        height="14"
                        viewBox="0 0 15 15"
                        fill="#000"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M2.10729 14.3H9.68896C9.95235 14.3 10.2132 14.2446 10.4565 14.137C10.6999 14.0295 10.921 13.8718 11.1072 13.673C11.2935 13.4742 11.4412 13.2382 11.542 12.9785C11.6428 12.7188 11.6947 12.4404 11.6947 12.1593V5.00948C11.6947 4.44174 11.4834 3.89725 11.1072 3.49579C10.7311 3.09434 10.2209 2.8688 9.68896 2.8688H2.10729C1.57534 2.8688 1.06517 3.09434 0.689027 3.49579C0.31288 3.89725 0.101563 4.44174 0.101562 5.00948V12.1593C0.101562 12.4404 0.153442 12.7188 0.25424 12.9785C0.355037 13.2382 0.502778 13.4742 0.689027 13.673C0.875277 13.8718 1.09639 14.0295 1.33973 14.137C1.58308 14.2446 1.8439 14.3 2.10729 14.3ZM0.903855 5.00948C0.903855 4.66883 1.03065 4.34214 1.25633 4.10127C1.48202 3.86039 1.78812 3.72507 2.10729 3.72507H9.68896C9.84699 3.72507 10.0035 3.7583 10.1495 3.82284C10.2955 3.88739 10.4282 3.982 10.5399 4.10127C10.6517 4.22054 10.7403 4.36213 10.8008 4.51796C10.8613 4.67379 10.8924 4.84081 10.8924 5.00948V12.1593C10.8924 12.5 10.7656 12.8267 10.5399 13.0675C10.3142 13.3084 10.0081 13.4437 9.68896 13.4437H2.10729C1.78812 13.4437 1.48202 13.3084 1.25633 13.0675C1.03065 12.8267 0.903855 12.5 0.903855 12.1593V5.00948Z" />
                        <path d="M14.1003 10.9391V2.8688C14.1003 2.18751 13.8468 1.53412 13.3954 1.05237C12.944 0.570629 12.3318 0.299988 11.6935 0.299988H3.22927C3.12288 0.299988 3.02085 0.345095 2.94562 0.425386C2.87039 0.505676 2.82812 0.614574 2.82812 0.728122C2.82812 0.841671 2.87039 0.950569 2.94562 1.03086C3.02085 1.11115 3.12288 1.15626 3.22927 1.15626H11.6935C12.119 1.15626 12.5271 1.33669 12.8281 1.65785C13.129 1.97901 13.298 2.4146 13.298 2.8688V10.9391C13.298 11.0527 13.3403 11.1616 13.4155 11.2419C13.4908 11.3222 13.5928 11.3673 13.6992 11.3673C13.8056 11.3673 13.9076 11.3222 13.9828 11.2419C14.0581 11.1616 14.1003 11.0527 14.1003 10.9391Z" />
                      </svg>
                    </span>
                    <p>Copy Link</p>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="menu-container">
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
          )}

          <div className="contactBtn-container">
            <div className="headerContact">
              <Link className="contactCta header" href="/contact">
                Let&apos;s Talk
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {isPostPage && (
        <div className="progress-container">
          <div className="progressBar"></div>
        </div>
      )}
    </header>
  )
}

export default BlogHeaderNav
