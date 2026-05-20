/**
 * Brochure landing page — data from `trip-brochure.json` only.
 */
import tripData from './data/trip-brochure.json'
import type { TripBrochure, DayCard, Highlight } from './data/types'
import { SEGMENT_LABELS } from './segment-labels'

const trip = tripData as TripBrochure

/** Inline map-pin SVG (decorative); anchor carries aria-label. */
const MAP_PIN_SVG =
  '<svg class="day-highlight__link-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function highlightRow(h: Highlight): HTMLElement {
  const row = document.createElement('div')
  row.className = 'day-highlight'

  const seg = document.createElement('span')
  seg.className = 'day-highlight__segment'
  seg.textContent = SEGMENT_LABELS[h.segment] ?? h.segment

  const label = document.createElement('p')
  label.className = 'day-highlight__label'
  label.textContent = h.label

  const intro = document.createElement('p')
  intro.className = 'day-highlight__intro'
  intro.textContent = h.intro

  row.appendChild(seg)
  row.appendChild(label)

  if (h.mapsUrl) {
    const mapCell = document.createElement('div')
    mapCell.className = 'day-highlight__mapcell'
    const a = document.createElement('a')
    a.className = 'day-highlight__link'
    a.href = h.mapsUrl
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.setAttribute('aria-label', `Google 地圖：${h.label}`)
    a.title = 'Google 地圖'
    a.innerHTML = MAP_PIN_SVG
    mapCell.appendChild(a)
    row.appendChild(mapCell)
  }

  row.appendChild(intro)

  return row
}

function dayCard(day: DayCard): HTMLElement {
  const card = document.createElement('article')
  card.className = 'day-card'

  const head = document.createElement('header')
  head.className = 'day-card__head'

  const date = document.createElement('p')
  date.className = 'day-card__date'
  date.textContent = day.dateLabel

  const title = document.createElement('h3')
  title.className = 'day-card__title'
  title.textContent = day.sectionTitle

  const tag = document.createElement('p')
  tag.className = 'day-card__tag'
  tag.textContent = day.tagline

  head.append(date, title, tag)

  const list = document.createElement('div')
  list.className = 'day-card__highlights'
  for (const h of day.highlights) {
    list.appendChild(highlightRow(h))
  }

  card.append(head, list)
  return card
}

function mount(root: HTMLElement): void {
  root.innerHTML = ''

  const hero = document.createElement('section')
  hero.className = 'hero'
  hero.setAttribute('aria-labelledby', 'hero-title')

  const heroInner = document.createElement('div')
  heroInner.className = 'hero__inner'

  const meta = document.createElement('div')
  meta.className = 'hero__meta'

  const kicker = document.createElement('p')
  kicker.className = 'hero__kicker'
  kicker.textContent = trip.hero.dateRange

  meta.appendChild(kicker)

  const body = document.createElement('div')
  body.className = 'hero__body'

  const h1 = document.createElement('h1')
  h1.id = 'hero-title'
  h1.className = 'hero__title'
  h1.textContent = trip.hero.headline

  const rule = document.createElement('div')
  rule.className = 'hero__rule'
  rule.setAttribute('aria-hidden', 'true')

  const sub = document.createElement('p')
  sub.className = 'hero__sub'
  sub.textContent = trip.hero.subheadline

  const cv = document.createElement('p')
  cv.className = 'hero__cv'
  cv.textContent = `資料版本 ${trip.dataVersion}`

  body.append(h1, rule, sub, cv)
  heroInner.append(meta, body)
  hero.appendChild(heroInner)

  const summary = document.createElement('section')
  summary.className = 'summary'
  summary.setAttribute('aria-labelledby', 'summary-title')

  const sumH2 = document.createElement('h2')
  sumH2.id = 'summary-title'
  sumH2.className = 'summary__title'
  sumH2.textContent = '旅程一覽'

  const grid = document.createElement('div')
  grid.className = 'summary__grid'

  {
    const cell = document.createElement('div')
    cell.className = 'summary-cell'
    const label = document.createElement('div')
    label.className = 'summary-cell__k'
    label.textContent = '住宿'
    const value = document.createElement('div')
    value.className = 'summary-cell__v'
    const a = document.createElement('a')
    a.href = trip.meta.hotelMapsUrl
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.className = 'summary-cell__link'
    a.textContent = trip.meta.hotelName
    value.appendChild(a)
    const span = document.createElement('span')
    span.className = 'summary-cell__muted'
    span.textContent = ` ${trip.meta.hotelSummary}`
    value.appendChild(span)
    cell.append(label, value)
    grid.appendChild(cell)
  }

  summary.append(sumH2, grid)

  const main = document.createElement('main')
  main.id = 'main'

  const daysSec = document.createElement('section')
  daysSec.className = 'days'

  const dayGrid = document.createElement('div')
  dayGrid.className = 'days__grid'
  for (const d of trip.days) {
    dayGrid.appendChild(dayCard(d))
  }
  daysSec.appendChild(dayGrid)

  main.append(hero, summary, daysSec)

  root.appendChild(main)

  document.title = esc(trip.tripTitle)
}

const app = document.getElementById('app')
if (app) {
  mount(app)
}
