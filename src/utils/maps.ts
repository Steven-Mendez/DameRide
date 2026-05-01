export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  polyline: string;
  distanceMeters: number;
  durationSeconds: number;
}

const OSRM_ROUTE_ENDPOINTS = [
  'https://router.project-osrm.org',
  'https://routing.openstreetmap.de/routed-car',
];

const OSRM_ROUTE_QUERIES = [
  'overview=full&geometries=polyline&radiuses=5000;5000&snapping=any',
  'overview=full&geometries=polyline',
];

const VALHALLA_ROUTE_ENDPOINTS = [
  'https://valhalla1.openstreetmap.de/route',
];

export function decodePolyline(polyline: string, precision = 5): Coordinate[] {
  const coordinates: Coordinate[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  const factor = 10 ** precision;

  while (index < polyline.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;

    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    latitude += deltaLat;

    result = 0;
    shift = 0;
    do {
      byte = polyline.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    longitude += deltaLng;

    coordinates.push({
      latitude: latitude / factor,
      longitude: longitude / factor,
    });
  }

  return coordinates;
}

function encodePolyline(coordinates: Coordinate[], precision = 5): string {
  let lastLatitude = 0;
  let lastLongitude = 0;
  let polyline = '';
  const factor = 10 ** precision;

  for (const coordinate of coordinates) {
    const latitude = Math.round(coordinate.latitude * factor);
    const longitude = Math.round(coordinate.longitude * factor);
    polyline += encodePolylineValue(latitude - lastLatitude);
    polyline += encodePolylineValue(longitude - lastLongitude);
    lastLatitude = latitude;
    lastLongitude = longitude;
  }

  return polyline;
}

function encodePolylineValue(value: number): string {
  let nextValue = value < 0 ? ~(value << 1) : value << 1;
  let encoded = '';

  while (nextValue >= 0x20) {
    encoded += String.fromCharCode((0x20 | (nextValue & 0x1f)) + 63);
    nextValue >>= 5;
  }

  return encoded + String.fromCharCode(nextValue + 63);
}

/**
 * Fetches a driving route between two coordinates using the OSRM public API.
 * Returns encoded polyline5 geometry compatible with decodePolyline(), plus
 * real road distance and estimated duration.
 *
 * Falls back gracefully (returns null) when the network is unavailable.
 */
export async function fetchDrivingRoute(
  origin: Coordinate,
  destination: Coordinate,
  signal?: AbortSignal,
): Promise<RouteResult | null> {
  const startedAt = Date.now();
  console.info('[Routing] Starting driving route lookup', { origin, destination });

  const osrmRoute = await fetchOsrmDrivingRoute(origin, destination, signal);
  if (osrmRoute) {
    console.info('[Routing] Route resolved via OSRM', {
      distanceMeters: Math.round(osrmRoute.distanceMeters),
      durationSeconds: Math.round(osrmRoute.durationSeconds),
      polylineLength: osrmRoute.polyline.length,
      elapsedMs: Date.now() - startedAt,
    });
    return osrmRoute;
  }

  const valhallaRoute = await fetchValhallaDrivingRoute(origin, destination, signal);
  if (valhallaRoute) {
    console.info('[Routing] Route resolved via Valhalla', {
      distanceMeters: Math.round(valhallaRoute.distanceMeters),
      durationSeconds: Math.round(valhallaRoute.durationSeconds),
      polylineLength: valhallaRoute.polyline.length,
      elapsedMs: Date.now() - startedAt,
    });
    return valhallaRoute;
  }

  console.warn('[Routing] No route resolved by any provider', {
    origin,
    destination,
    elapsedMs: Date.now() - startedAt,
  });
  return null;
}

async function fetchOsrmDrivingRoute(
  origin: Coordinate,
  destination: Coordinate,
  signal?: AbortSignal,
): Promise<RouteResult | null> {
  const coords = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;

  for (const endpoint of OSRM_ROUTE_ENDPOINTS) {
    for (const query of OSRM_ROUTE_QUERIES) {
      const url = `${endpoint}/route/v1/driving/${coords}?${query}`;

      try {
        const res = await fetch(url, { signal });
        if (!res.ok) continue;
        const data = (await res.json()) as {
          code: string;
          routes?: { geometry: string; distance: number; duration: number }[];
          message?: string;
        };
        if (data.code !== 'Ok' || !data.routes?.length) continue;
        const route = data.routes[0];
        console.info('[OSRM] Route candidate resolved', {
          endpoint,
          query,
          distanceMeters: Math.round(route.distance),
          durationSeconds: Math.round(route.duration),
          polylineLength: route.geometry.length,
        });
        return {
          polyline: route.geometry,
          distanceMeters: route.distance,
          durationSeconds: route.duration,
        };
      } catch (error) {
        console.warn('[OSRM] Request failed', {
          endpoint,
          query,
          aborted: Boolean(signal?.aborted),
          message: error instanceof Error ? error.message : String(error),
        });
        if (signal?.aborted) return null;
      }
    }
  }

  console.warn('[OSRM] No route resolved', { origin, destination, coords });
  return null;
}

async function fetchValhallaDrivingRoute(
  origin: Coordinate,
  destination: Coordinate,
  signal?: AbortSignal,
): Promise<RouteResult | null> {
  const body = JSON.stringify({
    locations: [
      { lat: origin.latitude, lon: origin.longitude, type: 'break' },
      { lat: destination.latitude, lon: destination.longitude, type: 'break' },
    ],
    costing: 'auto',
    directions_options: { units: 'kilometers' },
  });

  for (const endpoint of VALHALLA_ROUTE_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal,
      });
      if (!res.ok) continue;

      const data = (await res.json()) as {
        trip?: {
          summary?: { length?: number; time?: number };
          legs?: { shape?: string; summary?: { length?: number; time?: number } }[];
        };
      };

      const legs = data.trip?.legs ?? [];
      const coordinates = legs.flatMap((leg, index) => {
        const decoded = leg.shape ? decodePolyline(leg.shape, 6) : [];
        return index > 0 ? decoded.slice(1) : decoded;
      });

      if (coordinates.length <= 1) {
        console.warn('[Valhalla] Route response had no usable shape', {
          endpoint,
          legCount: legs.length,
          decodedPoints: coordinates.length,
        });
        continue;
      }

      const legDistanceKm = legs.reduce((sum, leg) => sum + (leg.summary?.length ?? 0), 0);
      const distanceKm = data.trip?.summary?.length ?? legDistanceKm;
      const legDurationSeconds = legs.reduce((sum, leg) => sum + (leg.summary?.time ?? 0), 0);
      const durationSeconds = data.trip?.summary?.time ?? legDurationSeconds;

      console.info('[Valhalla] Route candidate resolved', {
        endpoint,
        legCount: legs.length,
        decodedPoints: coordinates.length,
        distanceMeters: Math.round(distanceKm * 1000),
        durationSeconds: Math.round(durationSeconds),
      });

      return {
        polyline: encodePolyline(coordinates, 5),
        distanceMeters: distanceKm * 1000,
        durationSeconds,
      };
    } catch (error) {
      console.warn('[Valhalla] Request failed', {
        endpoint,
        aborted: Boolean(signal?.aborted),
        message: error instanceof Error ? error.message : String(error),
      });
      if (signal?.aborted) return null;
    }
  }

  console.warn('[Valhalla] No route resolved', { origin, destination });
  return null;
}
