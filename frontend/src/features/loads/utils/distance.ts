interface Coords {
  lat: number
  lon: number
}

async function geocode(address: string): Promise<Coords | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'en', 'User-Agent': 'FreightClub/1.0' },
  })
  const data = await res.json()
  if (!data.length) return null
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
}

async function roadDistanceMiles(origin: Coords, dest: Coords): Promise<number> {
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${dest.lon},${dest.lat}?overview=false`
  const res = await fetch(url)
  const data = await res.json()
  if (data.code !== 'Ok' || !data.routes?.length) throw new Error('Route not found')
  return Math.round(data.routes[0].distance * 0.000621371 * 10) / 10
}

export async function calculateDistanceMiles(
  originAddress: string,
  destAddress: string,
): Promise<number> {
  const [origin, dest] = await Promise.all([geocode(originAddress), geocode(destAddress)])
  if (!origin) throw new Error(`Could not locate: ${originAddress}`)
  if (!dest) throw new Error(`Could not locate: ${destAddress}`)
  return roadDistanceMiles(origin, dest)
}
