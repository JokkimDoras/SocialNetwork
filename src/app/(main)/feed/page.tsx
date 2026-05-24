'use client'

import { useState, useEffect } from 'react'
import { Post } from '@/types'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { GrLike } from "react-icons/gr";
import { MdDeleteOutline } from "react-icons/md";
import { BiCommentDetail } from "react-icons/bi";




export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [likeLoading, setLikeLoading] = useState<string | null>(null)
  const [openComments, setOpenComments] = useState<string | null>(null)
  const [commentText, setCommentText] = useState('')
  const [comments, setComments] = useState<Record<string, any[]>>({})
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      
      try {
        // 1. Try to get the user data
        const res = await fetch('/api/users/me')
        const data = await res.json()
        if(data.error) toast.error('Unauthorized Entry')
  
        // 2. Use the "?" to safely check if data.user exists
        if (data?.user?.id) {
          setCurrentUserId(data.user.id)
        } else {
          throw new Error('Session Expired! Try Login Again')
        }
  
      } catch (error) {
        console.log("We caught the error! The message was:", error.message)
      }
  
    }
  
    getUser()
    fetchPosts()
  }, [])




const fetchComments = async (postId: string) => {
  const res = await fetch(`/api/posts/${postId}/comments`)
  const data = await res.json()
  if (data.comments) {
    setComments((prev) => ({ ...prev, [postId]: data.comments }))
  }
}

const handleComment = async (postId: string) => {
  if (!commentText.trim()) return
  const res = await fetch(`/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: commentText }),
  })
  if (res.ok) {
    setCommentText('')
    fetchComments(postId)
    fetchPosts()
  }
}
  const fetchPosts = async () => {
    const res = await fetch('/api/feed')
    const data = await res.json()
    if (data.posts) setPosts(data.posts)
  }

  useEffect(() => {
    fetchPosts()

  }, [])

  const handleLike = async (post:string | any) => {
    if (likeLoading === post.id) return
    setLikeLoading(post.id)
  
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id !== post.id) return p
        return {
          ...p,
          isLiked: !p.isLiked,
          like_count: p.isLiked ? p.like_count - 1 : p.like_count + 1,
        }
      })
    )
  
    try {
      await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: post.id }),
      })
    } catch {
      toast.error('Failed to update like')
    } finally {
      setLikeLoading(null)
    }
  }

  const handlePost = async () => {
    if (!content.trim()) return
    setLoading(true)
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if(!res.ok) {
      toast.error('Session expired. Please log in again')
      setLoading(false)
      return
    }
    if (res.ok) {
      setContent('')
      fetchPosts()
    }
    setLoading(false)
  }

  const handleDelete = async (postId: string) => {
    const res = await fetch(`/api/posts/${postId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      toast.success('Post deleted!')
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } else {
      toast.error('Failed to delete post')
    }
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
  
  {/* Post Header */}
  <div className="flex items-center gap-3 mb-3">
    <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-xs font-medium text-teal-700 dark:text-teal-300 flex-shrink-0">
      {post.author?.first_name?.[0]}{post.author?.last_name?.[0]}
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-neutral-900 dark:text-white">
        {post.author?.first_name} {post.author?.last_name}
      </p>
      <p className="text-xs text-neutral-400">
        @{post.author?.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
      </p>
    </div>
    {post.author_id === currentUserId && (
      <button
        onClick={() => handleDelete(post.id)}
        className="text-neutral-300 hover:text-red-500 transition-colors"
      >
        <MdDeleteOutline size={18} />
      </button>
    )}
  </div>

  {/* Post Content */}
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

  {/* Like & Comment Buttons */}
  <div className="flex items-center gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
    <button
      disabled={likeLoading === post.id}
      onClick={() => handleLike(post)}
      className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-blue-500 transition-colors"
    >
      <GrLike className={`transition-colors duration-200 ${post.isLiked ? 'text-blue-500' : ''}`} />
      {post.like_count}
    </button>
    <button
      onClick={() => {
        if (openComments === post.id) {
          setOpenComments(null)
        } else {
          setOpenComments(post.id)
          fetchComments(post.id)
        }
      }}
      className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-teal-500 transition-colors"
    >
      <BiCommentDetail size={15} />
      {post.comment_count}
    </button>
  </div>

  {/* Comments Section — OUTSIDE the flex row! */}
  {openComments === post.id && (
    <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 text-xs px-3 py-2 rounded-full border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none"
        />
        <button
          onClick={() => handleComment(post.id)}
          className="px-3 py-1.5 bg-neutral-950 text-white text-xs rounded-full hover:bg-neutral-800 transition-colors"
        >
          Send
        </button>
      </div>

      {(comments[post.id] || []).map((comment) => (
        <div key={comment.id} className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-xs font-medium text-teal-700 dark:text-teal-300 flex-shrink-0">
            {comment.user?.first_name?.[0]}{comment.user?.last_name?.[0]}
          </div>
          <div className="flex-1 bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2">
            <p className="text-xs font-medium text-neutral-900 dark:text-white">
              {comment.user?.first_name} {comment.user?.last_name}
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
              {comment.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  )}

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