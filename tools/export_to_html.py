"""
export_to_html.py

Converts a client ICP markdown file into a styled HTML file
optimized for copy-paste into Google Docs.

Usage:
  python3 tools/export_to_html.py <input.md> <output.html> [--logo-url URL] [--client-name NAME]

Colors and logo are auto-detected from client config when not provided.
"""

import sys
import re
import argparse

# ── Brand defaults (AW Puma) ─────────────────────────────────────────────────
DEFAULT_LOGO_URL   = "https://awpumahome.com/images/logos/text-logo-color.png"
DEFAULT_COLOR_H1   = "#153760"   # brand-navy
DEFAULT_COLOR_H2   = "#153760"   # brand-navy
DEFAULT_COLOR_H3   = "#DF6E16"   # brand-orange
DEFAULT_COLOR_H4   = "#1A1A2E"   # near-black

CSS = """
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Georgia', serif;
    font-size: 11pt;
    line-height: 1.65;
    color: #1a1a1a;
    background: #ffffff;
    max-width: 780px;
    margin: 0 auto;
    padding: 40px 48px 60px;
  }
  /* Logo header */
  .doc-header {
    text-align: left;
    padding-bottom: 24px;
    margin-bottom: 28px;
    border-bottom: 3px solid {COLOR_H1};
  }
  .doc-header img {
    max-height: 72px;
    max-width: 320px;
  }
  /* Headings */
  h1 {
    font-family: 'Arial', sans-serif;
    font-size: 22pt;
    font-weight: 700;
    color: {COLOR_H1};
    margin: 32px 0 10px;
    line-height: 1.2;
  }
  h2 {
    font-family: 'Arial', sans-serif;
    font-size: 16pt;
    font-weight: 700;
    color: {COLOR_H2};
    margin: 36px 0 8px;
    padding-bottom: 6px;
    border-bottom: 2px solid {COLOR_H2};
  }
  h3 {
    font-family: 'Arial', sans-serif;
    font-size: 12pt;
    font-weight: 700;
    color: {COLOR_H3};
    margin: 24px 0 6px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  h4 {
    font-family: 'Arial', sans-serif;
    font-size: 11pt;
    font-weight: 700;
    color: {COLOR_H4};
    margin: 16px 0 4px;
  }
  /* Body text */
  p {
    margin: 0 0 10px;
    font-size: 11pt;
  }
  /* Lists */
  ul, ol {
    margin: 6px 0 12px 24px;
    padding: 0;
  }
  li {
    margin-bottom: 5px;
    font-size: 11pt;
  }
  /* Blockquote */
  blockquote {
    margin: 12px 0 12px 0;
    padding: 10px 16px 10px 18px;
    border-left: 4px solid {COLOR_H3};
    background: #fef9f4;
    font-style: italic;
    color: #333;
    border-radius: 0 4px 4px 0;
  }
  blockquote p { margin: 0; }
  /* Inline code */
  code {
    font-family: 'Courier New', monospace;
    font-size: 9.5pt;
    background: #f1f5f9;
    padding: 1px 5px;
    border-radius: 3px;
  }
  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 20px;
    font-size: 10.5pt;
  }
  th {
    background-color: {COLOR_H1};
    color: #ffffff;
    font-weight: 700;
    padding: 9px 12px;
    text-align: left;
    font-family: 'Arial', sans-serif;
    font-size: 10pt;
  }
  td {
    padding: 8px 12px;
    border: 1px solid #dde3ea;
    vertical-align: top;
  }
  tr:nth-child(even) td { background-color: #f7fafd; }
  /* HR */
  hr {
    border: none;
    border-top: 1px solid #dde3ea;
    margin: 20px 0;
  }
  /* Bold / em */
  strong { font-weight: 700; }
  em { font-style: italic; }
  /* Checkbox list */
  .checkbox-item { list-style: none; margin-left: 0; }
  /* Profile section wrapper */
  .profile-block {
    margin-top: 40px;
    padding-top: 8px;
  }
"""

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{TITLE}</title>
<style>
{CSS}
</style>
</head>
<body>

<div class="doc-header">
  <img src="{LOGO_URL}" alt="{CLIENT_NAME} Logo">
</div>

{BODY}

