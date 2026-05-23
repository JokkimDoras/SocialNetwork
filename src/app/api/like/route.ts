import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)

    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { postId } = await req.json()

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID required' },
        { status: 400 }
      )
    }

    // Check existing like
    const { data: existingLike } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', payload.userId)
      .eq('post_id', postId)
      .maybeSingle()

    // UNLIKE
    if (existingLike) {
      await supabaseAdmin
        .from('likes')
        .delete()
        .eq('id', existingLike.id)

      await supabaseAdmin.rpc('decrement_like_count', {
        post_id_input: postId,
      })

      return NextResponse.json({
        liked: false,
      })
    }

    // LIKE
    await supabaseAdmin
      .from('likes')
      .insert({
        user_id: payload.userId,
        post_id: postId,
      })

    await supabaseAdmin.rpc('increment_like_count', {
      post_id_input: postId,
    })

    return NextResponse.json({
      liked: true,
    })

  } catch (err) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}