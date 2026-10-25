# Leafora Android app

This Android client runs as a directly installable APK. Plant records, observation
history, prediction snapshots, transplant records, and captured photos stay in
the app's private storage on the phone. No Flask server, Render service, or
computer is required at runtime. Weather search and the 7-day forecast use the
Open-Meteo geocoding and forecast APIs when the phone has internet access.

The committed reference cohort contains 10 Super Orange plants observed through
day 32. The app labels its day-33 reference as provisional because the supplied
data do not establish the earliest successful transplant date or train a
validated readiness model. Soil moisture is a manual reading; camera photos are
saved as observations and are not represented as species recognition.

## Build the APK

The `Build Android APK` GitHub Actions workflow builds a debug-signed APK. Open
the workflow run on GitHub and download the `leafora-android-apk` artifact. On an
Android phone, open the downloaded APK and allow Chrome or Files to install apps
from that source if Android prompts.

For a local build, install JDK 17 and Android SDK packages `platforms;android-35`
and `build-tools;35.0.0`, then run Gradle 8.13 from this directory:

```text
gradle :app:assembleDebug
```

The output is `app/build/outputs/apk/debug/app-debug.apk`.
