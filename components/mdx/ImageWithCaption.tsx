import Image from 'next/image'

interface ImageWithCaptionProps {
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
}

export default function ImageWithCaption({
  src,
  alt,
  caption,
  width = 1200,
  height = 630,
}: ImageWithCaptionProps) {
  return (
    <figure className="my-8">
      <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
