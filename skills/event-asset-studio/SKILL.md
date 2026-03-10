# Event Asset Studio

Create complete event marketing asset suites — brochures, interactive apps, posters, dashboards — from speaker lists and event details. All assets are static HTML with inline CSS, print-ready, zero dependencies.

## Trigger

When the user mentions creating event materials, conference assets, speaker brochures, event apps, event posters, or any combination of print + digital event deliverables.

Keywords: event brochure, conference app, speaker directory, event poster, conference portal, event assets, speaker cards, event print materials

## Capabilities

- **Speaker Brochure** — Print-ready HTML with `@page` CSS. Card grid layout (4 per page). Cover, TOC, schedule, speaker cards, back cover. Supports 8x10", 8.5x11", custom sizes.
- **Interactive Conference Portal** — Mobile-first single-page app. Search, filter by segment, day toggle, modal profiles, schedule with speakers, venue map, event info accordion, countdown timer.
- **Event Dashboard** — Landing page with cards linking to all assets. Quick links to schedule, speakers, venue.
- **Event Poster** — Large format (24x36") with dynamic QR code (Hovercode). Supports standard and AI-generated artistic QR codes.
- **Sponsor Adverts** — Print-ready full-page sponsor advertisements.
- **Headshot Management** — Consistent naming, initials fallback for missing photos, multi-location sync.
- **Cross-Asset Alignment** — Audit and sync speaker data, schedules, brand references across all assets.

## Workflow

```
/event-assets new [event-name]
```

1. **Gather** — Collect speaker list, event details, brand colors/fonts, schedule, venue info
2. **Build Brochure** — Single HTML file, card grid, print-optimized
3. **Build App** — Single HTML file, mobile-first, interactive
4. **Source Headshots** — LinkedIn, company sites, press; initials fallback
5. **Create Dashboard** — Landing page linking all assets
6. **Create Poster** — Dynamic QR via Hovercode + optional AI art QR
7. **Iterate** — Apply feedback, screenshot analysis, alignment audits
8. **Deploy** — Git push to Netlify, print via Save as PDF

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Structure | Semantic HTML5, single-file per asset |
| Styling | Inline CSS: Grid, Flexbox, @page, @media print |
| Fonts | Google Fonts (configurable) |
| Icons | Inline SVG |
| Interactivity | Vanilla JS (app only) |
| Images | Speaker headshots (JPEG/PNG/WebP) |
| Hosting | Netlify (auto-deploy from GitHub) |
| QR | Hovercode (dynamic redirect, free) |
| AI QR Art | Gooey.ai, OpenArt, or Hugging Face |

## Speaker Data Schema

Each speaker in the JS array:
```js
{
  id: 'lastname',           // URL-safe identifier
  name: 'Full Name',        // Display name
  initials: 'XX',           // Fallback initials
  photo: 'headshots/name.jpg',
  tagline: 'Short tagline',
  titles: ['Title 1', 'Title 2'],
  segment: 'keynote',       // keynote|leadership|group1|group2|group3|day1
  segLabel: 'Morning Keynote',
  segColor: '#F86759',
  segClass: 'seg-keynote',
  bio: 'Full biography text...',
  highlights: [{t:'Title', d:'Description'}, ...],
  quote: '"Quote text"',
  quoteAttr: 'Attribution',
  tags: ['Tag1', 'Tag2'],
  linkedin: 'https://...',
  website: 'https://...',
  company: 'Company Name',
  articles: [{title:'Title', url:'https://...'}]
}
```

## File Structure

```
public/[event-name]/
├── index.html              # Dashboard
├── brochure/
│   ├── index.html          # Print brochure
│   └── headshots/          # Speaker photos
├── speakerinfo/
│   ├── index.html          # Interactive portal
│   ├── hero-bg.jpg         # Hero image
│   └── headshots/          # Speaker photos
├── poster/
│   ├── standard.html       # Standard QR poster
│   ├── artistic.html       # AI art QR poster
│   ├── qr-standard.png     # QR images
│   └── qr-artistic.png
└── [sponsor]-advert/       # Optional sponsor pages
    └── index.html
```

## Brand System Template

Define these tokens for any event:
```css
--primary: #5BC9C5;      /* Main brand color */
--accent: #F86759;       /* Energy/CTA color */
--navy: #2A3741;         /* Dark background */
--light: #93DDDC;        /* Subtle text on dark */
--serif: 'Playfair Display', serif;
--sans: 'Poppins', sans-serif;
```

## Print Specifications

| Format | @page Size | Use Case |
|--------|-----------|----------|
| Brochure | 8in 10in | Standard print brochure |
| US Letter | 8.5in 11in | Office printing |
| Poster | 24in 36in | Large format display |
| Advert | 8.5in 11in | Full-page sponsor ad |

## Dependencies

- Google Fonts CDN
- Google Maps Embed API (for venue map)
- Hovercode account (for dynamic QR)
- GitHub repo + Netlify deployment

## Reference Implementation

See `BB1/Projects/NetworkDental-Event/_context/event-asset-creation-report.md` for the complete case study of building the Network Dental event suite.

## Lessons Learned

1. Start with 4-per-page card grid — don't waste iterations on 1-per-page layouts
2. Always create initials fallback for missing headshots
3. Put ALL speaker data in a single JS array at the top of the file
4. Dynamic QR codes are essential — use Hovercode (free, unlimited)
5. Do a final alignment audit — brochure and app drift independently
6. Screenshot analysis is powerful for extracting client feedback from text messages
7. `@page` CSS + Chrome "Save as PDF" is the most reliable print path
8. 301 redirects when renaming paths — never break existing URLs
