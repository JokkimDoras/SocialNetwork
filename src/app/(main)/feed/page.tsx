'use client'

import { useState, useEffect } from 'react'
import { Post } from '@/types'
import { formatDistanceToNow } from 'date-fns'

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const fetchPosts = async () => {
    const res = await fetch('/api/feed')
    const data = await res.json()
    if (data.posts) setPosts(data.posts)
        console.log(posts)

  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const handlePost = async () => {
    if (!content.trim()) return
    setLoading(true)
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (res.ok) {
      setContent('')
      fetchPosts()
    }
    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* Feed */}
      <div className="md:col-span-2 flex flex-col gap-4">

        {/* Create Post */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={280}
            rows={3}
            className="w-full text-sm resize-none bg-transparent outline-none text-neutral-900 dark:text-white placeholder:text-neutral-400"
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xs text-neutral-400">{content.length}/280</span>
            <button
              onClick={handlePost}
              disabled={loading || !content.trim()}
              className="px-4 py-1.5 bg-neutral-950 text-white text-sm rounded-full hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center text-sm text-neutral-400 py-10">
            No posts yet. Be the first to post!
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-xs font-medium text-teal-700 dark:text-teal-300">
                  {post.author?.first_name?.[0]}{post.author?.last_name?.[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">
                    {post.author?.first_name} {post.author?.last_name}
                  </p>
                  <p className="text-xs text-neutral-400">
                    @{post.author?.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed mb-3">
                {post.content}
              </p>

              {post.image_url && (
                <img
                  src={post.image_url}
                  alt="post"
                  className="w-full rounded-xl mb-3 object-cover max-h-80"
                />
              )}

              <div className="flex items-center gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-red-500 transition-colors">
                  ❤️ {post.like_count}
                </button>
                <button className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-teal-500 transition-colors">
                  💬 {post.comment_count}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Sidebar */}
      <div className="hidden md:flex flex-col gap-4">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">Who to follow</p>
          <p className="text-sm text-neutral-400">Coming soon!</p>
        </div>
      </div>

    </div>
  )
}