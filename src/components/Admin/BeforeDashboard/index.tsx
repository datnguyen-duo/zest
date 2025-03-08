'use client'
import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'
import './index.scss'
import { useAuth } from '@payloadcms/ui'
const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  const { user } = useAuth()

  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="default">
        <h2>👋 {user?.name && `Hi ${user.name},`} Welcome to your dashboard!</h2>
      </Banner>
      <p>Here&apos;s what to do next:</p>
      <ul className={`${baseClass}__instructions`}>
        <li>Select an item below to start editing.</li>
        <li>Use the sidebar to navigate to other items.</li>
      </ul>
      <p>
        Questions? Send us an email <a href="mailto:support@duo-studio.co">here</a>.
      </p>
    </div>
  )
}

export default BeforeDashboard
