# Web Page Reader

Convert any web page, PDF, Word or Excel file into **clean Markdown or plain text** that AI agents and LLMs can use.

- Removes menus, ads and clutter
- Handles JavaScript-heavy pages (real browser fallback)
- Reads PDF, DOCX and XLSX links too
- Respects robots.txt and blocks private network addresses
- **You only pay for pages that were read successfully**

## Input
- `urls` - list of links
- `format` - `markdown` (default) or `text`

## Output (one item per URL)
`url`, `final_url`, `title`, `description`, `language`, `content`, `ok`, `error`

## Pricing
Pay per event: one **page-read** per successfully read URL. Failed URLs are free.
