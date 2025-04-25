import React from 'react'
import { Post } from '../../../payload-types'

async function getHomePageData() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/posts?limit=6&sort=-publishedAt`,
    )
    if (!res.ok) throw new Error('Failed to fetch posts')
    const response = await res.json()
    return response
  } catch (error) {
    console.error('Error fetching posts:', error)
    return { docs: [] }
  }
}

export default async function HomePage() {
  const { docs: posts } = await getHomePageData()

  return (
    <div className="home-page">
      <section className="welcome">
        <h1>Welcome to Our Site</h1>
        <p>This is the main site area with the standard layout.</p>
      </section>

      <section className="recent-posts">
        <h2>Recent Posts</h2>
        <div className="posts-grid">
          {posts.map((post: Post) => (
            <div key={post.id} className="post-card">
              <h3>{post.title}</h3>
              <p>{post.title}</p>
              <a href={`/blog/${post.slug}`}>Read more</a>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
