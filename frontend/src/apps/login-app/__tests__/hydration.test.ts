import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { gzipSync } from 'zlib'
import { join } from 'path'

describe('Login App Hydration Performance', () => {
  it('should have login app bundle under 6KB gzipped', () => {
    // Verify build output exists
    const assetsDir = join(process.cwd(), 'dist', 'assets')
    if (!existsSync(assetsDir)) {
      throw new Error('dist/assets not found — run npm run build first')
    }

    // Find the actual loginApp bundle from build output
    // Vite resolves loginApp entry to main-*.js
    const files = readdirSync(assetsDir)
    const mainBundle = files.find((f) => f.startsWith('main-') && f.endsWith('.js'))
    expect(mainBundle).toBeDefined()

    const bundlePath = join(assetsDir, mainBundle!)
    const bundleContent = readFileSync(bundlePath)

    // Measure gzipped size using Node's built-in gzip
    const gzippedSize = gzipSync(bundleContent)
    const gzippedSizeKB = gzippedSize.length / 1024

    console.log(`Login app bundle: ${(bundleContent.length / 1024).toFixed(2)}KB raw → ${gzippedSizeKB.toFixed(2)}KB gzipped`)
    expect(gzippedSizeKB).toBeLessThan(6)
  })

  it.skip('should measure first paint timing (requires Playwright e2e)', () => {
    // Unit tests cannot measure browser hydration timing
    // Real validation: Use Chrome DevTools Performance tab or Playwright script
    // 1. Record page load in DevTools
    // 2. Check FCP (First Contentful Paint) < 100ms
    // 3. Check LCP (Largest Contentful Paint) < 150ms
  })
})
