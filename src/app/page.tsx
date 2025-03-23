'use client'
import { VscDebugDisconnect, VscError, VscPerson } from 'react-icons/vsc'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BiHeart, BiLink, BiLinkExternal } from 'react-icons/bi'
import { LuFolders, LuInfo, LuPencil } from 'react-icons/lu'
import { IoPricetagOutline } from 'react-icons/io5'
import { formatCreatedAt } from '@/utils/helpers'
import { FiMinus } from 'react-icons/fi'
import { GoPlus } from 'react-icons/go'
import Video from '@/components/Video'
import Image from '@/components/Image'
import Link from 'next/link'
import axios from 'axios'

const formatter = Intl.NumberFormat('en', { notation: 'compact' })

export default function Home() {
  const [modifier, setModifier] = useState<TModifier>('+')
  const [tag, setTag] = useState<string>('')
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false)
  const [focusInside, setFocusInside] = useState<boolean>(false)
  const [tags, setTags] = useState<ITagWithModifier[]>([])
  const [suggestions, setSuggestions] = useState<ITag[] | null>([])
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [sendTimeout, setSendTimeout] = useState<number | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(0)
  const [posts, setPosts] = useState<IPost[] | false | null>(null)
  const [totalPosts, setTotalPosts] = useState<number>(0)
  const [error, setError] = useState<Error | null>(null)
  const [pid, setPid] = useState(0)
  const [isLoadingMore, setLoadingMore] = useState(false)

  const tagSelectorRef = useRef<HTMLOListElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const loadMoreBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (tag.trim().length === 0) return
    setSuggestions(null)
    setSelectedSuggestion(0)
    const fetchTags = async () => {
      if (abortController) {
        abortController.abort()
      }
      const controller = new AbortController()
      setAbortController(controller)
      try {
        const { data } = await axios.post<ITag[] | { error: string }>('/api/autocomplete', { query: tag.trim() }, { signal: controller.signal })
        if ('error' in data) return alert(data.error)
        setSuggestions(data)
      } catch (e) {
        if (!axios.isAxiosError(e) || e.code !== 'ERR_CANCELED') {
          console.error('Error fetching tags:', e)
        }
      }
      setAbortController(null)
    }
    if (sendTimeout) {
      clearTimeout(sendTimeout)
    }
    const timeout = setTimeout(() => {
      fetchTags()
    }, 300) as unknown as number
    setSendTimeout(timeout)
    return () => {
      if (sendTimeout) {
        clearTimeout(sendTimeout)
      }
      if (abortController) {
        abortController.abort()
      }
    }
  }, [tag]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsSelectorOpen(tag.length > 0 && focusInside)
  }, [tag, focusInside])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tagInputRef.current && !tagInputRef.current.contains(event.target as Node)) {
        setIsSelectorOpen(false)
        setFocusInside(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const loadMore = useCallback(async () => {
    if (posts === null || posts === false || isLoadingMore) return
    try {
      setPid(pid => pid + 1)
      setLoadingMore(true)
      const { data } = await axios.post<{ data: IPost[], total: number }>('/api/search', { query: tags.map(tag => tag.modifier + tag.label), pid: pid + 1 })
      const postsIDs = posts.map(post => post.id)
      const newPosts = data.data.filter(post => !postsIDs.includes(post.id))
      setPosts(posts => [...(posts as IPost[]), ...newPosts])
      setTotalPosts(data.total)
    } catch (e) {
      console.error('Error fetching posts:', e)
      setPosts(false)
      setTotalPosts(0)
      setError(e as Error)
    }
    setLoadingMore(false)
    }, [posts, tags, pid, isLoadingMore])

  useEffect(() => {
    const loadMoreBtn = loadMoreBtnRef.current
    if (!loadMoreBtn) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    }, { threshold: 1 })
    observer.observe(loadMoreBtn)
    return () => {
      if (loadMoreBtn) {
        observer.unobserve(loadMoreBtn)
      }
    }
  }, [loadMoreBtnRef, loadMore])

  const handleFocus = () => {
    setFocusInside(true)
  }

  const handleSearch = useCallback(async () => {
    setPosts(null)
    setTotalPosts(0)
    setError(null)
    setPid(0)
    try {
      const { data } = await axios.post<{ data: IPost[], total: number }>('/api/search', { query: tags.map(tag => tag.modifier + tag.label) })
      setPosts(data.data)
      setTotalPosts(data.total)
    } catch (e) {
      console.error('Error fetching posts:', e)
      setPosts(false)
      setTotalPosts(0)
      setError(e as Error)
    }
  }, [tags])

  useEffect(() => {
    handleSearch()
  }, [handleSearch])

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && tag.length > 0) {
      const selectedTag = suggestions?.[selectedSuggestion]
      if (selectedTag) {
        addTag(selectedTag, true)
      } else {
        addTag({ label: tag, count: 0, type: 'general', source: 'rule34' }, true)
      }
    } else if (event.key === 'Enter' && event.ctrlKey && tags.length > 0) {
      handleSearch()
    } else if (event.key === 'Escape') {
      setFocusInside(false)
    } else if (event.key === 'ArrowDown' || (event.key === 'Tab' && !event.shiftKey)) {
      event.preventDefault()
      if (suggestions) {
        setSelectedSuggestion((prev) => (prev + 1) % suggestions.length)
      }
    } else if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
      event.preventDefault()
      if (suggestions) {
        setSelectedSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length)
      }
    }
  }

  const addTag = (tag: ITag, clear = false) => {
    if (clear) setTag('')
    if (tags.some(t => t.label === tag.label)) {
      console.log('Tag already exists:', tag)
      return
    }
    console.log('Adding tag:', tag)
    setTags(tags => [...tags, { ...tag, modifier }])
  }

  const removeTag = (tag: ITag) => {
    console.log('Removing tag:', tag)
    setTags(tags => tags.filter(t => t.label !== tag.label))
  }

  const handleTagClick = (tag: ITag) => {
    const existingTag = tags.find(t => t.label === tag.label)
    if (existingTag) {
      removeTag(existingTag)
    } else {
      addTag(tag)
    }
  }

  return (
    <>
      <div className="flex items-center justify-center h-[250px]">
        <Image src="/astolfo.png" alt="logo" width={200} height={200} priority style={{ height: '250px' }} />
      </div>
      <section className="flex flex-col items-center justify-center gap-4 min-h-[250px]">
        <h1 className="text-7xl text-center font-gothic text-secondary">
          base34
        </h1>
        <div className={`flex items-center justify-center max-w-[512px] relative w-full h-11 px-1.5 gap-2 bg-primary-light mx-auto rounded-3xl ${isSelectorOpen ? 'rounded-b-none drop-shadow-[0px_3px_5px_#000]' : ''}`}>
          <button type="button" title="Change mode" className="min-w-8 min-h-8 inline-flex items-center justify-center text-2xl rounded-full hover:text-white hover:bg-primary-tone transition-colors duration-300 cursor-pointer" onClick={() => setModifier(modifier === '+' ? '-' : modifier === '-' ? '~' : '+')}>
            {
              modifier === '+' ? (
                <GoPlus />
              ) : modifier === '-' ? (
                <FiMinus />
              ) : (
                <span className="text-base">(⁓)</span>
              )
            }
          </button>
          <input
            type="text"
            ref={tagInputRef}
            value={tag}
            onChange={e => setTag(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            className="w-full h-full font-light text-sm bg-transparent placeholder:text-[#7a7a7a] leading-0.5 rounded-md"
            placeholder="Search for tags"
          />
          {isSelectorOpen && (
            <ol className="absolute left-0 top-11 w-full text-sm z-50 bg-primary-light rounded-b-3xl min-h-6 overflow-hidden" ref={tagSelectorRef}>
              {suggestions && suggestions.map(tag => (
                <li key={tag.label} title={tag.label} onClick={() => addTag(tag, true)} className={`flex items-center text-sm min-h-6 px-1.5 hover:bg-primary-tone transition-colors duration-200 cursor-pointer ${selectedSuggestion === suggestions.indexOf(tag) ? 'bg-primary-tone' : ''}`}>
                  <Icon type={tag.type} className="min-w-8 h-4" fallback={IoPricetagOutline} />
                  <span className="w-full">{tag.label}</span>
                  <span>{formatter.format(tag.count)}</span>
                </li>
              ))}
              {suggestions === null && (
                <li className="flex items-center text-sm min-h-6 px-1.5 justify-center">
                  <div className="w-4 h-4 border-2 border-t-transparent border-secondary rounded-full animate-spin"></div>
                </li>
              )}
              {suggestions?.length === 0 && (
                <li className="flex items-center text-sm min-h-6 px-1.5 justify-center">
                  <span className="text-[#7a7a7a]">No results found</span>
                </li>
              )}
              <li className="p-2"></li>
            </ol>
          )}
        </div>
        <button type="button" onClick={handleSearch} className="w-40 h-9 font-light text-sm bg-secondary hover:bg-secondary/75 transition-colors duration-300 uppercase text-white rounded-md cursor-pointer flex items-center justify-center disabled:bg-secondary/75 disabled:cursor-auto" disabled={posts === null}>
          {posts === null ? (
            <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
          ) : 'Search'}
        </button>
        <div className="flex flex-wrap justify-center items-center min-h-6 gap-2">
          {tags.map(tag =>  (
            <button key={tag.label} type="button" onClick={() => removeTag(tag)} className={`inline-flex items-center justify-center min-h-6 px-3 select-none gap-1 text-xs text-white rounded-md bg-secondary hover:bg-secondary/75 transition-colors duration-300 cursor-pointer ${tag.modifier === '-' ? 'line-through' : tag.modifier === '~' ? 'italic' : ''}`}>
              <Icon type={tag.type} className="w-4 h-4" />
              <span className="w-full">{tag.label}{tag.count > 0 ? ` (${formatter.format(tag.count)})` : ''}</span>
            </button>
          ))}
        </div>
      </section>
      <div className="flex items-center justify-between text-sm">
        <span className={posts === null ? 'rounded text-transparent animate-[pulse_3s_ease-in-out_infinite] bg-primary-tone' : ''}>
          {formatter.format(totalPosts)} posts
        </span>
        <span></span>
      </div>
      {posts === null ? (
        <div className="h-screen w-full rounded-xl animate-[pulse_3s_ease-in-out_infinite] bg-primary-tone"></div>
      ) : posts === false ? (
        <div className="flex items-center m-auto my-12 gap-6 rounded bg-primary-light p-4 w-full max-w-[400px]">
          <div className="grid place-items-center min-w-16 min-h-16 rounded border-2 border-primary-tone shrink">
            <VscDebugDisconnect size={32} className="text-secondary" />
          </div>
          <div>
            <h3 className="pb-1">Connection Error</h3>
            <span className="text-sm">
              Could not connect to the server.
              Please check your internet connection or try again later.
            </span>
            {error && (
              <div className="text-sm text-red-500">
                <p>{error.message}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <section className="flex flex-col items-center gap-3.5">
          {posts && posts.length === 0 ? (
            <div className="flex items-center m-auto my-12 gap-6 rounded bg-primary-light p-4 w-full max-w-[400px]">
              <div className="grid place-items-center min-w-16 min-h-16 rounded border-2 border-primary-tone shrink">
                <VscError size={32} className="text-secondary" />
              </div>
              <div>
                <h3 className="pb-1">No results found</h3>
                <span className="text-sm">
                  No posts found for the given tags.
                  Please try different tags or combinations.
                </span>
              </div>
            </div>
          ) : (
            <ol className="w-full flex flex-col gap-3.5">
              {posts.map(post => (
                <Post key={post.file_url} post={post} onTagClicked={handleTagClick} tags={tags} />
              ))}
            </ol>
          )}
          <div></div>
          <button type="button" ref={loadMoreBtnRef} onClick={loadMore} className="w-40 h-9 font-light font-[Arial] text-sm bg-secondary hover:bg-secondary/75 transition-colors duration-300 uppercase text-white rounded-md cursor-pointer flex items-center justify-center disabled:bg-secondary/75 disabled:cursor-auto" disabled={posts === null || isLoadingMore}>
            Load more
            {isLoadingMore && (
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin ml-2"></div>
            )}
          </button>
        </section>
      )}
    </>
  )
}

function Icon({ type, className, fallback }: { type: TType, className?: string, fallback?: React.ComponentType<{ className?: string }> }) {
  const FallbackComponent = fallback
  switch (type) {
    case 'artist':
      return <LuPencil className={className} />
    case 'character':
      return <VscPerson className={className} />
    case 'copyright':
      return <LuFolders className={className} />
    case 'metadata':
      return <LuInfo className={className} />
    default:
      return FallbackComponent ? <FallbackComponent className={className} /> : null
  }
}

const REFERENCE_MAPPINGS = {
  'rule34.xxx': 'bg-rule34 hover:bg-rule34/75 !text-black',
  'twitter.com': 'bg-twitter hover:bg-twitter/75',
  'reddit.com': 'bg-reddit hover:bg-reddit/75',
  'pixiv.net': 'bg-pixiv hover:bg-pixiv/75',
  'patreon.com': 'bg-patreon hover:bg-patreon/75',
  'x.com': 'bg-twitter hover:bg-twitter/75',
  'deviantart.com': 'bg-deviantart hover:bg-deviantart/75',
  'newgrounds.com': 'bg-newgrounds hover:bg-newgrounds/75',
  'e621.net': 'bg-e621 hover:bg-e621/75',
  'e926.net': 'bg-e621 hover:bg-e621/75',
  'gelbooru.com': 'bg-gelbooru hover:bg-gelbooru/75',
  'gelbooru.booru.org': 'bg-gelbooru hover:bg-gelbooru/75',
  'pornhub.com': 'bg-pornhub hover:bg-pornhub/75',
  'hentaihaven.org': 'bg-hentaihaven hover:bg-hentaihaven/75',
}

function Post({ post, onTagClicked, tags }: { post: IPost, onTagClicked: (tag: ITag) => void, tags: ITag[] }) {
  const [tab, setTab] = useState<'reference' | 'tags' | null>(null)

  const parseTagTypeColor = (tag: TType) => {
    switch (tag) {
      case 'artist':
        return 'bg-artist-background hover:bg-artist-background-hover'
      case 'character':
        return 'bg-character-background hover:bg-character-background-hover'
      case 'copyright':
        return 'bg-copyright-background hover:bg-copyright-background-hover'
      case 'metadata':
        return 'bg-metadata-background hover:bg-metadata-background-hover'
      default:
        return 'bg-primary-tone hover:bg-primary-tone/75'
    }
  }

  const references: Array<{ label: string, url: string, className?: string }> = []

  references.push({
    label: 'rule34.xxx',
    url: `https://rule34.xxx/index.php?page=post&s=view&id=${post.id}`,
    className: REFERENCE_MAPPINGS['rule34.xxx'],
  })

  references.push({
    label: 'File',
    url: post.file_url,
  })

  if (post.source.trim() !== '') {
    for (const source of post.source.split(' ')) {
      try { new URL(source) } catch { continue }
      const hostname = new URL(source).hostname.replace('www.', '')
      references.push({
        label: hostname,
        url: source,
        className: REFERENCE_MAPPINGS[hostname as keyof typeof REFERENCE_MAPPINGS] ?? '',
      })
    }
  }

  return (
    <li>
      {post.type === 'video' ? (
        <Video src={post.file_url} width={post.width} height={post.height} poster={post.preview_url} loop={false} />
      ) : (
        <Image src={post.file_url} previewURL={post.preview_url} alt={post.tags} width={post.width} height={post.height} className="rounded-t-xl w-full h-auto" unoptimized={post.type === 'gif'} />
      )}
      <div className="rounded-b-xl text-sm bg-primary-light p-2 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span>{formatCreatedAt(post.date)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <BiHeart size={16} />
            <span>{post.score}</span>
          </span>
          <div className="grow"></div>
          <button type="button" onClick={() => setTab(tab === 'reference' ? null : 'reference')} className={`h-8 inline-flex items-center justify-center bg-primary-tone hover:bg-primary-tone/80 cursor-pointer text-white rounded-[5px] transition-colors duration-200 gap-1 p-2 ${tab === 'reference' ? 'bg-primary-tone/50' : ''}`}>
            <BiLink size={16} />
            <span>{references.length}</span>
          </button>
          <button type="button" onClick={() => setTab(tab === 'tags' ? null : 'tags')} className={`h-8 inline-flex items-center justify-center bg-primary-tone hover:bg-primary-tone/80 cursor-pointer text-white rounded-[5px] transition-colors duration-200 gap-1 p-2 ${tab === 'tags' ? 'bg-primary-tone/50' : ''}`}>
            <IoPricetagOutline size={16} />
            <span>{post.tag_info.length}</span>
          </button>
        </div>
        {tab !== null && (
          <div className="flex flex-wrap items-center gap-2">
            {tab === 'reference' ? (
              references.map(reference => (
                <Link key={reference.label} href={reference.url} target="_blank" rel="noopener">
                  <button type="button" className={`h-8 inline-flex items-center justify-center cursor-pointer text-white rounded-[5px] transition-colors duration-200 gap-1 p-2 ${reference.className || 'bg-primary-tone hover:bg-primary-tone/75'}`}>
                    <BiLinkExternal size={16} />
                    {reference.label}
                  </button>
                </Link>
              ))
            ) : (
              post.tag_info.map(tag => (
                <button type="button" key={tag.tag} title={tag.tag} onClick={() => onTagClicked({ count: tag.count, label: tag.tag, source: post.originalSource, type: tag.type })} className={`h-6 inline-flex text-xs items-center justify-center cursor-pointer rounded-[5px] transition-colors duration-200 gap-1 px-2 ${tags.some(t => t.label === tag.tag) ? 'bg-secondary hover:bg-secondary/75 text-white' : parseTagTypeColor(tag.type)}`}>
                  <Icon type={tag.type} className="w-4 h-4" />
                  <span>{tag.tag}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    </li>
  )
}