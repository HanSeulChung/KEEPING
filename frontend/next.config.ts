import type { NextConfig } from 'next'

const isWindows = process.platform === 'win32'

const nextConfig: NextConfig = {
  /* config options here */
  ...(isWindows ? {} : { output: 'standalone' }),
}

export default nextConfig
