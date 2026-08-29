import "./styles.css";
import { renderBuildVersion } from "./version";
import {
  currentRouteLabel,
  focusAndAnnounce,
  isHistoryTraversal,
  markSameOriginRouteLinks,
} from "./route-navigation";

function focusCurrentRoute(): void {
  focusAndAnnounce("main h1", currentRouteLabel());
}

window.addEventListener("DOMContentLoaded", () => {
  renderBuildVersion();
  markSameOriginRouteLinks();
  focusCurrentRoute();
});

window.addEventListener("pageshow", (event) => {
  if (event.persisted || isHistoryTraversal()) focusCurrentRoute();
});
