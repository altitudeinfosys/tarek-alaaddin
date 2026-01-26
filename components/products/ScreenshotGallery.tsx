'use client'

import { useState } from 'react'
import Image from 'next/image'

interface ScreenshotGalleryProps {
  images: string[]
  productName: string
}

export default function ScreenshotGallery({ images, productName }: ScreenshotGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  if (images.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">Screenshots coming soon</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="w-full h-full flex items-center justify-center p-8">
          <div className="relative w-32 h-32">
            <Image
              src={images[selectedImage]}
              alt={`${productName} screenshot ${selectedImage + 1}`}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Thumbnail Grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === index
                  ? 'border-primary-500 dark:border-primary-400'
                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <div className="w-full h-full flex items-center justify-center p-2">
                <div className="relative w-8 h-8">
                  <Image
                    src={image}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
