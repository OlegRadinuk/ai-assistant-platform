export function buildWidgetSnippet(slug: string, baseUrl: string): string {
  return `<script src="${baseUrl}/widget.js" data-bot="${slug}" data-api="${baseUrl}" async></script>`
}
