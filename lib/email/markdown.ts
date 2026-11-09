import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import type { Root, Element } from 'hast'

/**
 * Inline styles for the email body. Email clients ignore <style> blocks and
 * class names, so every element gets its look from a style attribute. Colors
 * match the dark layout used by the blog-post and welcome emails.
 */
const STYLES: Record<string, string> = {
  p: 'margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#d4d4d4;',
  h1: 'margin:0 0 16px 0;font-size:24px;line-height:1.3;font-weight:600;color:#ffffff;',
  h2: 'margin:24px 0 12px 0;font-size:20px;line-height:1.3;font-weight:600;color:#ffffff;',
  h3: 'margin:20px 0 8px 0;font-size:17px;line-height:1.3;font-weight:600;color:#ffffff;',
  h4: 'margin:16px 0 8px 0;font-size:15px;line-height:1.3;font-weight:600;color:#ffffff;',
  a: 'color:#00d2ff;text-decoration:underline;',
  ul: 'margin:0 0 16px 0;padding:0 0 0 20px;color:#d4d4d4;',
  ol: 'margin:0 0 16px 0;padding:0 0 0 20px;color:#d4d4d4;',
  li: 'margin:0 0 6px 0;font-size:15px;line-height:1.6;color:#d4d4d4;',
  blockquote: 'margin:0 0 16px 0;padding:4px 0 4px 16px;border-left:3px solid #333;color:#a3a3a3;',
  code: 'font-family:SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;background:#1f1f1f;color:#e5e5e5;padding:2px 4px;border-radius:4px;',
  pre: 'margin:0 0 16px 0;padding:12px;background:#1f1f1f;border-radius:6px;overflow-x:auto;',
  hr: 'margin:24px 0;border:0;border-top:1px solid #222;',
  img: 'max-width:100%;height:auto;border-radius:6px;',
  strong: 'color:#ffffff;',
  table: 'margin:0 0 16px 0;border-collapse:collapse;',
  th: 'padding:6px 10px;border:1px solid #333;font-size:14px;color:#ffffff;text-align:left;',
  td: 'padding:6px 10px;border:1px solid #333;font-size:14px;color:#d4d4d4;',
}

function inlineEmailStyles() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, _index, parent) => {
      let style = STYLES[node.tagName]
      // Code inside a <pre> block shouldn't get the inline-code pill look.
      if (node.tagName === 'code' && parent && (parent as Element).tagName === 'pre') {
        style = 'font-family:SFMono-Regular,Menlo,Consolas,monospace;font-size:13px;color:#e5e5e5;'
      }
      if (style) {
        node.properties = { ...node.properties, style }
      }
      if (node.tagName === 'a') {
        const href = String(node.properties?.href ?? '')
        // Only web and mail links belong in a newsletter.
        if (!/^(https?:|mailto:)/i.test(href)) delete node.properties.href
        node.properties = { ...node.properties, target: '_blank', rel: 'noopener noreferrer' }
      }
      if (node.tagName === 'img') {
        const src = String(node.properties?.src ?? '')
        if (!/^https:/i.test(src)) delete node.properties.src
      }
    })
  }
}

/**
 * Turn the Markdown an operator typed on the compose page into email-safe HTML.
 *
 * Raw HTML in the Markdown is dropped (remark-rehype runs without
 * allowDangerousHtml), so only Markdown formatting reaches the email.
 */
export function markdownToEmailHtml(markdown: string): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(inlineEmailStyles)
    .use(rehypeStringify)
    .processSync(markdown)
  return String(file)
}
