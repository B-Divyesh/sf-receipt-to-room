export function assertAvifContentType(contentType) {
  if (!/^image\/avif(?:;|$)/i.test(contentType ?? "")) {
    throw new Error(
      `AVIF asset returned ${contentType || "no Content-Type"}, expected image/avif`,
    );
  }
  return { contentType };
}
