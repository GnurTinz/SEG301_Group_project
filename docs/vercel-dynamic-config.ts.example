// Evaluated by Vercel before the build; this URL is not bundled into browser code.
const rawOrigin = process.env.RENDER_API_ORIGIN;
if (!rawOrigin) throw new Error('Set RENDER_API_ORIGIN in the Vercel project environment');
const backend = new URL(rawOrigin);
if (
  backend.protocol !== 'https:' ||
  backend.username ||
  backend.password ||
  backend.pathname !== '/' ||
  backend.search ||
  backend.hash
)
  throw new Error('RENDER_API_ORIGIN must be an HTTPS origin without credentials, path or query');

export const config = {
  framework: 'vite',
  installCommand: 'npm ci --include=dev',
  buildCommand: 'npm run build:web',
  outputDirectory: 'apps/web/dist',
  rewrites: [
    { source: '/api/:path*', destination: `${backend.origin}/api/:path*` },
    { source: '/uploads/:path*', destination: `${backend.origin}/uploads/:path*` },
    { source: '/health/:path*', destination: `${backend.origin}/health/:path*` },
    {
      source: '/((?!api(?:/|$)|uploads(?:/|$)|health(?:/|$)|assets/|covers/).*)',
      destination: '/index.html',
    },
  ],
  headers: [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store' },
        { key: 'x-vercel-enable-rewrite-caching', value: '0' },
      ],
    },
  ],
};
