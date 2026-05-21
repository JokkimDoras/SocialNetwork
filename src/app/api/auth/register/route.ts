import { supabaseAdmin } from '@/lib/supabase'
import { signToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, username, password, first_name, last_name } = await req.json()

    if (!email || !username || !password || !first_name || !last_name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Invalid username. 3-30 chars, letters/numbers/underscore only' }, { status: 400 })
    }

    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Email or username already taken' }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 10)

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert({ email, username, password_hash, first_name, last_name })
      .select('id, email, username, first_name, last_name')
      .single()

    if (error) throw error

    const token = await signToken({ userId: user.id, username: user.username })

    const response = NextResponse.json({ user, token }, { status: 201 })
    response.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 })
    return response

  } catch (err: any) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}