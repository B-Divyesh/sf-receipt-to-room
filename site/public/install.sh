#!/bin/sh
set -eu

repo="B-Divyesh/sf-receipt-to-room"
manifest_url="https://github.com/$repo/releases/latest/download/latest.json"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT INT TERM

case "$(uname -s)" in
  Darwin)
    case "$(uname -m)" in arm64|aarch64) key="macos-arm64" ;; *) key="macos-x86_64" ;; esac
    ;;
  Linux) key="linux-x86_64" ;;
  *) echo "Receipt to Room supports macOS and Linux with this installer." >&2; exit 1 ;;
esac

curl -fsSL "$manifest_url" -o "$tmp_dir/latest.json"
if command -v python3 >/dev/null 2>&1; then
  url="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["platforms"][sys.argv[2]]["url"])' "$tmp_dir/latest.json" "$key")"
  expected="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["platforms"][sys.argv[2]]["sha256"])' "$tmp_dir/latest.json" "$key")"
else
  echo "Python 3 is needed to read the signed release manifest." >&2; exit 1
fi

asset="$tmp_dir/${url##*/}"
curl -fL "$url" -o "$asset"
if command -v sha256sum >/dev/null 2>&1; then actual="$(sha256sum "$asset" | cut -d ' ' -f1)"; else actual="$(shasum -a 256 "$asset" | cut -d ' ' -f1)"; fi
[ "$actual" = "$expected" ] || { echo "Checksum mismatch; the download was not installed." >&2; exit 1; }

if [ "$key" = "linux-x86_64" ]; then
  install_dir="${XDG_BIN_HOME:-$HOME/.local/bin}"
  mkdir -p "$install_dir"
  install -m 755 "$asset" "$install_dir/receipt-to-room"
  echo "Installed Receipt to Room to $install_dir/receipt-to-room (SHA256 verified)."
  echo "If needed, add $install_dir to PATH, then run: receipt-to-room"
else
  destination="$HOME/Downloads/Receipt-to-Room.dmg"
  cp "$asset" "$destination"
  echo "Saved a SHA256-verified disk image to $destination."
  echo "Opening it now. Drag Receipt to Room into Applications; the build is unsigned, so first launch may require right-click → Open."
  open "$destination"
fi
