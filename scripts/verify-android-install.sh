#!/usr/bin/env bash
set -euo pipefail
mkdir -p install-results
trap 'adb logcat -d > install-results/logcat.txt; adb exec-out screencap -p > install-results/screen.png' EXIT
adb install VAS-public.apk | tee install-results/install.txt
grep -q Success install-results/install.txt
adb shell am start -W -n id.vas.umkm/.MainActivity | tee install-results/start.txt
for attempt in $(seq 1 20); do
  sleep 2
  adb shell uiautomator dump /sdcard/vas-window.xml >/dev/null 2>&1 || continue
  adb pull /sdcard/vas-window.xml install-results/window.xml >/dev/null
  if grep -q 'Selamat datang kembali' install-results/window.xml; then
    echo 'PASS: signed public APK installed and login screen visible.' | tee install-results/result.txt
    exit 0
  fi
done
echo 'FAIL: login screen did not appear.' | tee install-results/result.txt
exit 1
