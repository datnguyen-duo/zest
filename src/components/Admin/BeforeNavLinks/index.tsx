import Logo from '@/components/Logo/Logo'
import './index.scss'
import Link from 'next/link'

const baseClass = 'before-nav-links'

export default function BeforeNavLinks() {
  return (
    <Link href="/admin" className={`${baseClass}__link`}>
      <Logo className={`${baseClass}__logo`} />
    </Link>
  )
}
