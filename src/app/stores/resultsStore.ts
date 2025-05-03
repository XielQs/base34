import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ResultsState {
  tags: ITagWithModifier[]
  posts: IPost[] | null
  totalPosts: number
}

interface ResultsActions {
  setTags: (tags: ITagWithModifier[]) => void
  setPosts: (posts: IPost[] | null) => void
  setTotalPosts: (totalPosts: number) => void
}

const useResultsStore = create(
  persist<ResultsState & ResultsActions>(
    set => ({
      tags: [],
      posts: null,
      totalPosts: 0,
      setTags: tags => set(() => ({ tags })),
      setPosts: posts => set(() => ({ posts })),
      setTotalPosts: totalPosts => set(() => ({ totalPosts }))
    }),
    {
      name: 'results-storage'
    }
  )
)

export default useResultsStore
