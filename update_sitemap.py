import re

with open('booking-platform/app/components/home/SeoCardsSection.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

links = []
def repl(match):
    links.append(match.group(1))
    return match.group(0)

re.sub(r'\"link\":\s*\"(.*?)\"', repl, content)

with open('booking-platform/app/sitemap.js', 'r', encoding='utf-8') as f:
    sitemap_content = f.read()

links_formatted = ',\n    '.join([f"'{link}'" for link in links])
target = "'/book-singer-for-wedding'"
new_static_routes = f"{target},\n    {links_formatted}"

sitemap_content = sitemap_content.replace(target, new_static_routes)

with open('booking-platform/app/sitemap.js', 'w', encoding='utf-8') as f:
    f.write(sitemap_content)

print('Updated sitemap.js with %d links' % len(links))
