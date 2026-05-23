import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch posts
    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        author:users(id, username, first_name, last_name, avatar_url)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    // Fetch which posts this user has liked
    const { data: likes } = await supabaseAdmin
      .from('likes')
      .select('post_id')
      .eq('user_id', payload.userId)

    const likedPostIds = new Set(likes?.map((l) => l.post_id) || [])

    // Add isLiked to each post
    const postsWithLikes = posts.map((post) => ({
      ...post,
      isLiked: likedPostIds.has(post.id),
    }))

    return NextResponse.json({ posts: postsWithLikes })

  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}