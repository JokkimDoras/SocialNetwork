import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ user_id: string }> }) {
  try {
    const { user_id } = await params

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id,username,first_name,last_name,bio,avatar_url,website,location,posts_count,followers_count,following_count,created_at')
      .eq('id', user_id)
      .single()

    if (error || !user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: posts } = await supabaseAdmin
      .from('posts')
      .select('*, author:users(id, username, first_name, last_name, avatar_url)')
      .eq('author_id', user_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    return NextResponse.json({ user, posts })

  } catch (err) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}