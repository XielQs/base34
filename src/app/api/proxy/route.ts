import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_DOMAINS = [
  'api-cdn-mp4.rule34.xxx',
  'api-cdn.rule34.xxx'
]

export async function GET(request: NextRequest) {
  const  { searchParams } = new URL(request.url)
  const query = searchParams.get('query')
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
  }
  try {
    const domain = new URL(query).hostname
    if (!ALLOWED_DOMAINS.includes(domain)) {
      return NextResponse.json({ error: 'Invalid domain' }, { status: 403 })
    }
    const response = await fetch(query, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      }
    })
    if (!response.ok || !response.body) {
      return NextResponse.json({ error: 'Failed to fetch the resource' }, { status: response.status })
    }
    
    return new Response(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Length': response.headers.get('Content-Length') || '',
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (e) {
    console.error('Error fetching resource:', e)
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
