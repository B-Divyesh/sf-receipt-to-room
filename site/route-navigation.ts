const pendingFocusKey = "receipt-to-room:pending-route-focus:v1";

type PendingFocus = {
  target: string;
};

function currentTarget(): string {
  return `${location.pathname}${location.search}`;
}

function targetFor(url: URL): string {
  return `${url.pathname}${url.search}`;
}

function routeLabel(url: URL): string {
  if (url.searchParams.get("demo") === "1") return "Demo.";
  if (url.pathname === "/privacy/") return "Privacy.";
  if (url.pathname === "/terms/") return "Terms.";
  if (url.pathname === "/404.html") return "Page not found.";
  return "Home.";
}

/** Record an intentional same-origin page change so Home can preserve its cold-load skip-link behaviour. */
export function markNextRouteForFocus(url: URL): void {
  try {
    sessionStorage.setItem(
      pendingFocusKey,
      JSON.stringify({ target: targetFor(url) } satisfies PendingFocus),
    );
  } catch {
    // A blocked session store should never prevent navigation.
  }
}

/** Consume a focus marker only when it belongs to the page that just loaded. */
export function wasRouteFocusRequested(): boolean {
  try {
    const raw = sessionStorage.getItem(pendingFocusKey);
    if (!raw) return false;
    sessionStorage.removeItem(pendingFocusKey);
    const pending = JSON.parse(raw) as PendingFocus;
    return pending?.target === currentTarget();
  } catch {
    return false;
  }
}

/** Mark full same-origin links without interfering with buttons or in-page anchors. */
export function markSameOriginRouteLinks(): void {
  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]");
    if (!link || link.target || link.hasAttribute("download")) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || targetFor(url) === currentTarget()) return;
    markNextRouteForFocus(url);
  });
}

/** Focus the route heading and update the shared screen-reader announcement. */
export function focusAndAnnounce(selector: string, label: string): void {
  const heading = document.querySelector<HTMLElement>(selector);
  if (heading) {
    heading.tabIndex = -1;
    heading.focus();
  }
  const announcement = document.querySelector<HTMLElement>("#route-announcement");
  if (!announcement) return;
  announcement.textContent = "";
  requestAnimationFrame(() => {
    announcement.textContent = label;
  });
}

/** Browser history can restore a page from its back-forward cache without running module setup again. */
export function isHistoryTraversal(): boolean {
  const [navigation] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return navigation?.type === "back_forward";
}

export function currentRouteLabel(): string {
  return routeLabel(new URL(location.href));
}
