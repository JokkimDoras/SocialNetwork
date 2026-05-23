import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
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

    return NextResponse.json({ posts })

  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    // console.log(token)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, image_url } = await req.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    if (content.length > 280) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 })
    }

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert({
        content: content.trim(),
        author_id: payload.userId,
        image_url: image_url || null,
      })
      .select(`
        *,
        author:users(id, username, first_name, last_name, avatar_url)
      `)
      .single()

    if (error) throw error

    // Update posts_count on user
    await supabaseAdmin.rpc('increment_posts_count', { user_id: payload.userId })

    return NextResponse.json({ post }, { status: 201 })

  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}