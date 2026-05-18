/**
 * Mirrors `trip-brochure.json` — keep keys in sync with
 * `website/src/data/trip-brochure.schema.json`.
 */

export type HighlightSegment =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'breakfast'
  | 'lunch'
  | 'dinner'

export interface TripBrochure {
  tripTitle: string
  dataVersion: string
  hero: {
    headline: string
    subheadline: string
    dateRange: string
  }
  meta: {
    hotelName: string
    hotelMapsUrl: string
    hotelSummary: string
  }
  days: DayCard[]
}

export interface DayCard {
  dateLabel: string
  sectionTitle: string
  tagline: string
  highlights: Highlight[]
}

export interface Highlight {
  segment: HighlightSegment
  label: string
  intro: string
  mapsUrl: string | null
}
