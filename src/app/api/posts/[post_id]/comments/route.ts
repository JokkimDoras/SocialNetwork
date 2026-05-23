import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { post_id } = await params

    const { data: comments, error } = await supabaseAdmin
      .from('comments')
      .select(`*, user:users(id, username, first_name, last_name, avatar_url)`)
      .eq('post_id', post_id)
      .order('created_at', { ascending: true })

    if (error) throw error

    return NextResponse.json({ comments })

  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ post_id: string }> }
) {
  try {
    const { post_id } = await params

    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { content } = await req.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })
    }

    const { data: comment, error } = await supabaseAdmin
      .from('comments')
      .insert({
        content: content.trim(),
        user_id: payload.userId,
        post_id: post_id,
      })
      .select(`*, user:users(id, username, first_name, last_name, avatar_url)`)
      .single()

    if (error) throw error

    await supabaseAdmin.rpc('increment_comment_count', { post_id_input: post_id })

    return NextResponse.json({ comment }, { status: 201 })

  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}