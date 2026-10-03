# Project previews

The `photogress-*.webp` images are Android screenshots from the application's
local store-assets/screenshots/v9/raw English and Vietnamese galleries.
Home and previous-photo camera previews are resized to 540 × 1212 and encoded
as WebP. The app card composes two phone frames in CSS and links to the public
Google Play listing for `com.greenhillstudio.photogress`, verified on 2026-10-03.

The `vmerdi-*.webp` and `bantaynho-*.webp` images are real homepage
screenshots captured on 2026-09-05 from:

- https://vmerdi.edu.vn/
- https://quytuthienbantaynho.edu.vn/

Desktop images are cropped from the top to 1280 × 720. Mobile images are
361 × 780, with the browser scrollbar excluded. Images are stored locally,
encoded as WebP, and lazy-loaded; no live iframe or remote image is needed.

`ProjectCard.astro` and the `.project-showcase` styles compose the browser
and phone frames. To refresh the previews, replace these four captures
while keeping their dimensions and filenames.
