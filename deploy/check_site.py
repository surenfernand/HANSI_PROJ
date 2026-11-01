"""Validate this static site and optionally test its running Docker container."""
import argparse
from html.parser import HTMLParser
from pathlib import Path
import re
import time
from urllib.parse import unquote, urlsplit, quote
from urllib.request import urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[1]
DESIGNS = ['01-coral-sky', '02-cobalt-peach', '03-rose-butter',
           '04-terracotta-sand', '05-navy-apricot']

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.refs = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.refs.extend(attrs[k] for k in ('href', 'src') if attrs.get(k))


def main():
    arg = argparse.ArgumentParser()
    arg.add_argument('--url')
    args = arg.parse_args()
    pages = [ROOT / 'index.html']
    for design in DESIGNS:
        for page in ('index', 'gallery', 'shop', 'commissions', 'about', 'contact'):
            pages.append(ROOT / design / (page + '.html'))
    errors, public = [], set(pages)
    for page in pages:
        if not page.is_file():
            errors.append(f'Missing page: {page.relative_to(ROOT)}')
            continue
        parser = Parser()
        parser.feed(page.read_text(encoding='utf-8'))
        for ref in parser.refs:
            part = urlsplit(ref)
            if part.scheme or part.netloc or not part.path:
                continue
            path = (ROOT / unquote(part.path).lstrip('/') if part.path.startswith('/')
                    else page.parent / unquote(part.path)).resolve()
            if path.is_dir():
                path = path / 'index.html'
            if not path.is_file():
                errors.append(f'{page.relative_to(ROOT)}: broken reference {ref}')
            else:
                public.add(path)
    for design in DESIGNS:
        folder = ROOT / design
        script = folder / 'assets/script.js'
        if script.exists():
            for ref in re.findall(r"image:\s*['\"]([^'\"]+)['\"]", script.read_text()):
                path = folder / ref
                if not path.is_file():
                    errors.append(f'Missing artwork: {path.relative_to(ROOT)}')
        for path in (folder / 'assets').rglob('*'):
            if path.is_file():
                public.add(path)
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'Validated {len(pages)} pages and their local references.')
    if args.url:
        base = args.url.rstrip('/')
        for attempt in range(30):
            try:
                with urlopen(base + '/healthz', timeout=2) as response:
                    assert response.read().strip() == b'ok'
                break
            except (URLError, TimeoutError):
                if attempt == 29:
                    raise
                time.sleep(0.5)
        for path in sorted(public):
            url = base + '/' + quote(path.relative_to(ROOT).as_posix(), safe='/')
            with urlopen(url, timeout=5) as response:
                if response.status != 200:
                    raise SystemExit(f'HTTP check failed: {url}')
        for ref in ('/.git/config', '/Dockerfile', '/deploy/nginx.conf',
                    '/.github/workflows/docker-publish.yml', '/.env'):
            try:
                with urlopen(base + ref, timeout=5):
                    raise SystemExit(f'Private file is publicly accessible: {ref}')
            except HTTPError as error:
                if error.code not in (403, 404):
                    raise
        print(f'HTTP checks passed for {len(public)} files; deployment files are not served.')

if __name__ == '__main__':
    main()
