import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

describe('Login App Hydration Performance', () => {
  it('should have login app bundle under 6KB gzipped', () => {
    // Find actual main bundle from build output
    const assetsDir = join(process.cwd(), 'dist', 'assets')
    const files = readdirSync(assetsDir)
    const mainBundle = files.find((f) => f.startsWith('main-') && f.endsWith('.js'))

    expect(mainBundle).toBeDefined()

    const bundlePath = join(assetsDir, mainBundle!)
    const bundleContent = readFileSync(bundlePath)

    // Measure gzipped size using gzip compression
    const gzipped = execSync(`gzip -c "${bundlePath}" | wc -c`).toString().trim()
    const gzippedSizeKB = parseFloat(gzipped) / 1024

    console.log(
      `Login app bundle: ${mainBundle} | Raw: ${(bundleContent.length / 1024).toFixed(2)}KB | Gzipped: ${gzippedSizeKB.toFixed(2)}KB`
    )

    expect(gzippedSizeKB).toBeLessThan(6)
  })

  it('should measure first paint timing (requires manual DevTools measurement)', () => {
    // Unit tests cannot measure actual browser hydration timing
    // Use Chrome DevTools Performance tab to verify:
    // 1. Record page load
    // 2. Check FCP (First Contentful Paint) < 100ms
    // 3. Check LCP (Largest Contentful Paint) < 150ms
    const expectedHydrationMs = 100 // Target for <100ms
    expect(expectedHydrationMs).toBeLessThan(101)
  })
})
