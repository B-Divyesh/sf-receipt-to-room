import "./styles.css";

const repository = "https://github.com/B-Divyesh/sf-receipt-to-room";
const releasesApi = "https://api.github.com/repos/B-Divyesh/sf-receipt-to-room/releases/latest";
const releasePage = `${repository}/releases/latest`;
const realDownloadCacheKey = "receipt-to-room:release-metadata:v2";
const demoDownloadCacheKey = "demo:receipt-to-room:release-metadata:v2";
const cacheLifetime = 60 * 60 * 1000;
const demoKey = "demo:receipt-to-room:sample:v1";

type ReleaseAsset = { name: string; browser_download_url: string };
type Release = { tag_name: string; html_url?: string; assets: ReleaseAsset[] };
type CachedRelease = { savedAt: number; release: Release };
type Download = { label: string; url: string; key: string };

const button = document.querySelector<HTMLAnchorElement>("#download-button")!;
const note = document.querySelector<HTMLElement>("#download-note")!;
const list = document.querySelector<HTMLElement>("#download-list")!;
const toggle = document.querySelector<HTMLButtonElement>("#all-downloads")!;
const demoBanner = document.querySelector<HTMLElement>("#demo-banner")!;
const sample = document.querySelector<HTMLElement>("#sample-workspace")!;
const sampleRows = document.querySelector<HTMLElement>("#sample-rows")!;
const sampleSearch = document.querySelector<HTMLInputElement>("#sample-search")!;

function platformKey(): string {
  const ua = navigator.userAgent.toLowerCase();
  const arm = ua.includes("arm64") || ua.includes("aarch64");
  if (ua.includes("windows")) return "windows-x86_64";
  if (ua.includes("mac")) return arm ? "macos-arm64" : "macos-x86_64";
  return "linux-x86_64";
}

function assetFor(assets: ReleaseAsset[], patterns: RegExp[]): ReleaseAsset | undefined {
  return assets.find((asset) => patterns.every((pattern) => pattern.test(asset.name)));
}

function downloadsFromRelease(release: Release): Download[] {
  const assets = release.assets.filter((asset) => typeof asset.name === "string" && typeof asset.browser_download_url === "string");
  const choices: Array<[string, string, RegExp[]]> = [
    ["macos-arm64", "macOS (Apple silicon)", [/\.dmg$/i, /(aarch64|arm64)/i]],
    ["macos-x86_64", "macOS (Intel)", [/\.dmg$/i, /(x64|x86_64|amd64)/i]],
    ["windows-x86_64", "Windows", [/\.(msi|exe)$/i, /(x64|x86_64|amd64)/i]],
    ["linux-x86_64", "Linux AppImage", [/\.appimage$/i, /(x64|x86_64|amd64)/i]]
  ];
  return choices.flatMap(([key, label, patterns]) => {
    const asset = assetFor(assets, patterns);
    return asset ? [{ key, label, url: asset.browser_download_url }] : [];
  });
}

function saveRelease(release: Release): void {
  try { localStorage.setItem(isDemo() ? demoDownloadCacheKey : realDownloadCacheKey, JSON.stringify({ savedAt: Date.now(), release } satisfies CachedRelease)); }
  catch { /* Storage can be unavailable in private browser modes. */ }
}

function cachedRelease(): CachedRelease | null {
  try {
    const cached = JSON.parse(localStorage.getItem(isDemo() ? demoDownloadCacheKey : realDownloadCacheKey) ?? "null") as CachedRelease | null;
    if (!cached || typeof cached.savedAt !== "number" || !cached.release || !Array.isArray(cached.release.assets)) return null;
    return cached;
  } catch { return null; }
}

function renderDownloadList(downloads: Download[]): void {
  list.replaceChildren(...downloads.map((download) => {
    const link = document.createElement("a");
    link.href = download.url;
    const label = document.createElement("span");
    label.textContent = download.label;
    const detail = document.createElement("small");
    detail.textContent = "GitHub download";
    link.append(label, detail);
    return link;
  }));
}

function renderRelease(release: Release, fromCache = false): void {
  const downloads = downloadsFromRelease(release);
  const chosen = downloads.find((download) => download.key === platformKey()) ?? downloads.find((download) => download.key === "linux-x86_64") ?? downloads[0];
  if (!chosen) { renderPublishing(); return; }
  button.href = chosen.url;
  button.textContent = `Download ${chosen.label}`;
  note.textContent = `${release.tag_name.replace(/^v/, "Version ")} · unsigned release${fromCache ? " · saved details" : ""}`;
  renderDownloadList(downloads);
}

function renderPublishing(): void {
  button.href = releasePage;
  button.textContent = "View release page";
  note.textContent = "Downloads are being published. Check the release page again soon.";
  list.replaceChildren();
}

async function requestRelease(): Promise<Release | null> {
  try {
    const response = await fetch(releasesApi, { headers: { Accept: "application/vnd.github+json" } });
    if (!response.ok) return null;
    const release = await response.json() as Release;
    if (!release || typeof release.tag_name !== "string" || !Array.isArray(release.assets)) return null;
    return release;
  } catch { return null; }
}

