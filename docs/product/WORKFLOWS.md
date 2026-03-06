# Core User Workflows

## 1. Homepage Visit

Land on `/`, see hero section with name, headshot, and bio. CTA buttons ("Read the Blog", "My Now", "About me") are visible. Featured posts section displays recent writing. Social links (GitHub, LinkedIn, Email) are present.

## 2. Browse Blog

Navigate to `/blog`, see the post list. Click a post to visit `/blog/[slug]` and read it. Click "Back to all posts" to return to the listing.

## 3. Read Content Pages

Visit `/about` and `/now` to see page content with headings and prose.

## 4. Theme Toggle

Click the toggle button in the header to switch between light and dark mode. The preference persists in localStorage across page loads.

## 5. Navigate via Header

Use the floating nav bar links (Blog, Now, About, RSS) to navigate. Click the avatar to return home.

## 6. Social Links

GitHub, LinkedIn, and Email links are present in both the hero section and the footer with correct hrefs:

- `github.com/mattjmcnaughton`
- `linkedin.com/in/mattjmcnaughton`
- `mailto:me@mattjmcnaughton.com`

## 7. RSS Feed

`/feed` returns valid RSS XML (`application/rss+xml`) containing blog post entries with `<channel>` and `<item>` elements.
