'use client'
import { VscDebugDisconnect, VscError, VscPerson } from 'react-icons/vsc'
import { formatCreatedAt, parseTags, useProxy } from '@/utils/helpers'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BiHeart, BiLink, BiLinkExternal } from 'react-icons/bi'
import { LuFolders, LuInfo, LuPencil } from 'react-icons/lu'
import usePreferencesStore from './stores/preferencesStore'
import { IoPricetagOutline } from 'react-icons/io5'
import useResultsStore from './stores/resultsStore'
import { FiMinus } from 'react-icons/fi'
import { GoPlus } from 'react-icons/go'
import Image from '@/components/Image'
import Video from '@/components/Video'
import Link from 'next/link'
import axios from 'axios'
import '../../node_modules/fluid-player/src/css/fluidplayer.css'

const formatter = Intl.NumberFormat('en', { notation: 'compact' })

export default function Home() {
  const resultsStore = useResultsStore(state => state)
  const { blockedContent, hasHydrated, sawWarning, setSawWarning } = usePreferencesStore(state => state)

  const [modifier, setModifier] = useState<TModifier>('+')
  const [search, setSearch] = useState<string>('')
  const [isSelectorOpen, setIsSelectorOpen] = useState<boolean>(false)
  const [focusInside, setFocusInside] = useState<boolean>(false)
  const [tags, setTags] = useState<ITagWithModifier[]>(resultsStore.tags)
  const [suggestions, setSuggestions] = useState<ITag[] | null>([])
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [sendTimeout, setSendTimeout] = useState<number | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<number>(0)
  const [posts, setPosts] = useState<IPost[] | false | null>(resultsStore.posts)
  const [totalPosts, setTotalPosts] = useState<number>(resultsStore.totalPosts)
  const [error, setError] = useState<Error | null>(null)
  const [pid, setPid] = useState(0)
  const [isEnd, setIsEnd] = useState(false)
  const [isLoadingMore, setLoadingMore] = useState(false)

  const tagSelectorRef = useRef<HTMLOListElement>(null)
  const tagInputRef = useRef<HTMLInputElement>(null)
  const loadMoreBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (search.trim().length === 0) return
    setSuggestions(null)
    setSelectedSuggestion(0)
    const fetchTags = async () => {
      if (abortController) {
        abortController.abort()
      }
      const controller = new AbortController()
      setAbortController(controller)
      try {
        const { data } = await axios.post<ITag[] | { error: string }>('/api/autocomplete', { query: search.trim() }, { signal: controller.signal })
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
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setIsSelectorOpen(search.length > 0 && focusInside)
  }, [search, focusInside])

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
    if (posts === null || posts === false || isLoadingMore || isEnd) return
    try {
      setPid(pid => pid + 1)
      setLoadingMore(true)
      const { data } = await axios.post<{ data: IPost[], total: number }>('/api/search', { query: parseTags(tags, blockedContent), pid: pid + 1 })
      const postsIDs = posts.map(post => post.id)
      const newPosts = data.data.filter(post => !postsIDs.includes(post.id))
      if (newPosts.length === 0) {
        setIsEnd(true)
        return
      }
      setPosts(posts => [...(posts as IPost[]), ...newPosts])
      setTotalPosts(data.total)
    } catch (e) {
      console.error('Error fetching posts:', e)
      setPosts(false)
      setTotalPosts(0)
      setError(e as Error)
    }
    setLoadingMore(false)
  }, [posts, tags, pid, isLoadingMore, isEnd, blockedContent])

  useEffect(() => {
    const loadMoreBtn = loadMoreBtnRef.current
    if (!loadMoreBtn) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        loadMore()
      }
    }, { threshold: 1, rootMargin: '5000px' })
    observer.observe(loadMoreBtn)
    return () => {
      if (loadMoreBtn) {
        observer.unobserve(loadMoreBtn)
      }
    }
  }, [loadMoreBtnRef, loadMore])

  useEffect(() => {
    if (hasHydrated) {
      resultsStore.setTags(tags)
      resultsStore.setPosts(posts || null)
      resultsStore.setTotalPosts(totalPosts)
    }
  }, [hasHydrated, tags, posts, totalPosts]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFocus = () => {
    setFocusInside(true)
  }

  const handleSearch = useCallback(async () => {
    setPosts(null)
    setTotalPosts(0)
    setError(null)
    setPid(0)
    setIsEnd(false)
    setLoadingMore(false)
    try {
      const { data } = await axios.post<{ data: IPost[], total: number }>('/api/search', { query: parseTags(tags, blockedContent) })
      setPosts(data.data)
      setTotalPosts(data.total)
    } catch (e) {
      console.error('Error fetching posts:', e)
      setPosts(false)
      setTotalPosts(0)
      setError(e as Error)
    }
  }, [tags, blockedContent])

  useEffect(() => {
    if (!hasHydrated) return
    if (!posts || posts.length < 1) handleSearch()
  }, [hasHydrated]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && search.length > 0) {
      const selectedTag = suggestions?.[selectedSuggestion]
      if (selectedTag) {
        addTag(selectedTag, true)
      } else {
        addTag({ label: search, count: 0, type: 'general', source: 'rule34' }, true)
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

  const addTag = (tag: ITag, clear = false, forceAdd = false) => {
    if (clear) setSearch('')
    if (tags.some(t => t.label === tag.label)) {
      console.log('Tag already exists:', tag)
      return
    }
    console.log('Adding tag:', tag)
    setTags(tags => [...tags, { ...tag, modifier: forceAdd ? '+' : modifier }])
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
      addTag(tag, false, true)
    }
  }

  if (!hasHydrated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-16 h-16 border-4 border-t-transparent border-secondary rounded-full animate-spin"></div>
      </div>
    )
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
            value={search}
            onChange={e => setSearch(e.target.value)}
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
          {!isEnd ? (
            <button type="button" ref={loadMoreBtnRef} onClick={loadMore} className="w-40 h-9 font-light font-[Arial] text-sm bg-secondary hover:bg-secondary/75 transition-colors duration-300 uppercase text-white rounded-md cursor-pointer flex items-center justify-center disabled:bg-secondary/75 disabled:cursor-auto" disabled={posts === null || isLoadingMore}>
              Load more
              {isLoadingMore && (
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin ml-2"></div>
              )}
            </button>
          ) : (
            <div className="flex flex-col items-center m-auto my-12 rounded bg-primary-light p-4 w-full max-w-[400px]">
              <div className="flex items-center m-auto gap-6">
                <div className="grid place-items-center min-w-16 min-h-16 rounded border-2 border-primary-tone shrink">
                  <VscDebugDisconnect size={32} className="text-secondary" />
                </div>
                <div>
                  <h3 className="pb-1">No more results</h3>
                  <span className="text-sm">
                    No more posts found for the given tags.
                    Please try different tags or combinations.
                  </span>
                </div>
              </div>
              <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="mt-2 w-full h-9 font-light font-[Arial] text-sm hover:bg-primary-tone transition-colors duration-300 uppercase rounded-md cursor-pointer flex items-center justify-center">
                Back To Top
              </button>
            </div>
          )}
        </section>
      )}
      {!sawWarning && (
        // make a modal
        <div className="fixed top-0 left-0 w-full h-full backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-primary shadow-[0_0_100px_100px_#000] border-2 border-secondary border-solid p-4 gap-4 rounded-lg max-w-[500px] text-center">
            <Image src="/astolfo.png" alt="Warning Icon" width={200} height={200} className="h-[200px] mx-auto mb-4" />
            <h1 className="text-7xl text-center font-gothic text-secondary">base34</h1>
            <h2 className="text-xl my-4">Terms of Use</h2>
            <hr className="border-t-2 border-primary-light my-4" />
            <h3 className="text-lg font-semibold mb-2">Mature Content</h3>
            <p className="text-sm mb-4">
              This site contains explicit content that is not suitable for all audiences. By using this site, you acknowledge that you are at least 18 years old and agree to view such content.
            </p>
            <div className="flex justify-center gap-4">
              <button type="button" onClick={() => setSawWarning(true)} className="w-32 h-9 font-light text-sm bg-secondary hover:bg-secondary/75 transition-colors duration-300 uppercase text-white rounded-md cursor-pointer">
                Accept
              </button>
              <button type="button" onClick={() => window.location.href = 'https://www.google.com'} className="w-32 h-9 font-light text-sm bg-primary-tone hover:bg-primary-tone/75 transition-colors duration-300 uppercase text-white rounded-md cursor-pointer">
                Leave
              </button>
            </div>
          </div>
        </div>
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

  const fileURL = useProxy(post.file_url)
  const previewURL = useProxy(post.preview_url)

  return (
    <li className="flex flex-col">
      {post.type === 'video' ? (
        <Video src={fileURL} width={post.width} height={post.height} poster={previewURL} loop={post.tag_info.some(tag => tag.tag === 'loop')} />
      ) : (
        <Image src={fileURL} previewURL={previewURL} alt={post.tags} width={post.width} height={post.height} className="rounded-t-xl w-full h-auto" unoptimized={true} />
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
