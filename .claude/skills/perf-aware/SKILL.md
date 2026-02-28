---
name: perf-aware
description: Performance-conscious development patterns. Use when the user mentions slow, optimize, performance, speed, or when working with large datasets, heavy rendering, image loading, bundle size, or API response times.
allowed-tools: Read, Edit, Write, Grep, Glob, Bash
---

# Performance Awareness

Lightweight performance intelligence that auto-activates when performance matters. Not a profiling tool — a set of patterns to prevent performance problems before they happen.

## React Rendering

### Prevent Unnecessary Re-renders
- **Measure first**: Only optimize when you see a real problem (React DevTools Profiler)
- `useMemo` / `useCallback` for expensive computations or stable references passed to children
- `React.memo` for components that render often with same props
- Move state down — lift state only as high as needed

### Expensive Patterns to Avoid
```typescript
// BAD — new object every render, breaks memo
<Child style={{ color: 'red' }} />

// GOOD — stable reference
const style = useMemo(() => ({ color: 'red' }), []);
<Child style={style} />

// BAD — inline function recreated every render
<Button onClick={() => handleClick(id)} />

// GOOD — stable callback
const handleClick = useCallback(() => doThing(id), [id]);
<Button onClick={handleClick} />
```

### List Rendering
- Stable keys (never array index for dynamic lists)
- Virtualize long lists (>100 items): `react-window` or `@tanstack/virtual`
- Paginate API responses — never load all items at once

## Web Vitals

### LCP (Largest Contentful Paint) — Target: <2.5s
- Preload hero images: `<link rel="preload" as="image">`
- Use `priority` on Next.js `<Image>` for above-fold images
- Avoid lazy loading above-fold content
- Font display: `font-display: swap` or use `next/font`

### CLS (Cumulative Layout Shift) — Target: <0.1
- Always set explicit `width` and `height` on images/videos
- Reserve space for dynamic content (skeletons)
- Never inject content above existing content after load
- Use `min-height` on containers that load async content

### INP (Interaction to Next Paint) — Target: <200ms
- Keep main thread free — offload heavy computation to Web Workers
- Debounce/throttle input handlers (search, scroll, resize)
- Use `startTransition` for non-urgent React updates
- Break long tasks with `scheduler.yield()` or `requestIdleCallback`

## Images & Media

### Next.js Image Optimization
```typescript
// GOOD — automatic optimization, lazy loading, responsive
import Image from 'next/image';
<Image src="/hero.jpg" width={800} height={400} alt="..." priority />

// BAD — unoptimized, no lazy loading, no responsive sizing
<img src="/hero.jpg" />
```

### Image Rules
- Use WebP/AVIF (Next.js does this automatically)
- Serve responsive sizes via `sizes` attribute
- Lazy load below-fold images (default in Next.js)
- `priority` only for LCP image (usually one per page)
- Compress: target <200KB for hero, <50KB for thumbnails

## Bundle Size

### Keep Bundles Small
- Dynamic imports for routes and heavy components:
  ```typescript
  const HeavyChart = dynamic(() => import('./HeavyChart'), { ssr: false });
  ```
- Tree-shake: use named imports, not default namespace imports
  ```typescript
  // GOOD — tree-shakeable
  import { format } from 'date-fns';
  // BAD — imports entire library
  import * as dateFns from 'date-fns';
  ```
- Check bundle impact before adding dependencies: `npx bundlephobia <package>`
- Prefer native APIs over libraries when possible (Intl, URL, crypto)

## API Response Times

### Fast Responses
- Return immediately for operations >5s — use async processing + status polling
- Database queries: index columns used in WHERE/JOIN/ORDER BY
- Pagination: never return unbounded result sets
- Cache expensive computations (in-memory for single-server, Redis for distributed)

### Request Optimization
- Batch related API calls where possible
- `Promise.all` for independent concurrent requests
- Abort in-flight requests on navigation: `AbortController`
  ```typescript
  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal });
    return () => controller.abort();
  }, [url]);
  ```

## CSS & Animation Performance

### GPU-Only Properties
Animate ONLY: `transform`, `opacity`, `filter`
NEVER animate: `width`, `height`, `top`, `left`, `margin`, `padding`, `border`

### Containment
```css
/* Tell browser this element's internals don't affect outside layout */
.card { contain: layout style paint; }

/* For virtualized lists */
.list-item { content-visibility: auto; contain-intrinsic-size: 0 80px; }
```

### Scroll Performance
- `will-change: transform` only during active animations (remove after)
- Use `transform: translateZ(0)` sparingly for layer promotion
- Prefer `scroll-behavior: smooth` over JS scroll animation
- Use CSS `scroll-snap` over JS scroll libraries

## Quick Checklist

### Before Shipping
- [ ] No console warnings about missing keys or deprecated APIs
- [ ] Images have explicit dimensions (no CLS)
- [ ] LCP image has `priority` attribute
- [ ] Heavy components use dynamic imports
- [ ] Lists >50 items are paginated or virtualized
- [ ] No unnecessary re-renders (check with React DevTools)
- [ ] API calls have timeout and abort handling
- [ ] `prefers-reduced-motion` respected for all animations

### Red Flags
| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Page loads slowly | Large unoptimized images, no lazy loading | Next.js Image + priority for LCP |
| Scrolling janky | Animating layout properties, no virtualization | GPU-only animations, virtualize lists |
| Input feels laggy | Heavy computation on main thread | Debounce, Web Worker, startTransition |
| Bundle too large | Full library imports, no code splitting | Dynamic imports, tree-shake, check deps |
| API feels slow | No pagination, sequential requests | Paginate, parallelize, cache |
