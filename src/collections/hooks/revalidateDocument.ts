import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'

type RevalidateConfig = {
  basePath: string
  sitemapTag: string
}

// Add type constraint for documents
interface BaseDocument {
  id: string
  slug: string
  _status?: string
}

export const createRevalidateHook = <T extends BaseDocument>({
  basePath,
  sitemapTag,
}: RevalidateConfig) => {
  const revalidateDoc: CollectionAfterChangeHook<T> = ({
    doc,
    previousDoc,
    req: { payload, context },
  }) => {
    if (!context.disableRevalidate) {
      if (doc._status === 'published') {
        const path = `/${basePath}/${doc.slug}`
        payload.logger.info(`Revalidating ${basePath} at path: ${path}`)
        revalidatePath(path)
        revalidateTag(sitemapTag)
      }

      if (previousDoc?._status === 'published' && doc._status !== 'published') {
        const oldPath = `/${basePath}/${previousDoc.slug}`
        payload.logger.info(`Revalidating old ${basePath} at path: ${oldPath}`)
        revalidatePath(oldPath)
        revalidateTag(sitemapTag)
      }
    }
    return doc
  }

  const revalidateDelete: CollectionAfterDeleteHook<T> = ({ doc, req: { context } }) => {
    if (!context.disableRevalidate) {
      const path = `/${basePath}/${doc?.slug}`
      revalidatePath(path)
      revalidateTag(sitemapTag)
    }
    return doc
  }

  return { revalidateDoc, revalidateDelete }
}
