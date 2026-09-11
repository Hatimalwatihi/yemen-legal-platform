#!/data/data/com.termux/files/usr/bin/bash
set -e
printf "\n[1/5] Checking Node...\n"
node -v
npm -v
printf "\n[2/5] Installing dependencies...\n"
npm install --no-audit --no-fund
printf "\n[3/5] Checking TypeScript...\n"
npm run lint
printf "\n[4/5] Building web bundle...\n"
npm run build
printf "\n[5/5] Preparing Android...\n"
if [ ! -d android ]; then npm run android:add; fi
npx cap sync android
cd android
./gradlew assembleDebug
printf "\nAPK files:\n"
find app/build/outputs/apk -type f -name "*.apk" -print
