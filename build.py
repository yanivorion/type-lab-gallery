"""Build the local gallery or an isolated Pages artifact. Standard library only."""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import shutil
from urllib.parse import quote, unquote

HERE = Path(__file__).resolve().parent
ROOT = HERE if (HERE / 'assets').is_dir() else HERE.parent.parent
RASTER = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'}


def collect():
    manifest = json.loads((HERE / 'archive.json').read_text())
    items = manifest['items']
    known_hashes = {hashlib.sha256((HERE / unquote(i['image'])).read_bytes()).hexdigest() for i in items}
    for path in sorted((HERE / 'incoming').rglob('*')):
        if not path.is_file() or path.suffix.lower() not in RASTER:
            continue
        meta_path = path.with_suffix(path.suffix + '.json')
        meta = json.loads(meta_path.read_text()) if meta_path.exists() else {}
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        if digest in known_hashes:
            continue
        known_hashes.add(digest)
        items.append({
            'id': 'import-' + hashlib.sha256(str(path.relative_to(HERE)).encode()).hexdigest()[:16],
            'title': meta.get('title', path.stem.replace('-', ' ')),
            'category': meta.get('category', 'New image generations'),
            'status': meta.get('status', 'Unreviewed image study / not a font'),
            'description': meta.get('description', 'Imported generation; design approval and glyph coverage have not been verified.'),
            'origin': meta.get('source', 'Manual import'),
            'image': path.relative_to(HERE).as_posix(),
            'original': path.relative_to(HERE).as_posix(),
            'sha256': digest,
        })
    for item in items:
        for key in ('image', 'original'):
            path = (HERE / unquote(item[key])).resolve()
            if not path.is_relative_to(ROOT) or not path.is_file():
                raise ValueError(f'Missing or outside-repository asset: {item[key]}')
    manifest.update(count=len(items), counts=dict(Counter(i['category'] for i in items)))
    return manifest


def build(destination=None):
    manifest = collect()
    target = Path(destination).resolve() if destination else HERE
    target.mkdir(parents=True, exist_ok=True)
    if destination:
        assets = target / 'assets'
        assets.mkdir(exist_ok=True)
        for item in manifest['items']:
            for key in ('image', 'original'):
                source = (HERE / unquote(item[key])).resolve()
                name = hashlib.sha256(source.read_bytes()).hexdigest() + source.suffix.lower()
                dest = assets / name
                if not dest.exists():
                    shutil.copyfile(source, dest)
                item[key] = 'assets/' + name
        for filename in ('prompt-lab.css', 'prompt-lab.js', 'import-help.html'):
            shutil.copyfile(HERE / filename, target / filename)
        if (HERE / 'live' / 'index.html').is_file():
            shutil.copytree(HERE / 'live', target / 'live', dirs_exist_ok=True)
        (target / '.nojekyll').touch()
    else:
        for item in manifest['items']:
            for key in ('image', 'original'):
                item[key] = quote(unquote(item[key]), safe='/.-_')
    data = json.dumps(manifest, ensure_ascii=False).replace('<', '\\u003c')
    live_url = ('live/' if (HERE / 'live' / 'index.html').is_file() else
                '../026-control-python-test/full-latin.html' if
                (ROOT / 'experiments/026-control-python-test/full-latin.html').is_file() else None)
    live_link = f'<p><a href="{live_url}">Type in nine full variable fonts ↗</a></p>' if live_url else ''
    page = (HERE / 'template.html').read_text().replace('__DATA__', data).replace('__LIVE_FONT_LINK__', live_link)
    (target / 'index.html').write_text(page)
    (target / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    print(f'Built {manifest["count"]} outputs in {target}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', help='Build a standalone, publishable gallery directory')
    build(parser.parse_args().output)
