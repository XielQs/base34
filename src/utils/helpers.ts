export const extractCount = (label: string) => +(label.match(/\((\d+)\)$/)?.[1] ?? 0)

const htmlEntities = {
  '&#034;': '"',
  '&#038;': '&',
  '&#039;': "'",
  '&eacute;': 'é'
}

const replaceHTMLEntities = (label: string) => label.replace(/&#034;|&#038;|&#039;|&eacute;/g, r => htmlEntities[r as keyof typeof htmlEntities])

export const formatLabel = (label: string) => replaceHTMLEntities(label.replace(/_/g, ' ').replace(/\s+/g, ' ')).trim()

export const sortTags = (tags: IRawTag[]) => tags.sort((a, b) => {
  const typeOrder = {
    artist: 1,
    character: 2,
    copyright: 3,
    general: 4,
    metadata: 5,
    tag: 6
  }
  const aType = typeOrder[a.type]
  const bType = typeOrder[b.type]
  if (aType !== bType) {
    return aType - bType
  }
  return a.tag.localeCompare(b.tag)
})

// https://github.com/kurozenzen/kurosearch/tree/main/src/lib/logic/format-relative-time.ts
export const formatCreatedAt = (createdAt: number) => {
	const then = new Date(createdAt).getTime() / 60_000
	const now = new Date().getTime() / 60_000

	const minutesAgo = now - then
	if (minutesAgo < 1) return 'Just now'
	if (minutesAgo < 60) return getAgoString(minutesAgo, 'minute')

	const hoursAgo = minutesAgo / 60
	if (hoursAgo < 24) return getAgoString(hoursAgo, 'hour')

	const daysAgo = hoursAgo / 24
	if (daysAgo < 7) return getAgoString(daysAgo, 'day')
	if (daysAgo < 30.5) return getAgoString(daysAgo / 7, 'week')
	if (daysAgo < 365.25) return getAgoString(daysAgo / 30.5, 'month')

	const yearsAgo = daysAgo / 365.25
	return getAgoString(yearsAgo, 'year')
}

const getAgoString = (amount: number, singular: string) => {
	const fixedAmount = amount.toFixed()
	return `${fixedAmount} ${singular}${fixedAmount === '1' ? '' : 's'} ago`
}

export const formatVideoTime = (seconds: number) => {
	const floored = Math.floor(seconds)
	const s = floored % 60
	const m = Math.floor(floored / 60)
  const h = Math.floor(floored / 3600)

	return `${h > 0 ? `${h.toString().padStart(2, '0')}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}
