# Security Headers

This site sets HTTP response headers on all routes via `next.config.ts` to
improve its security posture. The headers are defined once and applied to every
response through the Next.js [custom headers](https://nextjs.org/docs/app/api-reference/config/next-config-js/headers) API.

## Headers

### Content-Security-Policy

[MDN reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

Controls which resources the browser is allowed to load. The policy restricts
all resource types to same-origin by default, with the following exceptions:

- `style-src 'unsafe-inline'` and `script-src 'unsafe-inline'` — required by
  Next.js, which injects inline styles and scripts at runtime.
- `img-src 'self' data:` — allows local images and data URIs.
- `frame-src` — allows embedded iframes from YouTube (`youtube-nocookie.com`)
  and Giphy (`giphy.com`), which are used in existing blog posts.
- `upgrade-insecure-requests` — automatically upgrades HTTP requests to HTTPS.

The policy is deployed as an enforcing `Content-Security-Policy` header. The
allowlist was built by auditing all blog content for embedded external
resources.

#### Why `unsafe-inline` and raw HTML are allowed

Blog posts are authored in markdown with `allowDangerousHtml` enabled and
rendered via `dangerouslySetInnerHTML`. This is necessary because some posts
embed third-party iframes (YouTube videos and Giphy GIFs) directly in the
markdown source. We accept this trade-off because we are the sole content
author — no user-generated content is rendered. If we later self-host videos
and GIFs, we can remove raw HTML support and significantly tighten CSP by
dropping `'unsafe-inline'` and the `frame-src` allowlist.

### Strict-Transport-Security (HSTS)

[MDN reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security)

Instructs browsers to only connect over HTTPS. Set to a 6-month `max-age`
(15768000 seconds) with `includeSubDomains`. The `preload` directive is
intentionally omitted until the header has been validated in production for a
full cycle.

### Referrer-Policy

[MDN reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy)

Set to `strict-origin-when-cross-origin`. Sends the full URL as referrer for
same-origin requests but only the origin (no path) for cross-origin requests.

### X-Content-Type-Options

[MDN reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options)

Set to `nosniff`. Prevents browsers from MIME-sniffing a response away from the
declared `Content-Type`, stopping attacks that rely on type confusion.

### X-Frame-Options

[MDN reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options)

Set to `DENY`. Prevents this site from being embedded in iframes on other
domains (clickjacking protection). Redundant with `frame-ancestors 'none'` in
the CSP but provides a fallback for older browsers.

### Permissions-Policy

[MDN reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy)

Disables browser APIs the site does not use: camera, microphone, and
geolocation. Prevents any injected script from accessing these features.

## Future work

- Consider increasing HSTS `max-age` and adding `preload` once stable.
- If we self-host videos and GIFs, remove raw HTML support from markdown
  rendering and tighten CSP by dropping `'unsafe-inline'` and the `frame-src`
  allowlist.
