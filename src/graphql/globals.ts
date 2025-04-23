export const HEADER_QUERY = `
  query Header {
    Header {
      logo {
        url
        alt
        width
        height
      }
      navItems {
        link {
          label
          url
          reference {
            value {
              ... on Page {
                slug
              }
            }
            relationTo
          }
        }
      }
      ctaLabel
      ctaLink
    }
  }
`

export const FOOTER_QUERY = `
  query Footer {
    Footer {
      navItems {
        link {
          label
          url
          reference {
            value {
              ... on Page {
                slug
              }
            }
            relationTo
          }
        }
      }
      socialLinks {
        icon
        url
      }
      copyright
    }
  }
`