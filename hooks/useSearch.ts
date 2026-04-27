'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Document } from 'flexsearch'

interface SearchDocument {
  [key: string]: string
  slug: string
  title: string
  description: string
  tags: string
  category: string
  body: string
}

export function useSearch() {
  const [query, setQuery] = useState('')
  const [matchingSlugs, setMatchingSlugs] = useState<Set<string> | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const indexRef = useRef<Document<SearchDocument> | null>(null)
  const docsRef = useRef<SearchDocument[]>([])
  const loadedRef = useRef(false)
  const pendingQueryRef = useRef<string | null>(null)

  const buildIndex = useCallback((docs: SearchDocument[]) => {
    const idx = new Document<SearchDocument>({
      document: {
        id: 'slug',
        index: [
          { field: 'title', tokenize: 'forward', resolution: 9 },
          { field: 'tags', tokenize: 'forward', resolution: 7 },
          { field: 'description', tokenize: 'forward', resolution: 5 },
          { field: 'body', tokenize: 'forward', resolution: 3 },
        ],
      },
    })

    for (const doc of docs) {
      idx.add(doc)
    }

    return idx
  }, [])

  const executeSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setMatchingSlugs(null)
      return
    }

    const idx = indexRef.current
    if (!idx) return

    const tokens = q
      .toLowerCase()
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
    const results = idx.search(q)
    const candidateSlugs = new Set<string>()

    for (const fieldResult of results) {
      for (const id of fieldResult.result) {
        candidateSlugs.add(String(id))
      }
    }

    const candidates = candidateSlugs.size
      ? docsRef.current.filter((doc) => candidateSlugs.has(doc.slug))
      : docsRef.current
    const slugs = new Set(
      candidates
        .filter((doc) => {
          const searchableText = [
            doc.title,
            doc.description,
            doc.tags,
            doc.category,
            doc.body,
          ]
            .join(' ')
            .toLowerCase()

          return tokens.every((token) => searchableText.includes(token))
        })
        .map((doc) => doc.slug)
    )

    setMatchingSlugs(slugs)
  }, [])

  const loadIndex = useCallback(async () => {
    if (loadedRef.current) return
    loadedRef.current = true
    setIsLoading(true)

    try {
      const res = await fetch('/search-index.json')
      if (!res.ok) throw new Error(`Failed to fetch search index: ${res.status}`)
      const docs: SearchDocument[] = await res.json()
      docsRef.current = docs
      indexRef.current = buildIndex(docs)

      // Execute any pending search
      if (pendingQueryRef.current) {
        executeSearch(pendingQueryRef.current)
        pendingQueryRef.current = null
      }
    } catch (err) {
      console.error('Failed to load search index:', err)
      loadedRef.current = false
    } finally {
      setIsLoading(false)
    }
  }, [buildIndex, executeSearch])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setMatchingSlugs(null)
      return
    }

    if (!indexRef.current) {
      pendingQueryRef.current = query
      setMatchingSlugs(new Set())
      void loadIndex()
      return
    }

    setMatchingSlugs(new Set())
    const timer = setTimeout(() => {
      executeSearch(query)
    }, 200)

    return () => clearTimeout(timer)
  }, [query, executeSearch, loadIndex])

  return { query, setQuery, matchingSlugs, isLoading, loadIndex }
}
