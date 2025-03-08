import type { HeroBlock as HeroBlockProps } from '@/payload-types'
import { cn } from '@/utilities/cn'
import { Card, CardData } from '@/components/Card'
import { Carousel } from '@/components/Carousel'
import { CarouselSlide } from '@/components/Carousel/CarouselSlide'
import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
export const HeroBlock: React.FC<HeroBlockProps> = (props) => {
  const { title, variation, posts } = props

  return (
    <section
      className={cn('container p-4', {
        'grid grid-cols-12 gap-4': variation === 'feature',
      })}
    >
      <h1
        className={cn({
          'text-h2 text-center': variation === 'slider',
          'text-h1': variation === 'feature',
        })}
      >
        {title}
      </h1>
      {variation === 'slider' && posts && (
        <Carousel
          className="overflow-hidden rounded-3x l"
          showDots
          showArrows={false}
          fade
          autoplay
          autoplayDelay={7000}
          dotLabels={posts.map((post) => {
            return post.relationTo
              ? post.relationTo.charAt(0).toUpperCase() + post.relationTo.slice(1)
              : ''
          })}
          dotClassName="py-2 px-4 rounded-full transition-all"
          dotsClassName="right-6 left-auto"
        >
          {posts.map((post) => {
            if (typeof post.value === 'object' && post.value !== null) {
              return (
                <CarouselSlide key={`${post.relationTo}-${post.value.id}`}>
                  <h3 className="text-h3 absolute left-6 bottom-6">{post.value.title}</h3>
                  <Media
                    resource={post.value.featuredImage as MediaType}
                    imgClassName="aspect-video w-full h-full object-cover"
                  />
                </CarouselSlide>
              )
            }
            return null
          })}
        </Carousel>
      )}
    </section>
  )
}
