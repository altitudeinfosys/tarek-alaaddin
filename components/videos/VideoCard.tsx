'use client'

import { useEffect, useState } from 'react'
import { track } from '@vercel/analytics'
import { format } from 'date-fns'
import { formatDuration, type Video } from '@/lib/youtube'

// Starting one video stops any other, so two never play over each other.
const PLAY_EVENT = 'videos:play'

interface VideoCardProps {
  video: Video
  channel: string
}

export default function VideoCard({ video, channel }: VideoCardProps) {
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const stopIfOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== video.id) setPlaying(false)
    }
    window.addEventListener(PLAY_EVENT, stopIfOther)
    return () => window.removeEventListener(PLAY_EVENT, stopIfOther)
  }, [video.id])

  const play = () => {
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: video.id }))
    setPlaying(true)
    track('video_play', { channel })
  }

  const aspect = video.isShort ? 'aspect-[9/16]' : 'aspect-video'
  const duration = formatDuration(video.duration)

  const thumbnail = (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={video.thumbnail}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-950/75 text-white transition-colors group-hover:bg-primary-600">
          <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </span>
      {duration && !video.isShort && (
        <span className="absolute bottom-2 right-2 rounded bg-gray-950/80 px-1.5 py-0.5 font-mono text-[0.69rem] text-white">
          {duration}
        </span>
      )}
    </>
  )

  const frameClass = `group relative block w-full overflow-hidden rounded-lg bg-gray-950 ${aspect}`

  return (
    <article className="min-w-0">
      {playing ? (
        <div className={frameClass}>
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            className="absolute inset-0 h-full w-full"
          />
        </div>
      ) : video.embeddable ? (
        <button type="button" onClick={play} aria-label={`Play ${video.title}`} className={frameClass}>
          {thumbnail}
        </button>
      ) : (
        // The owner turned off embedding for this one, so it can only play on YouTube.
        <a
          href={video.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Watch ${video.title} on YouTube`}
          className={frameClass}
        >
          {thumbnail}
        </a>
      )}

      <h3
        className={`mt-3 font-semibold text-gray-900 dark:text-white ${
          video.isShort ? 'line-clamp-3 text-sm leading-snug' : 'line-clamp-2 leading-snug'
        }`}
      >
        {video.title}
      </h3>
      {!video.isShort && (
        <time
          dateTime={video.publishedAt}
          className="mt-1 block text-sm text-gray-600 dark:text-gray-400"
        >
          {format(new Date(video.publishedAt), 'MMM d, yyyy')}
        </time>
      )}
    </article>
  )
}
