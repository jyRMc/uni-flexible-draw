from __future__ import annotations

import argparse
import hashlib
import mimetypes
import re
import sys
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from urllib.parse import parse_qsl, unquote, urlencode, urljoin, urlparse, urlunparse
from urllib.request import Request, urlopen

BASE_URL = 'https://scidraw.io/'
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT_DIR = PROJECT_ROOT / 'assets'
TIMEOUT = 20
MAX_PAGES = 500
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
}
TRACKING_QUERY_KEYS = {
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'spm',
    'from',
}
IMAGE_EXTENSIONS = {
    '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.ico', '.avif', '.tif', '.tiff',
}
CSS_URL_PATTERN = re.compile(r'url\(([^)]+)\)', re.IGNORECASE)
INVALID_FILENAME_CHARS = re.compile(r'[<>:"/\\|?*\x00-\x1f]')
CONTENT_TYPE_SUFFIX = {
    'image/svg+xml': '.svg',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/x-icon': '.ico',
}
IMAGE_CONTENT_TYPES = set(CONTENT_TYPE_SUFFIX)


class ResourceHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.image_links: set[str] = set()
        self.container_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = {key.lower(): (value or '').strip() for key, value in attrs}
        class_names = set(filter(None, attr_map.get('class', '').split()))

        if self.container_depth == 0:
            if tag == 'div' and 'grid-container-container' in class_names:
                self.container_depth = 1
            return

        self.container_depth += 1

        if tag == 'img' and 'drawing' in class_names:
            src = attr_map.get('src')
            if src:
                self.image_links.add(src)

    def handle_endtag(self, tag: str) -> None:
        if self.container_depth > 0:
            self.container_depth -= 1

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        if self.container_depth > 0:
            self.handle_endtag(tag)


