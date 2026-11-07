const API_BASE = 'https://www.googleapis.com/youtube/v3'
const MAX_PAGE_SIZE = 50

// YouTube allows Shorts up to this length. Only used when the Shorts playlist is missing.
const MAX_SHORT_SECONDS = 180

// Keep in step with `revalidate` in app/videos/page.tsx.
const CACHE_SECONDS = 21600

export interface YouTubeChannel {
  id: string
  name: string
  url: string
}

export const YOUTUBE_CHANNELS = {
  ai: {
    id: 'UCnLjEpTIrRBcnPbL_7JbtuA',
    name: 'Tarek Alaaddin',
    url: 'https://www.youtube.com/@TarekAlaaddin',
  },
  selfDevelopment: {
    id: 'UCcTn9gGucOoiFnAl0-pepbw',
    name: 'Tarek Alaaddin Unfiltered',
    url: 'https://www.youtube.com/@TarekAlaaddinUnfiltered',
  },
} satisfies Record<string, YouTubeChannel>

/** Videos pinned at the top of the page. An ID that no longer exists is skipped. */
export const FEATURED_VIDEO_IDS = ['4PHCyBRFB5U', 'D6wZ7Lms474', 'oEJ9VVgTmg0']

export interface Video {
  id: string
  title: string
  description: string
  publishedAt: string
  /** ISO 8601, e.g. PT4M30S */
  duration: string
  /** Formatted on the server, so the server and browser render the same text. */
  dateLabel: string
  durationLabel: string
  thumbnail: string
  embeddable: boolean
  isShort: boolean
  url: string
}

export interface ChannelVideos {
  full: Video[]
  shorts: Video[]
}

interface PlaylistItemsResponse {
  nextPageToken?: string
  items: { contentDetails: { videoId: string } }[]
}

interface Thumbnail {
  url: string
}

interface VideosResponse {
  items: {
    id: string
    snippet: {
      title: string
      description: string
      publishedAt: string
      liveBroadcastContent: string
      thumbnails: Record<string, Thumbnail | undefined>
    }
    contentDetails: { duration: string }
    status: { privacyStatus: string; embeddable: boolean }
  }[]
}

/** Returns null on a 404, which is how the API reports a playlist that doesn't exist. */
async function youtubeRequest<T>(path: string, params: Record<string, string>): Promise<T | null> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) throw new Error('YOUTUBE_API_KEY is not set')

  const query = new URLSearchParams({ ...params, key })
  const response = await fetch(`${API_BASE}/${path}?${query}`, {
    next: { revalidate: CACHE_SECONDS },
  })

  if (response.status === 404) return null
  // The URL holds the key, so it stays out of this message.
  if (!response.ok) throw new Error(`YouTube ${path} request failed: ${response.status}`)
  return response.json()
}

async function listPlaylistVideoIds(playlistId: string): Promise<string[] | null> {
  const ids: string[] = []
  let pageToken: string | undefined

  do {
    const page: PlaylistItemsResponse | null = await youtubeRequest('playlistItems', {
      part: 'contentDetails',
      playlistId,
      maxResults: String(MAX_PAGE_SIZE),
      ...(pageToken ? { pageToken } : {}),
    })
    if (!page) return null
    ids.push(...page.items.map((item) => item.contentDetails.videoId))
    pageToken = page.nextPageToken
  } while (pageToken)

  return ids
}

function bestThumbnail(thumbnails: Record<string, Thumbnail | undefined>): string {
  const { maxres, standard, high, medium, default: smallest } = thumbnails
  return (maxres ?? standard ?? high ?? medium ?? smallest)?.url ?? ''
}

function cleanTitle(title: string): string {
  return title.replace(/\s*#shorts\b/gi, '').trim()
}

function parseDuration(iso: string): [number, number, number] | null {
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/)
  if (!match) return null
  return [Number(match[1] ?? 0), Number(match[2] ?? 0), Number(match[3] ?? 0)]
}

function durationSeconds(iso: string): number {
  const parts = parseDuration(iso)
  return parts ? parts[0] * 3600 + parts[1] * 60 + parts[2] : Infinity
}

function durationLabel(iso: string): string {
  const parts = parseDuration(iso)
  if (!parts) return ''
  const [hours, minutes, seconds] = parts
  const paddedSeconds = String(seconds).padStart(2, '0')
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${paddedSeconds}`
    : `${minutes}:${paddedSeconds}`
}

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

async function getChannelVideos(channel: YouTubeChannel): Promise<ChannelVideos> {
  // A channel ID maps to its upload playlists by prefix: UU is every upload, and
  // UUSH is Shorts only. UUSH isn't documented and can return a 404, so length
  // decides what counts as a Short when it's missing.
  const suffix = channel.id.slice(2)
  const [uploads, shortIds] = await Promise.all([
    listPlaylistVideoIds(`UU${suffix}`),
    listPlaylistVideoIds(`UUSH${suffix}`),
  ])

  // Both channels have videos, so an empty result is a failed response. Throwing
  // keeps the last good page instead of replacing it with empty sections.
  if (!uploads?.length) throw new Error(`YouTube returned no uploads for ${channel.name}`)
  const shorts = shortIds && new Set(shortIds)

  const batches: string[][] = []
  for (let i = 0; i < uploads.length; i += MAX_PAGE_SIZE) {
    batches.push(uploads.slice(i, i + MAX_PAGE_SIZE))
  }
  const responses = await Promise.all(
    batches.map((ids) =>
      youtubeRequest<VideosResponse>('videos', {
        part: 'snippet,contentDetails,status',
        id: ids.join(','),
      })
    )
  )

  if (responses.some((response) => !response?.items.length)) {
    throw new Error(`YouTube returned no video details for ${channel.name}`)
  }

  const videos = responses
    .flatMap((response) => response?.items ?? [])
    .filter(
      (item) =>
        item.status.privacyStatus === 'public' && item.snippet.liveBroadcastContent === 'none'
    )
    .map(
      (item): Video => ({
        id: item.id,
        title: cleanTitle(item.snippet.title),
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
        duration: item.contentDetails.duration,
        dateLabel: dateLabel(item.snippet.publishedAt),
        durationLabel: durationLabel(item.contentDetails.duration),
        thumbnail: bestThumbnail(item.snippet.thumbnails),
        embeddable: item.status.embeddable,
        isShort: shorts
          ? shorts.has(item.id)
          : durationSeconds(item.contentDetails.duration) <= MAX_SHORT_SECONDS,
        url: `https://www.youtube.com/watch?v=${item.id}`,
      })
    )

  return {
    full: videos.filter((video) => !video.isShort),
    shorts: videos.filter((video) => video.isShort),
  }
}

export async function getAllChannelVideos() {
  const [ai, selfDevelopment] = await Promise.all([
    getChannelVideos(YOUTUBE_CHANNELS.ai),
    getChannelVideos(YOUTUBE_CHANNELS.selfDevelopment),
  ])
  return { ai, selfDevelopment }
}
