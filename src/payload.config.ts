import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'

import sharp from 'sharp' // sharp-import
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

// Site Structure
import { Pages } from './collections/Pages'
import { Header } from './Header/config'
import { Footer } from './Footer/config'

// Restaurants
import { Restaurants } from './collections/Restaurants'
import { RestaurantGuides } from './collections/Restaurants/guides'

// Flavor
import { Recipes } from './collections/Flavor/recipes'
import { Techniques } from './collections/Flavor/techniques'
import { Ingredients } from './collections/Flavor/ingredients'

// Travel
import { Itineraries } from './collections/Travel/itineraries'
import { TravelGuides } from './collections/Travel/guides'

// Stories
import { Stories } from './collections/Stories'

// Taxonomies
import { Cuisines } from './collections/taxonomies/Cuisines'
import { Destinations } from './collections/taxonomies/Destinations'
import { Moods } from './collections/taxonomies/Moods'
import { PriceLevels } from './collections/taxonomies/PriceLevels'
import { MealTypes } from './collections/taxonomies/MealTypes'
import { Occasions } from './collections/taxonomies/Occasions'
import { Diets } from './collections/taxonomies/Diets'
import { DifficultyLevels } from './collections/taxonomies/DifficultyLevels'
import { TravelStyles } from './collections/taxonomies/TravelStyles'
import { Regions } from './collections/taxonomies/Regions'
import { Environments } from './collections/taxonomies/Environments'

// Shared Content
import { Media } from './collections/Media'
import { Comments } from './collections/Comments'
import { Categories } from './collections/Categories'

// Admin
import { Users } from './collections/Users'

// Plugins
import { plugins } from './plugins'

// Utilities
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      graphics: {
        Logo: '@/components/Logo/Logo',
        Icon: '@/components/Admin/HomeIcon',
      },
      beforeDashboard: ['@/components/Admin/BeforeDashboard'],
      beforeNavLinks: ['@/components/Admin/BeforeNavLinks'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    theme: 'light',
    meta: {
      title: 'Admin Dashboard',
      titleSuffix: ' | Zest',
      description: 'Admin Dashboard for Zest',
      icons: [
        {
          rel: 'icon',
          type: 'image/png',
          url: '/favicon.ico',
        },
      ],
    },
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  // database-adapter-config-start
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL,
    },
  }),
  // database-adapter-config-end
  collections: [
    Pages,
    Restaurants,
    RestaurantGuides,
    PriceLevels,
    Cuisines,
    Moods,
    Destinations,
    Recipes,
    Techniques,
    Ingredients,
    MealTypes,
    Occasions,
    Diets,
    DifficultyLevels,
    Itineraries,
    TravelGuides,
    TravelStyles,
    Regions,
    Environments,
    Stories,
    Media,
    Users,
    Comments,
    Categories,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  globals: [Header, Footer],
  plugins: [
    ...plugins,
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        // Allow logged in users to execute this endpoint (default)
        if (req.user) return true

        // If there is no logged in user, then check
        // for the Vercel Cron secret to be present as an
        // Authorization header:
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${process.env.CRON_SECRET}`
      },
    },
    tasks: [],
  },
})
