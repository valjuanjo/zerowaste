import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

export type Capture = {
  photoUri: string | null;
  geo: { lat: number; lon: number } | null;
  place: string;
  timestamp: string;
};

/** Opens the camera. Returns null if the user backs out; photoUri is null if the camera was refused. */
export async function takePhoto(): Promise<{ photoUri: string | null } | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) return { photoUri: null };
  const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.5 });
  if (res.canceled || !res.assets?.length) return null;
  return { photoUri: res.assets[0].uri };
}

/** Best-effort location: never throws, never blocks a report. */
export async function locate(): Promise<Pick<Capture, 'geo' | 'place'>> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return { geo: null, place: 'Ubicación no compartida' };
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const geo = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    let place = `${geo.lat.toFixed(5)}, ${geo.lon.toFixed(5)}`;
    try {
      const [a] = await Location.reverseGeocodeAsync({ latitude: geo.lat, longitude: geo.lon });
      const parts = [[a?.street, a?.streetNumber].filter(Boolean).join(' '), a?.district || a?.city].filter(Boolean);
      if (parts.length) place = parts.join(', ');
    } catch {
      // No address available (offline or unsupported): keep coordinates.
    }
    return { geo, place };
  } catch {
    return { geo: null, place: 'Ubicación no disponible' };
  }
}
