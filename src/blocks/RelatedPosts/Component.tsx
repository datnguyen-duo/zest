// import clsx from 'clsx'
// import React from 'react'
// import RichText from '@/components/RichText'

// import type { Post } from '@/payload-types'

// import { Card, CardData } from '../../components/Card'

// export type RelatedPostsProps = {
//   className?: string
//   docs?: Post[]
//   introContent?: any
// }

// export const RelatedPosts: React.FC<RelatedPostsProps> = (props) => {
//   const { className, docs, introContent } = props

//   return (
//     <p>Related Posts</p>
//     // <div className={clsx('lg:container', className)}>
//     //   {introContent && <RichText data={introContent} enableGutter={false} />}

//     //   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-stretch">
//     //     {docs?.map((doc, index) => {
//     //       if (typeof doc === 'string') return null

//     //       return <p key={index}>Related Posts</p>
//     //     })}
//     //   </div>
//     // </div>
//   )
// }

export default function RelatedPosts() {
  return <p>Related Posts</p>
}