</body>
</html>"""


def escape_html(text):
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def inline_format(text):
    """Convert markdown inline formatting to HTML."""
    # Bold
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    # Italic
    text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
    # Code
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    # Links
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    return text


def parse_table(lines, start):
    """Parse markdown table, return (html_string, next_index)."""
    table_lines = []
    i = start
    while i < len(lines) and lines[i].strip().startswith('|'):
        table_lines.append(lines[i].strip())
        i += 1

    if len(table_lines) < 2:
        return '', i

    headers = [c.strip() for c in table_lines[0].split('|') if c.strip()]
    rows = []
    for row_line in table_lines[2:]:
        cells = [c.strip() for c in row_line.split('|') if c.strip()]
        if cells:
            rows.append(cells)

    html = ['<table>']
    html.append('<thead><tr>')
    for h in headers:
        html.append(f'<th>{inline_format(escape_html(h))}</th>')
    html.append('</tr></thead>')
    html.append('<tbody>')
    for row in rows:
        html.append('<tr>')
        for j, h in enumerate(headers):
            cell = row[j] if j < len(row) else ''
            html.append(f'<td>{inline_format(escape_html(cell))}</td>')
        html.append('</tr>')
    html.append('</tbody></table>')
    return '\n'.join(html), i


def convert(md_path, html_path, logo_url, client_name,
            color_h1, color_h2, color_h3, color_h4):

    with open(md_path, 'r', encoding='utf-8') as f:
        raw_lines = f.readlines()

    lines = [l.rstrip('\n') for l in raw_lines]
    body_parts = []
    i = 0
    blockquote_buf = []

    def flush_blockquote():
        nonlocal blockquote_buf
        if blockquote_buf:
            text = ' '.join(blockquote_buf).strip()
            body_parts.append(f'<blockquote><p>{inline_format(escape_html(text))}</p></blockquote>')
            blockquote_buf = []

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Blockquote
        if stripped.startswith('> '):
            blockquote_buf.append(stripped[2:])
            i += 1
            continue
        else:
            flush_blockquote()

        # HR
        if re.match(r'^[-*_]{3,}$', stripped):
            body_parts.append('<hr>')
            i += 1
            continue

        # Headings
        m = re.match(r'^(#{1,4})\s+(.+)', stripped)
        if m:
            level = len(m.group(1))
            text = inline_format(escape_html(m.group(2)))
            body_parts.append(f'<h{level}>{text}</h{level}>')
            i += 1
            continue

        # Table
        if stripped.startswith('|'):
            table_html, i = parse_table(lines, i)
            body_parts.append(table_html)
            continue

        # Checkbox
        m = re.match(r'^- \[([ x])\] (.+)', stripped)
        if m:
            checked = '☑' if m.group(1) == 'x' else '☐'
            content = inline_format(escape_html(m.group(2)))
            body_parts.append(f'<ul style="list-style:none;margin-left:0"><li>{checked} {content}</li></ul>')
            i += 1
            continue

        # Bullet list — collect consecutive bullets
        if re.match(r'^[-*]\s+', stripped):
            items = []
            while i < len(lines):
                s = lines[i].strip()
                m2 = re.match(r'^[-*]\s+(.+)', s)
                if m2:
                    items.append(f'<li>{inline_format(escape_html(m2.group(1)))}</li>')
                    i += 1
                else:
                    break
            body_parts.append('<ul>' + ''.join(items) + '</ul>')
            continue

        # Numbered list — collect consecutive
        if re.match(r'^\d+\.\s+', stripped):
            items = []
            while i < len(lines):
                s = lines[i].strip()
                m2 = re.match(r'^\d+\.\s+(.+)', s)
                if m2:
                    items.append(f'<li>{inline_format(escape_html(m2.group(1)))}</li>')
                    i += 1
                else:
                    break
            body_parts.append('<ol>' + ''.join(items) + '</ol>')
            continue

        # Empty line
        if not stripped:
            i += 1
            continue

        # Normal paragraph
        body_parts.append(f'<p>{inline_format(escape_html(stripped))}</p>')
        i += 1

    flush_blockquote()

    body_html = '\n'.join(body_parts)

    # Apply brand colors to CSS template
    css = CSS\
        .replace('{COLOR_H1}', color_h1)\
        .replace('{COLOR_H2}', color_h2)\
        .replace('{COLOR_H3}', color_h3)\
        .replace('{COLOR_H4}', color_h4)

    # Derive title from first H1 in doc
    first_h1 = next((l.strip().lstrip('#').strip() for l in lines if l.startswith('# ')), client_name)

    html = HTML_TEMPLATE\
        .replace('{TITLE}', escape_html(first_h1))\
        .replace('{CSS}', css)\
        .replace('{LOGO_URL}', logo_url)\
        .replace('{CLIENT_NAME}', escape_html(client_name))\
        .replace('{BODY}', body_html)

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"Saved: {html_path}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('input')
    parser.add_argument('output')
    parser.add_argument('--logo-url', default=DEFAULT_LOGO_URL)
    parser.add_argument('--client-name', default='Client')
    parser.add_argument('--color-h1', default=DEFAULT_COLOR_H1)
    parser.add_argument('--color-h2', default=DEFAULT_COLOR_H2)
    parser.add_argument('--color-h3', default=DEFAULT_COLOR_H3)
    parser.add_argument('--color-h4', default=DEFAULT_COLOR_H4)
    args = parser.parse_args()

    convert(
        args.input,
        args.output,
        logo_url=args.logo_url,
        client_name=args.client_name,
        color_h1=args.color_h1,
        color_h2=args.color_h2,
        color_h3=args.color_h3,
        color_h4=args.color_h4,
    )
