import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/mdx'

export const alt = 'Blog post cover image'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const categoryColors: Record<string, string> = {
  ai: '#8B5CF6',
  productivity: '#10B981',
  development: '#3B82F6',
}

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug)

  const categoryColor = categoryColors[post?.category ?? ''] ?? '#6B7280'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Category badge */}
        <div style={{ display: 'flex' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 20px',
              borderRadius: '999px',
              background: categoryColor,
              color: '#fff',
              fontSize: '20px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {post?.category ?? 'blog'}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: post?.title && post.title.length > 60 ? '44px' : '52px',
              fontWeight: 800,
              color: '#f8fafc',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            {post?.title ?? 'Blog Post'}
          </div>
          <div
            style={{
              fontSize: '22px',
              color: '#94a3b8',
              lineHeight: 1.4,
              maxWidth: '900px',
            }}
          >
            {post?.description
              ? post.description.length > 120
                ? post.description.slice(0, 120) + '...'
                : post.description
              : ''}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#e2e8f0',
              }}
            >
              tarekalaaddin.com
            </div>
          </div>
          <div
            style={{
              fontSize: '18px',
              color: '#64748b',
            }}
          >
            Tarek Alaaddin
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
