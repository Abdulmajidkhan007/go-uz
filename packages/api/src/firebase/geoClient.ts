/**
 * Firebase implementation of GeoApi.
 *
 * NOTE: Firebase has no built-in places/geocoding service. In production this
 * adapter should proxy Google Places API calls through a Cloud Function to
 * keep the API key server-side (never expose it in client bundles).
 *
 * This implementation provides two modes, selected at construction time:
 *
 * 1. Stub mode (default): Returns a small deterministic list of Tashkent-area
 *    places. Suitable for development, Storybook, and CI. A `places` Firestore
 *    collection can optionally back this (see below).
 *
 * 2. Firestore `places` collection mode: If a `places` collection exists,
 *    `autocomplete` queries it with `primaryText >= query` / `primaryText < query+￿`
 *    (lexicographic range scan — limited but functional without a search index).
 *    `reverseGeocode` returns the nearest stub address (client-side).
 *
 * Production wiring (replace this client with a Cloud Function proxy):
 *   In the Cloud Function, call Google Places Autocomplete + Geocoding APIs
 *   with the server-side key; return the same PlaceSuggestion / Address types.
 *   The factory signature and CallerApi are identical — no consumer changes.
 */
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import type { PlaceSuggestion, Address, AddressId, UserId } from '@vroom/types';
import type { GeoApi } from '../endpoints/geo.js';
import { fbGuard } from './errors.js';
import { COLLECTIONS } from './mappers.js';

// ---------------------------------------------------------------------------
// Deterministic stub data (Tashkent area)
// ---------------------------------------------------------------------------

const STUB_SUGGESTIONS: readonly PlaceSuggestion[] = [
  {
    placeId: 'place_tashkent_city_center',
    primaryText: 'City Center',
    secondaryText: 'Tashkent, Uzbekistan',
    geo: { lat: 41.2995, lng: 69.2401 },
  },
  {
    placeId: 'place_chorsu_bazaar',
    primaryText: 'Chorsu Bazaar',
    secondaryText: 'Eski Shahar, Tashkent',
    geo: { lat: 41.3265, lng: 69.2302 },
  },
  {
    placeId: 'place_national_park',
    primaryText: 'National Park',
    secondaryText: 'Mirzo-Ulugbek, Tashkent',
    geo: { lat: 41.3156, lng: 69.2888 },
  },
  {
    placeId: 'place_tashkent_railway',
    primaryText: 'Tashkent Railway Station',
    secondaryText: 'Shayhontohur, Tashkent',
    geo: { lat: 41.2929, lng: 69.2773 },
  },
  {
    placeId: 'place_yunusabad',
    primaryText: 'Yunusabad District',
    secondaryText: 'Tashkent, Uzbekistan',
    geo: { lat: 41.3504, lng: 69.2847 },
  },
  {
    placeId: 'place_chilonzor',
    primaryText: 'Chilonzor District',
    secondaryText: 'Tashkent, Uzbekistan',
    geo: { lat: 41.2851, lng: 69.2108 },
  },
  {
    placeId: 'place_airport',
    primaryText: 'Tashkent International Airport',
    secondaryText: 'Yakkasaray, Tashkent',
    geo: { lat: 41.2579, lng: 69.2812 },
  },
  {
    placeId: 'place_samarkand_darvoza',
    primaryText: 'Samarkand Darvoza',
    secondaryText: 'Shaykhantaur, Tashkent',
    geo: { lat: 41.3200, lng: 69.2480 },
  },
];

const STUB_ADDRESSES: readonly (Address & { geo: { lat: number; lng: number } })[] = [
  {
    id: 'addr_stub_001' as AddressId,
    userId: 'usr_stub' as UserId,
    label: 'custom',
    formatted: 'City Center, Tashkent',
    geo: { lat: 41.2995, lng: 69.2401 },
    placeId: 'place_tashkent_city_center',
  },
  {
    id: 'addr_stub_002' as AddressId,
    userId: 'usr_stub' as UserId,
    label: 'custom',
    formatted: 'Chorsu Bazaar, Tashkent',
    geo: { lat: 41.3265, lng: 69.2302 },
    placeId: 'place_chorsu_bazaar',
  },
  {
    id: 'addr_stub_003' as AddressId,
    userId: 'usr_stub' as UserId,
    label: 'custom',
    formatted: 'Yunusabad District, Tashkent',
    geo: { lat: 41.3504, lng: 69.2847 },
    placeId: 'place_yunusabad',
  },
  {
    id: 'addr_stub_004' as AddressId,
    userId: 'usr_stub' as UserId,
    label: 'custom',
    formatted: 'Tashkent International Airport',
    geo: { lat: 41.2579, lng: 69.2812 },
    placeId: 'place_airport',
  },
];

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createGeoClient(db: Firestore): GeoApi {
  return {
    async autocomplete(req) {
      if (req.query.trim().length < 2) {
        return { ok: true, value: [] };
      }

      // Try Firestore `places` collection first (optional).
      return fbGuard(async () => {
        try {
          const q = query(
            collection(db, COLLECTIONS.places),
            where('primaryText', '>=', req.query),
            where('primaryText', '<=', req.query + '￿'),
            orderBy('primaryText'),
            limit(8),
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            return snap.docs.map((d) => {
              const data = d.data();
              const base: PlaceSuggestion = {
                placeId: d.id,
                primaryText: typeof data['primaryText'] === 'string' ? data['primaryText'] : '',
                secondaryText: typeof data['secondaryText'] === 'string' ? data['secondaryText'] : '',
              };
              const geo = data['geo'];
              if (geo !== null && geo !== undefined && typeof geo === 'object') {
                const geoObj = geo as Record<string, unknown>;
                if (typeof geoObj['lat'] === 'number' && typeof geoObj['lng'] === 'number') {
                  return { ...base, geo: { lat: geoObj['lat'], lng: geoObj['lng'] } };
                }
              }
              return base;
            });
          }
        } catch {
          // Collection doesn't exist or query failed — fall through to stubs.
        }

        // Fall back to stub filtering.
        const q2 = req.query.toLowerCase();
        return STUB_SUGGESTIONS.filter(
          (s) =>
            s.primaryText.toLowerCase().includes(q2) ||
            s.secondaryText.toLowerCase().includes(q2),
        );
      });
    },

    async reverseGeocode(req) {
      return fbGuard(async () => {
        // Client-side nearest-stub lookup (Manhattan distance).
        let closest = STUB_ADDRESSES[0];
        if (closest === undefined) {
          // Should never happen given the constant array above.
          return {
            id: 'addr_stub_fallback' as AddressId,
            userId: 'usr_stub' as UserId,
            label: 'custom' as const,
            formatted: 'Unknown location',
            geo: req.point,
          };
        }

        let minDist =
          Math.abs(closest.geo.lat - req.point.lat) +
          Math.abs(closest.geo.lng - req.point.lng);

        for (const addr of STUB_ADDRESSES.slice(1)) {
          const dist =
            Math.abs(addr.geo.lat - req.point.lat) +
            Math.abs(addr.geo.lng - req.point.lng);
          if (dist < minDist) {
            minDist = dist;
            closest = addr;
          }
        }

        return closest;
      });
    },
  };
}
