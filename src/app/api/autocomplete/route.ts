import { extractCount, formatLabel } from '@/utils/helpers'
import { NextRequest, NextResponse } from 'next/server'
import axios, { AxiosError } from 'axios'

export async function POST(request: NextRequest) {
  try {
    let { query } = await request.json()
    query = query.trim().replace(/\s+/g, '_')

    if (query.length === 0) {
      return NextResponse.json([])
    }

    const response = await axios.get<Array<{ label: string, value: string, type: TType }>>('https://ac.rule34.xxx/autocomplete.php', {
      params: {
        q: query,
      },
      headers: {
        Referer: 'https://rule34.xxx/'
      }
    })

    const data = response.data.map(item => ({
      label: formatLabel(item.value),
      source: 'rule34',
      type: item.type,
      count: extractCount(item.label),
    }) satisfies ITag)

    return NextResponse.json(data)
  } catch (e) {
    console.error((e as AxiosError).response)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}
