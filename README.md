# Type Lab Gallery

Public typography generation gallery. Design sources and working project remain in a separate private repository.

Upload exported PNG/JPG/WebP/GIF/AVIF images to `incoming/` and commit to main. GitHub Actions automatically indexes them and deploys the gallery. Images are public. New uploads default to unreviewed image studies, not approved fonts.

Optional `image.png.json` metadata: title, source, description, category, status. Do not upload private prompts or reference material here.

`archive.json` records existing outputs. `build.py` generates the site from the archive and incoming images. Edit `template.html` rather than generated `index.html`. The prompt mixer is a manual prompt tool, not a generation service.
