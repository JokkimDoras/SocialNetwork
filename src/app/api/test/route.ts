import { supabaseAdmin } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('count')

  if (error) {
    return NextResponse.json({ connected: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ connected: true, message: 'Supabase is connected! 🔥' })
}