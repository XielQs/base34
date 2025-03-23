type TType = 'general' | 'artist' | 'character' | 'copyright' | 'metadata' | 'tag'
type TRating = 'explicit' | 'questionable' | 'safe'
type TModifier = '+' | '-' | '~'
type TSource = 'rule34' | 'danbooru' | 'gelbooru'
type TPostType = 'image' | 'video' | 'gif'

interface ITag {
  label: string
  count: number
  type: TType
  source: TSource
}

interface ITagWithModifier extends ITag {
  modifier: TModifier
}

interface IRawTag {
  tag: string
  count: number
  type: TType
}

interface IPost {
  id: number
  file_url: string
  preview_url: string
  width: number
  height: number
  rating: TRating
  score: number
  tags: string
  source: string
  comment_count: number
  tag_info: IRawTag[]
  originalSource: TSource
  date: number
  type: TPostType
}
