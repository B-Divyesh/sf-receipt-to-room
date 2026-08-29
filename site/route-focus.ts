import "./styles.css";
import { renderBuildVersion } from "./version";

window.addEventListener("DOMContentLoaded", () => {
  renderBuildVersion();
  const heading = document.querySelector<HTMLElement>("main h1");
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
});
