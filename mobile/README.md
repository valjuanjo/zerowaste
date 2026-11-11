# Escanea Perú — phone prototype (Expo)

Citizen Street flow for plan step 0.5, runnable on a real phone with **Expo Go**:
English or Spanish (🌐 button in the header; English by default, the choice is remembered).

camera button → real photo → real GPS location → choose litter type → send → "Mis reportes" with status.

## What is real and what is simulated

| Real | Simulated / missing |
|---|---|
| Camera, GPS, address lookup, timestamp | Litter detection — the user picks the type (no AI model yet) |
| Reports saved on the phone, survive restarts | Blurring of faces and plates — not done; the photo never leaves the phone |
| | Sending to the municipality — there is no server. Whoever runs the test **long-presses a report** in "Mis reportes" to move it to *Programado* / *Limpiado* |

The municipal dashboard is still the HTML prototype in `../prototype/dashboard.html`; it is not connected to this app.

## Run it on your phone

On your computer (Node 20 or newer; VS Code's terminal is fine):

```bash
git clone https://github.com/valjuanjo/zerowaste.git
```

```bash
cd zerowaste/mobile
```

```bash
npm install
```

```bash
npx expo start
```

Then scan the QR code shown in the terminal: with the Expo Go app on Android, or the Camera app on iPhone.
Phone and computer must be on the same Wi-Fi. If the phone cannot connect, use:

```bash
npx expo start --tunnel
```

This project uses Expo SDK 58. If Expo Go says the project is incompatible, update Expo Go from the store.

## Checks

```bash
npx tsc --noEmit
```

```bash
npx expo export --platform web --output-dir dist-web
```

```bash
node scripts/web-smoke-test.js dist-web
```

The last one needs Playwright and drives the whole flow in a browser. It checks the app logic, not the phone camera.