class Crawler:
    def __init__(self, base_url: str, output_dir: Path, max_pages: int) -> None:
        self.base_url = self.normalize_url(base_url)
        self.base_host = urlparse(self.base_url).netloc.lower()
        self.output_dir = output_dir
        self.max_pages = max_pages
        self.seen_assets: set[str] = set()
        self.saved_files = 0
        self.failed_urls: list[str] = []

    def log(self, message: str) -> None:
        print(message, flush=True)

    def run(self) -> int:
        self.output_dir.mkdir(parents=True, exist_ok=True)

        pages_scanned = 0
        for page in range(1, self.max_pages + 1):
            page_url = self.build_page_url(page)
            self.log(f'[PAGE] {page_url}')
            asset_links = self.process_page(page_url)
            if not asset_links:
                self.log('无更多素材，结束抓取')
                break

            pages_scanned += 1
            self.log(f'[FOUND] 第 {page} 页 {len(asset_links)} 个素材')
            for asset_url in asset_links:
                if asset_url in self.seen_assets:
                    continue
                self.seen_assets.add(asset_url)
                self.download_asset(asset_url)

        self.log(f'页面抓取完成：{pages_scanned}')
        self.log(f'资源下载完成：{self.saved_files}')
        if self.failed_urls:
            self.log(f'失败数量：{len(self.failed_urls)}')
            for failed in self.failed_urls[:20]:
                self.log(f'  - {failed}')
            if len(self.failed_urls) > 20:
                self.log('  - ...')
            return 1
        return 0

    def process_page(self, page_url: str) -> list[str]:
        payload = self.fetch(page_url)
        if payload is None:
            self.failed_urls.append(page_url)
            return []

        body, content_type = payload
        if 'html' not in content_type:
            return []

        text = self.decode_body(body)
        parser = ResourceHTMLParser()
        parser.feed(text)

        links: set[str] = set()
        for raw_link in parser.image_links:
            absolute = self.normalize_url(urljoin(page_url, raw_link))
            if absolute and self.is_image_url(absolute):
                links.add(absolute)
        return sorted(links)

    def download_asset(self, asset_url: str) -> None:
        payload = self.fetch(asset_url)
        if payload is None:
            self.failed_urls.append(asset_url)
            return

        body, content_type = payload
        if not self.is_image_response(asset_url, content_type):
            self.log(f'[SKIP] {asset_url} ({content_type})')
            return
        file_path = self.build_file_path(asset_url, content_type)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_bytes(body)
        self.saved_files += 1
        self.log(f'[SAVE] {file_path.relative_to(self.output_dir.parent)}')

    def fetch(self, target_url: str) -> tuple[bytes, str] | None:
        try:
            req = Request(target_url, headers=HEADERS)
            with urlopen(req, timeout=TIMEOUT) as resp:
                body = resp.read()
                content_type = resp.headers.get_content_type().lower()
                return body, content_type
        except Exception as exc:
            self.log(f'[FAIL] {target_url} -> {exc}')
            return None

    def is_image_url(self, target_url: str) -> bool:
        parsed = urlparse(target_url)
        suffix = PurePosixPath(unquote(parsed.path)).suffix.lower()
        if suffix in IMAGE_EXTENSIONS:
            return True
        return False

    def build_page_url(self, page: int) -> str:
        separator = '&' if urlparse(self.base_url).query else '?'
        return f'{self.base_url}{separator}page={page}'

    def is_image_response(self, target_url: str, content_type: str) -> bool:
        if content_type in IMAGE_CONTENT_TYPES or content_type.startswith('image/'):
            return True
        return self.is_image_url(target_url)

    def normalize_url(self, raw_url: str) -> str:
        if not raw_url:
            return ''
        raw_url = raw_url.strip()
        if not raw_url or raw_url.startswith(('#', 'javascript:', 'mailto:', 'tel:', 'data:')):
            return ''
        parsed = urlparse(raw_url)
        if parsed.scheme and parsed.scheme not in {'http', 'https'}:
            return ''
        query_items = [
            (key, value)
            for key, value in parse_qsl(parsed.query, keep_blank_values=True)
            if key.lower() not in TRACKING_QUERY_KEYS
        ]
        normalized = parsed._replace(fragment='', query=urlencode(query_items, doseq=True))
        return urlunparse(normalized)

    def decode_body(self, body: bytes) -> str:
        for encoding in ('utf-8', 'utf-8-sig', 'gb18030', 'latin-1'):
            try:
                return body.decode(encoding)
            except UnicodeDecodeError:
                continue
        return body.decode('utf-8', errors='ignore')

    def build_file_path(self, asset_url: str, content_type: str) -> Path:
        parsed = urlparse(asset_url)
        host = self.sanitize_segment(parsed.netloc or self.base_host)
        pure_path = PurePosixPath(unquote(parsed.path or '/index'))
        parts = [self.sanitize_segment(part) for part in pure_path.parts if part not in {'/', ''}]
        if not parts or parsed.path.endswith('/'):
            parts.append('index')

        filename = parts[-1] or 'index'
        suffix = PurePosixPath(filename).suffix.lower()
        inferred_suffix = self.guess_suffix(content_type)
        if not suffix and inferred_suffix:
            filename = f'{filename}{inferred_suffix}'
            suffix = inferred_suffix

        if parsed.query:
            digest = hashlib.md5(parsed.query.encode('utf-8')).hexdigest()[:8]
            stem = filename[:-len(suffix)] if suffix else filename
            filename = f'{stem}__{digest}{suffix}' if suffix else f'{filename}__{digest}'

        parts[-1] = filename
        return self.output_dir.joinpath(host, *parts)

    def guess_suffix(self, content_type: str) -> str:
        if content_type in CONTENT_TYPE_SUFFIX:
            return CONTENT_TYPE_SUFFIX[content_type]
        guessed = mimetypes.guess_extension(content_type)
        return guessed or '.bin'

    def sanitize_segment(self, segment: str) -> str:
        cleaned = INVALID_FILENAME_CHARS.sub('_', segment.strip())
        return cleaned or 'file'


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument('--base-url', default=BASE_URL)
    parser.add_argument('--output', default=str(DEFAULT_OUTPUT_DIR))
    parser.add_argument('--max-pages', type=int, default=MAX_PAGES)
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    crawler = Crawler(
        base_url=args.base_url,
        output_dir=Path(args.output).resolve(),
        max_pages=max(1, args.max_pages),
    )
    return crawler.run()


if __name__ == '__main__':
    sys.exit(main())
