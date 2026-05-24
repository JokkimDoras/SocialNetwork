'use client'

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { GrLike } from "react-icons/gr"
import { BiCommentDetail } from "react-icons/bi"
import { MdClose } from "react-icons/md"
import toast from "react-hot-toast"

export default function ProfilePage() {
  const { user_id } = useParams()
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ bio: '', location: '', website: '' })

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch(`/api/users/${user_id}`)
      const data = await res.json()
      if (data.user) setUser(data.user)
      if (data.posts) setPosts(data.posts)
    }

    const getMe = async () => {
      const res = await fetch('/api/users/me')
      const data = await res.json()
      if (data.user) setCurrentUserId(data.user.id)
    }

    fetchProfile()
    getMe()
  }, [user_id])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleClick = async () => {
    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio: form.bio, location: form.location, website: form.website })
    })
    if (res.ok) {
      const data = await res.json()
      if (data.user) setUser(data.user)
      toast.success('Profile updated!')
    }
    setEditing(false)
  }

  if (!user) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
    </div>
  )

  const isOwnProfile = currentUserId === user.id

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-4">

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 w-full max-w-md mx-4 shadow-xl">
            
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-neutral-900 dark:text-white">Edit profile</h2>
              <button onClick={() => setEditing(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors">
                <MdClose size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Bio</label>
                <textarea
                  name="bio"
                  onChange={handleChange}
                  defaultValue={user.bio || ''}
                  placeholder="Tell people about yourself..."
                  maxLength={160}
                  rows={3}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none resize-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Location</label>
                <input
                  name="location"
                  onChange={handleChange}
                  defaultValue={user.location || ''}
                  placeholder="Chennai, India"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="block text-xs text-neutral-400 mb-1">Website</label>
                <input
                  name="website"
                  onChange={handleChange}
                  defaultValue={user.website || ''}
                  placeholder="https://yoursite.com"
                  className="w-full text-sm px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2 text-sm border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClick}
                className="flex-1 py-2 text-sm bg-neutral-950 text-white rounded-xl hover:bg-neutral-800 transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-xl font-medium text-teal-700 dark:text-teal-300 flex-shrink-0">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-medium text-neutral-900 dark:text-white">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-sm text-neutral-400">@{user.username}</p>
            {user.bio && (
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1.5 leading-relaxed">{user.bio}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-2">
              {user.location && (
                <span className="text-xs text-neutral-400">📍 {user.location}</span>
              )}
              {user.website && (
                <a href={user.website} target="_blank" rel="noreferrer" className="text-xs text-teal-500 hover:underline">
                  🔗 {user.website}
                </a>
              )}
            </div>
          </div>
          {isOwnProfile && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-1.5 text-xs border border-neutral-200 dark:border-neutral-700 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-700 dark:text-neutral-300 flex-shrink-0"
            >
              Edit profile
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.posts_count}</p>
            <p className="text-xs text-neutral-400">Posts</p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.followers_count}</p>
            <p className="text-xs text-neutral-400">Followers</p>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">{user.following_count}</p>
            <p className="text-xs text-neutral-400">Following</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide px-1">Posts</p>

      {posts.length === 0 ? (
        <div className="text-center text-sm text-neutral-400 py-10 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          No posts yet!
        </div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4">
            <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed mb-3">
              {post.content}
            </p>
            {post.image_url && (
              <img src={post.image_url} alt="post" className="w-full rounded-xl mb-3 object-cover max-h-80" />
            )}
            <div className="flex items-center gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                <GrLike size={13} /> {post.like_count}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                <BiCommentDetail size={13} /> {post.comment_count}
              </span>
              <span className="text-xs text-neutral-400 ml-auto">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}