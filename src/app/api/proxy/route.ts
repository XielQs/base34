import { NextRequest, NextResponse } from 'next/server'
import axios, { AxiosError } from 'axios'

const ALLOWED_DOMAINS = [
  'api-cdn-mp4.rule34.xxx',
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
    const response = await axios.get(query, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      },
      responseType: 'arraybuffer',
    })
    const contentType = response.headers['content-type']
    const contentLength = response.headers['content-length']
    
    return new Response(response.data, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Content-Length': contentLength,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const axiosError = e as AxiosError
      return NextResponse.json({ error: axiosError.message }, { status: 500 })
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 })
  }
}
