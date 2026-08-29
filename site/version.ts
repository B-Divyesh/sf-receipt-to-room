import packageMetadata from "../package.json";

export function renderBuildVersion(): void {
  document.querySelectorAll<HTMLElement>("[data-build-version]").forEach((element) => {
    element.textContent = `v${packageMetadata.version}`;
  });
}
