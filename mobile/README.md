# Escanea Perú — phone prototype (Expo)

Runs on a real phone with **Expo Go**. English or Spanish (language button; English by default, remembered).
Three tabs:

- **Scan** (step 0.5a, decision D-014) — live camera with **simulated** plastic detections, to test the interface
  before the model is trained. The screen shows only the plastic share in the room and the mix of plastic types.
  Visual style: see-through — frosted glass panels, thin glowing corner brackets, a ring around the main number,
  a sweeping scan line.
  Tap the number or the bar for details (types of plastic, objects by category); tap a box for that item.
  First open asks for consent; the "Counting" pill pauses counting; "New room" in the details restarts.
- **Report** — the separate dump-point flow: real photo → GPS → choose litter type → send.
- **My reports** — status of sent reports.

## What is real and what is simulated

| Real | Simulated / missing |
|---|---|
| Camera picture in the scanner | **Recognition**: boxes, items and percentages are invented at random places; they do not match what the camera sees. Marked "DEMO" on screen |
| Camera, GPS, address lookup, timestamp in Report | Type of plastic shown is the usual one for the item, never measured |
| Reports and consent saved on the phone, survive restarts | Sending — there is no server; nothing leaves the phone. Whoever runs the test **long-presses a report** in "My reports" to move it to *Scheduled* / *Cleaned* |
| | Blurring of faces and plates in Report — not done |

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
