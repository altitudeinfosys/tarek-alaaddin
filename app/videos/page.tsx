import { Metadata } from 'next'
import EndOfPostNewsletterCard from '@/components/EndOfPostNewsletterCard'
import JsonLd from '@/components/JsonLd'
import VideoCard from '@/components/videos/VideoCard'
import { absoluteUrl } from '@/lib/site'
import {
  FEATURED_VIDEO_IDS,
  YOUTUBE_CHANNELS,
  getAllChannelVideos,
  type Video,
} from '@/lib/youtube'

const title = 'Videos | Tarek Alaaddin'
const description =
  'Videos on AI tools and workflows, plus short talks on habits, money, and mindset.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: absoluteUrl('/videos'),
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl('/videos'),
    siteName: 'Tarek Alaaddin',
    locale: 'en_US',
    type: 'website',
  },
}

// Refresh the list every 6 hours. Keep in step with CACHE_SECONDS in lib/youtube.ts.
export const revalidate = 21600

async function loadVideos() {
  try {
    return await getAllChannelVideos()
  } catch (error) {
    // At runtime the error must propagate: Next.js then keeps serving the last good
    // page. There's no earlier page during a build, and a YouTube outage shouldn't
    // block a deploy, so the page falls back to links to the channels.
    if (process.env.NEXT_PHASE !== 'phase-production-build') throw error
    console.error('[videos] Could not load videos during build:', error)
    return null
  }
}

function videoSchema(video: Video) {
  return {
    '@type': 'VideoObject',
    name: video.title,
    description: video.description.slice(0, 300) || video.title,
    thumbnailUrl: video.thumbnail,
    uploadDate: video.publishedAt,
    duration: video.duration,
    url: video.url,
    ...(video.embeddable ? { embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}` } : {}),
  }
}

function VideoGrid({ videos, channel }: { videos: Video[]; channel: string }) {
  return (
    <div className="grid gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} channel={channel} />
      ))}
    </div>
  )
}

function ShortsRow({ videos, channel }: { videos: Video[]; channel: string }) {
  return (
    <ul className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
      {videos.map((video) => (
        <li key={video.id} className="w-40 shrink-0 snap-start sm:w-44">
          <VideoCard video={video} channel={channel} />
        </li>
      ))}
    </ul>
  )
}

interface ChannelHeadingProps {
  id: string
  eyebrow: string
  heading: string
  body: string
  url: string
}

function ChannelHeading({ id, eyebrow, heading, body, url }: ChannelHeadingProps) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        <div className="eyebrow eyebrow-accent mb-3">{eyebrow}</div>
        <h2 id={id} className="h-section">
          {heading}
        </h2>
        <p className="mt-3 text-gray-700 dark:text-gray-300">{body}</p>
      </div>
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn-flat btn-flat-ghost">
        Open on YouTube
      </a>
    </div>
  )
}

export default async function VideosPage() {
  const videos = await loadVideos()

  const allAiFull = videos?.ai.full ?? []
  const featured = FEATURED_VIDEO_IDS.flatMap(
    (id) => allAiFull.find((video) => video.id === id) ?? []
  )
  const aiFull = allAiFull.filter((video) => !FEATURED_VIDEO_IDS.includes(video.id))
  const aiShorts = videos?.ai.shorts ?? []
  const selfDevelopmentFull = videos?.selfDevelopment.full ?? []
  const selfDevelopmentShorts = videos?.selfDevelopment.shorts ?? []

  const everyVideo = [
    ...allAiFull,
    ...aiShorts,
    ...selfDevelopmentFull,
    ...selfDevelopmentShorts,
  ]

  return (
    <div className="bg-white dark:bg-gray-900">
      {everyVideo.length > 0 && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: everyVideo.map((video, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: videoSchema(video),
            })),
          }}
        />
      )}

      <section className="pt-14 md:pt-[4.5rem] pb-12 px-4 sm:px-6 lg:px-8 max-w-[76rem] mx-auto">
        <div className="eyebrow eyebrow-accent mb-3">Videos</div>
        <h1 className="font-display font-bold tracking-[-0.035em] leading-[1.02] text-[2.5rem] sm:text-6xl text-gray-900 dark:text-white mb-4">
          Watch and learn
        </h1>
        <p className="text-[1.15rem] text-gray-700 dark:text-gray-300 max-w-3xl mb-8">
          Two channels: hands-on AI tools and workflows, plus short talks on habits, money, and
          mindset.
        </p>
        <div className="flex flex-wrap gap-2">
          <a href="#ai" className="btn-flat btn-flat-ghost">
            AI
          </a>
          <a href="#self-development" className="btn-flat btn-flat-ghost">
            Self-development
          </a>
        </div>
      </section>

      <section id="ai" aria-labelledby="ai-heading" className="band scroll-mt-16">
        <div className="max-w-[76rem] mx-auto">
          <ChannelHeading
            id="ai-heading"
            eyebrow="AI"
            heading="AI tools and workflows"
            body="How I use AI agents and coding tools in real work, what they cost, and where they go wrong."
            url={YOUTUBE_CHANNELS.ai.url}
          />

          {!videos && (
            <p className="text-gray-700 dark:text-gray-300">
              The video list isn&apos;t available right now. You can watch everything on YouTube.
            </p>
          )}

          {featured.length > 0 && (
            <div className="mb-14">
              <h3 className="eyebrow mb-5">Start here</h3>
              <VideoGrid videos={featured} channel="ai" />
            </div>
          )}

          {aiFull.length > 0 && (
            <div className="mb-14">
              <h3 className="eyebrow mb-5">Latest videos</h3>
              <VideoGrid videos={aiFull} channel="ai" />
            </div>
          )}

          {aiShorts.length > 0 && (
            <div>
              <h3 className="eyebrow mb-5">Shorts</h3>
              <ShortsRow videos={aiShorts} channel="ai" />
            </div>
          )}
        </div>
      </section>

      <section
        id="self-development"
        aria-labelledby="self-development-heading"
        className="band band-grey scroll-mt-16"
      >
        <div className="max-w-[76rem] mx-auto">
          <ChannelHeading
            id="self-development-heading"
            eyebrow="Self-development"
            heading="Unfiltered"
            body="Short, direct talks on habits, money, and mindset."
            url={YOUTUBE_CHANNELS.selfDevelopment.url}
          />

          {!videos && (
            <p className="text-gray-700 dark:text-gray-300">
              The video list isn&apos;t available right now. You can watch everything on YouTube.
            </p>
          )}

          {selfDevelopmentFull.length > 0 && (
            <div className="mb-14">
              <VideoGrid videos={selfDevelopmentFull} channel="self-development" />
            </div>
          )}

          {selfDevelopmentShorts.length > 0 && (
            <ShortsRow videos={selfDevelopmentShorts} channel="self-development" />
          )}
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-8 pb-16 max-w-[76rem] mx-auto">
        <EndOfPostNewsletterCard
          source="videos"
          heading="Get new posts in your inbox."
        />
      </section>
    </div>
  )
}
