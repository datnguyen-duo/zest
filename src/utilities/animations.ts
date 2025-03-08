import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export const animateElements = () => {
  if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger)
  }

  const headings = gsap.utils.toArray('.animate-heading') as HTMLElement[]
  headings.forEach((heading) => {
    gsap.fromTo(
      heading,
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: heading,
          start: 'top bottom',
        },
      },
    )
  })
}
