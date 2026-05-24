import { supabaseAdmin } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, username, first_name, last_name, bio, avatar_url, posts_count, followers_count, following_count')
      .eq('id', payload.userId)
      .single()

    if (error) throw error

    return NextResponse.json({ user })

  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { bio, location, website } = await req.json()

    if (bio && bio.length > 160) {
      return NextResponse.json({ error: 'Bio must be under 160 characters' }, { status: 400 })
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({
        bio,
        location,
        website,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.userId)
      .select('id, username, first_name, last_name, bio, location, website, avatar_url')
      .single()

    if (error) throw error

    return NextResponse.json({ user })

  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}