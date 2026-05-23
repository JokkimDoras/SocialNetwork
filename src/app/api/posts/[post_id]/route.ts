import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ post_id: string }> }) {
  try {
    const { post_id } = await params
    const token = req.cookies.get('token')?.value

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: post } = await supabaseAdmin
      .from('posts')
      .select('id, author_id')
      .eq('id', post_id)
      .single()

    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    if (post.author_id !== payload.userId) {
      return NextResponse.json({ error: 'You can only delete your own posts' }, { status: 403 })
    }

    await supabaseAdmin.from('posts').delete().eq('id', post_id)
    await supabaseAdmin.rpc('decrement_posts_count', { user_id: payload.userId })

    return NextResponse.json({ message: 'Post deleted successfully' })

  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}