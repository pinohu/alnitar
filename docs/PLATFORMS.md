# Alnitar — Multi-platform guide

Alnitar is designed to run as:

1. **Website** — The primary deployment (e.g. alnitar.com).
2. **Progressive Web App (PWA)** — Installable from the browser; works offline when a service worker is added.
3. **iOS app** — Native shell around the same web app for the App Store.
4. **Android app** — Native shell around the same web app for Google Play.

One React/Vite codebase serves all four. Build once with `npm run build`; the `dist/` output is used for the website, PWA, and (inside a native container) for iOS and Android.

### Developing on Windows

- **Website, PWA, Android** — Fully supported. Use `npm run dev`, `npm run build`, and for native Android: `npx cap add android`, then `npm run cap:sync` and `npm run cap:android` (requires [Android Studio](https://developer.android.com/studio) installed).
- **iOS** — Building and running the iOS app requires **macOS** and Xcode. On a Windows PC you can develop the web app and use the Android build; for the iOS build you’ll need a Mac (or a cloud Mac / CI service like MacStadium or GitHub Actions with a macOS runner) to run `npx cap add ios`, open in Xcode, and submit to the App Store.

### Alternative: AppMySite (website-to-app service)

If you use **[AppMySite](https://www.appmysite.com/webtoapp/)** (or a similar “convert website to app” service):

1. **Deploy Alnitar first** — Publish your built site (e.g. `npm run build` → deploy `dist/` to Vercel, Netlify, or any host) so you have a live URL (e.g. `https://alnitar.com`).
2. **Point AppMySite at that URL** — Their builder wraps your site in a native app shell (WebView) and helps you create iOS and Android builds in the cloud.
3. **No Mac or Android Studio required** — You get both store-ready apps from a Windows PC; they handle the build and often guide store submission.
4. **Trade-offs** — You rely on their platform (subscription, their branding/limits). For full control and no ongoing fee, use Capacitor and build Android on Windows / iOS on a Mac when needed.

So: **Capacitor** = full control, free, but iOS needs macOS. **AppMySite** = get iOS + Android from Windows via a third-party wrapper; good if you want both stores without a Mac.

---

## Website

- Run `npm run build` and deploy the `dist/` folder to your host (Vercel, Netlify, Cloudflare Pages, etc.).
- Ensure SPA routing is configured (e.g. `/* → /index.html`).
- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` at build time.

---

## Progressive Web App (PWA)

The project includes:

- **Web App Manifest** — `public/manifest.webmanifest` (name, short_name, start_url, display, theme_color, icons).
- **Meta tags** — `theme-color`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, `apple-touch-icon` in `index.html`.
- **Service worker** — [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) generates a Workbox service worker on build (`dist/sw.js`). It’s registered in `src/main.tsx` with `registerType: 'autoUpdate'` for cache updates. Static assets are precached; external images use a cache-first runtime strategy.

The build is **installable** and works **offline**: users can “Add to Home Screen” or “Install app,” and repeat visits use the cached bundle when offline.

### PWA checklist

- [ ] Serve the site over HTTPS (required for install and service worker).
- [ ] Add dedicated 192×192 and 512×512 icons to `public/` and reference them in `manifest.webmanifest` for best install prompts.

---

## iOS app (native shell)

**[Capacitor](https://capacitorjs.com)** is already configured in this repo (`capacitor.config.ts`: `appId: com.alnitar.app`, `appName: Alnitar`, `webDir: dist`). Same `dist/` output runs inside a native iOS shell.

### 1. Build and add iOS (first time only)

```bash
npm run build
npx cap add ios
```

### 2. Sync and open in Xcode

```bash
npm run cap:sync
npm run cap:ios
```

Or manually: `npx cap sync ios` then `npx cap open ios`.

In Xcode: configure signing, bundle ID (e.g. `com.alnitar.app`), and build for device/simulator. Submit to the App Store via the usual process.

### 3. Rebuilding after web changes

After any `npm run build`, run `npm run cap:sync` (or `npx cap sync ios`), then open and run from Xcode.

### iOS-specific considerations

- **Camera / file access** — If the app uses camera or photo library, add the corresponding capabilities and permission strings in Xcode and in the app’s `Info.plist` (e.g. `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`).
- **Status bar** — `apple-mobile-web-app-status-bar-style` in `index.html` is respected when the app is run as a PWA or in a WebView.
- **Safe area** — Use CSS environment variables (`env(safe-area-inset-*)`) or a layout component that respects safe areas on notched devices.

---

## Android app (native shell)

Capacitor is already configured. Same `dist/` runs inside a native Android app.

### 1. Build and add Android (first time only)

```bash
npm run build
npx cap add android
```

### 2. Sync and open in Android Studio

```bash
npm run cap:sync
npm run cap:android
```

Or: `npx cap sync android` then `npx cap open android`.

In Android Studio: configure signing, applicationId (e.g. `com.alnitar.app`), and build. Upload to Google Play when ready.

### 3. Rebuilding after web changes

After any `npm run build`, run `npm run cap:sync` (or `npx cap sync android`).

### Android-specific considerations

- **Camera / storage** — Declare and request the required permissions (e.g. camera, read/write storage) in `AndroidManifest.xml` and at runtime as needed.
- **Back button** — Handle the Android back button in the WebView (Capacitor can forward it; you can hook into it to navigate within the app or exit).
- **Theme / status bar** — Use Capacitor’s Status Bar plugin or set `theme_color` / status bar in the manifest and in your HTML so the app looks consistent with the PWA.

---

## Summary

| Platform   | Flow |
|-----------|------|
| **Website** | `npm run build` → deploy `dist/` to your host. |
| **PWA**     | Same build; manifest, meta tags, and **vite-plugin-pwa** service worker are in place (offline + installable). |
| **iOS**     | `npm run build` → `npx cap add ios` (once) → `npm run cap:sync` → `npm run cap:ios` → ship from Xcode. |
| **Android** | `npm run build` → `npx cap add android` (once) → `npm run cap:sync` → `npm run cap:android` → ship from Android Studio. |

One codebase, one build; the same Alnitar experience on web, PWA, iOS, and Android.
