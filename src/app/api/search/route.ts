import { NextRequest, NextResponse } from 'next/server'
import axios, { AxiosError } from 'axios'
import { formatLabel, sortTags } from '@/utils/helpers'

export async function POST(request: NextRequest) {
  try {
    const { query, pid } = await request.json()
    if (!Array.isArray(query)) {
      return NextResponse.json({ error: 'Invalid query format' }, { status: 400 })
    }
    const tags: string[] = query.map(q => q.replace(/\s+/g, '_').trim())

    const optionalTags = tags.filter(tag => tag.startsWith('~'))
    const searchTags = tags.filter(tag => !tag.startsWith('~')).map(tag => tag.startsWith('+') ? tag.slice(1) : tag)

    searchTags.unshift(`( ${optionalTags.map(t => t.slice(1)).join(' ~ ')} )`)

    const parsedTags = `sort:id:desc ${searchTags.join(' ')}`.trim()

    const [response, countResponse] = await Promise.all([
      axios.get<Array<Omit<IPost, 'date' | 'type'> & { change: number, sample_url: string }>>('https://api.rule34.xxx/index.php', {
        params: {
          page: 'dapi',
          s: 'post',
          q: 'index',
          fields: 'tag_info',
          json: 1,
          limit: 20,
          tags: parsedTags,
          pid
        }
      }),
      axios.get<string>('https://api.rule34.xxx/index.php', {
        params: {
          page: 'dapi',
          s: 'post',
          q: 'index',
          limit: 0,
          tags: parsedTags,
        }
      }),
    ])

    if (!response.data || !countResponse.data) {
      return NextResponse.json({ data: [], total: 0 })
    }

    const data = response.data.map(item => ({
      id: item.id,
      file_url: item.file_url,
      preview_url: item.sample_url,
      width: item.width,
      height: item.height,
      rating: item.rating,
      score: item.score,
      tags: item.tags,
      source: item.source || '',
      comment_count: item.comment_count,
      tag_info: sortTags(item.tag_info).map(tag => ({
        ...tag,
        tag: formatLabel(tag.tag)
      })),
      originalSource: 'rule34',
      date: item.change * 1000,
      type: item.file_url.endsWith('.mp4') || item.file_url.endsWith('.webm') ? 'video' : item.file_url.endsWith('.gif') ? 'gif' : 'image',
    }) satisfies IPost)

    return NextResponse.json({
      data,
      total: +(countResponse.data.match(/<posts count="(\d+)"/)?.[1] ?? 0),
    })
  } catch (e) {
    console.error((e as AxiosError).response ?? e)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
