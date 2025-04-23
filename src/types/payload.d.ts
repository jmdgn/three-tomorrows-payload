declare module 'payload/types' {
  export interface CollectionConfig {
    slug: string
    admin?: {
      useAsTitle?: string
    }
    fields?: any[]
  }
}