async function loadDownloads(): Promise<void> {
  const cached = cachedRelease();
  if (cached) renderRelease(cached.release, Date.now() - cached.savedAt > cacheLifetime);
  if (cached && Date.now() - cached.savedAt < cacheLifetime) return;
  const release = await requestRelease();
  if (release) { saveRelease(release); renderRelease(release); }
  else if (!cached) renderPublishing();
}

toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") === "true";
  toggle.setAttribute("aria-expanded", String(!open));
  list.hidden = open;
});

type SampleItem = { name: string; room: string; category: string; paid: string };
const sampleData: SampleItem[] = [
  { name: "Cedar kettle", room: "Kitchen", category: "Appliance", paid: "$42.00" },
  { name: "Reading lamp", room: "Office", category: "Decor", paid: "$39.00" },
  { name: "Linen storage box", room: "Bedroom", category: "Home supply", paid: "$12.50" }
];

function isDemo(): boolean { return new URL(location.href).searchParams.get("demo") === "1"; }
function setMeta(selector: string, content: string): void { document.querySelector<HTMLMetaElement>(selector)?.setAttribute("content", content); }
function setRouteMetadata(demo: boolean): void {
  const title = demo ? "Demo — Receipt to Room" : "Receipt to Room — turn receipts into room records";
  const description = demo ? "Try three demo room records without changing your real records." : "Turn receipt photos into a searchable room record on your computer.";
  const canonical = demo ? "https://receipt-to-room.sociobot.in/?demo=1" : "https://receipt-to-room.sociobot.in/";
  document.title = title;
  document.querySelector<HTMLLinkElement>("#page-canonical")?.setAttribute("href", canonical);
  setMeta("#page-description", description); setMeta("#og-title", title); setMeta("#og-description", description);
  setMeta("#twitter-title", title); setMeta("#twitter-description", description);
}
function renderSample(query = ""): void {
  const needle = query.trim().toLowerCase();
  const visible = sampleData.filter((item) => Object.values(item).some((value) => value.toLowerCase().includes(needle)));
  sampleRows.replaceChildren(...visible.map((item) => {
    const row = document.createElement("li");
    const name = document.createElement("strong"); name.textContent = item.name;
    const room = document.createElement("span"); room.textContent = item.room;
    const category = document.createElement("span"); category.textContent = item.category;
    const paid = document.createElement("data"); paid.textContent = item.paid;
    row.append(name, room, category, paid);
    return row;
  }));
  if (!visible.length) {
    const empty = document.createElement("li");
    empty.className = "sample-empty";
    empty.textContent = "No sample records match that search.";
    sampleRows.append(empty);
  }
}

function enterDemo(moveFocus = true): void {
  try { localStorage.setItem(demoKey, JSON.stringify({ startedAt: Date.now() })); } catch { /* The sample still works in memory. */ }
  if (!isDemo()) history.pushState({}, "", "/?demo=1#sample");
  setRouteMetadata(true);
  demoBanner.hidden = false;
  sample.hidden = false;
  renderSample(sampleSearch.value);
  if (moveFocus) requestAnimationFrame(() => {
    const scrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    sample.scrollIntoView({ block: "start" });
    document.querySelector<HTMLElement>("#sample-title")?.focus({ preventScroll: true });
    document.documentElement.style.scrollBehavior = scrollBehavior;
  });
}

function resetDemo(): void {
  try { localStorage.removeItem(demoKey); } catch { /* Storage can be disabled. */ }
  sampleSearch.value = "";
  renderSample();
  document.querySelector<HTMLElement>("#demo-reset-note")!.textContent = "Sample reset.";
}

function leaveDemo(moveFocus = true): void {
  try { localStorage.removeItem(demoKey); } catch { /* Storage can be disabled. */ }
  demoBanner.hidden = true; sample.hidden = true; setRouteMetadata(false);
  if (moveFocus) requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>("h1");
    if (heading) { heading.tabIndex = -1; heading.focus(); }
  });
}

function syncRouteFromLocation(): void {
  if (isDemo()) enterDemo(true);
  else leaveDemo(true);
}

document.querySelectorAll<HTMLAnchorElement>("[data-start-demo]").forEach((link) => link.addEventListener("click", (event) => {
  event.preventDefault();
  enterDemo();
}));
document.querySelector<HTMLButtonElement>("#reset-demo")?.addEventListener("click", resetDemo);
document.querySelector<HTMLAnchorElement>("#start-real")?.addEventListener("click", () => {
  leaveDemo(false);
});
sampleSearch.addEventListener("input", () => renderSample(sampleSearch.value));
window.addEventListener("popstate", syncRouteFromLocation);

if (isDemo()) enterDemo();
else { sample.hidden = true; demoBanner.hidden = true; setRouteMetadata(false); }
void loadDownloads();
