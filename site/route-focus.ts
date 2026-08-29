import "./styles.css";

window.addEventListener("DOMContentLoaded", () => {
  const heading = document.querySelector<HTMLElement>("main h1");
  if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
});
