# VOID STREAM — custom Nuvio addon

A self-hosted, Nuvio-compatible Stremio-protocol addon starter. It provides movie/series/live-TV catalogs, metadata, stream listings, subtitle listings, bilingual preferences, and response-time-based source ordering.

## Important
- This project does **not** include pirated streams, scraped links, or a library of copyrighted films.
- It includes one public demo sample stream. Other demo catalog entries are metadata-only until you add an authorized URL.
- Live TV entries must be configured with a stream URL you own or are authorized to use.
- A response-time probe is only a quick availability/latency estimate. It cannot guarantee actual playback speed, throughput, or buffering.
- This addon is a remote web service. A public HTTPS host is required for installation outside your own computer.

## Requirements
Node.js 20+

## Run locally
```bash
npm install
cp .env.example .env
npm start
```
Open `http://localhost:7000/manifest.json` to inspect the manifest.
For a phone on the same Wi-Fi, set `PUBLIC_BASE_URL` to your computer's LAN IP, e.g. `http://192.168.1.20:7000`, and allow the port through your firewall. For normal remote use, deploy to a host with HTTPS and set `PUBLIC_BASE_URL` to that HTTPS URL.

## Add your authorized movie/series sources
Set `MEDIA_SOURCES_JSON` in `.env` to a JSON array. Each item is tied to a catalog item ID:
```json
[
  {
    "contentId": "void:elephants-dream",
    "name": "My Home Server",
    "url": "https://YOUR-AUTHORIZED-MEDIA-URL/video.mp4",
    "quality": "1080p",
    "audio": ["English", "Spanish"],
    "subtitles": [
      { "id": "ed-en", "lang": "English", "url": "https://YOUR-SERVER/subs/english.vtt" },
      { "id": "ed-es", "lang": "Spanish", "url": "https://YOUR-SERVER/subs/spanish.vtt" }
    ]
  }
]
```
The URL must be a direct media URL supported by the Nuvio player. Do not put account passwords or private tokens in a public repository. Use a private deployment and secure secrets.

## Add live channels
Set `LIVE_CHANNELS_JSON` to an array:
```json
[
  {
    "id": "void:my-live-channel",
    "type": "channel",
    "name": "My Authorized Channel",
    "poster": "https://YOUR-SERVER/channel-logo.png",
    "description": "My own live channel",
    "streams": [{
      "name": "Primary server",
      "url": "https://YOUR-AUTHORIZED-HLS-URL/master.m3u8",
      "quality": "1080p",
      "audio": ["English", "Spanish"],
      "subtitles": []
    }]
  }
]
```
Only include channels you own or have permission to redistribute. The app lists language/subtitle information you provide; it does not inspect every audio track inside a remote file.

## Install in Nuvio
1. Deploy this service to a public HTTPS host.
2. Copy `https://YOUR-HOST/manifest.json`.
3. In Nuvio, open Settings → Content and Discovery → Addons → Install from URL.
4. Paste the manifest URL.

## Current feature status
- [x] Stremio-compatible manifest and HTTP routes
- [x] Movie, series, and live-channel catalogs
- [x] Metadata responses
- [x] Source list with English/Spanish labels
- [x] Subtitle listing for configured English/Spanish subtitle URLs
- [x] Basic source response-time ranking and failover-friendly list ordering
- [ ] Public hosting / HTTPS deployment
- [ ] Your personal Jellyfin/Emby/Plex or direct-media connection details
- [ ] Your live channel URLs and subtitle files
- [ ] Expanded metadata provider/API key configuration
- [ ] Real throughput testing and playback telemetry (latency alone is not enough)

## Notes about fastest server
The addon makes a short ranged HTTP request to each configured source and sorts responding sources by measured response time. This is a connection-latency ranking, not a true bandwidth benchmark. Nuvio may also merge streams from other installed addons/plugins, so the final player list can include sources outside this addon's control.
