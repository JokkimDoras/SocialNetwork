import { supabaseAdmin } from '@/lib/supabase'
import { signToken } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json()

    if (!password || (!email && !username)) {
      return NextResponse.json({ error: 'Credentials required' }, { status: 400 })
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(email ? `email.eq.${email}` : `username.eq.${username}`)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id)

    const token = await signToken({ userId: user.id, username: user.username })

    const { password_hash, ...safeUser } = user
    const response = NextResponse.json({ user: safeUser, token })
    response.cookies.set('token', token, { httpOnly: true, maxAge: 60 * 60 * 24 * 7 })
    return response

  } catch (err: any) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}