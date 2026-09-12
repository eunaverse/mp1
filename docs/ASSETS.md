# Media sources

These files are stored in `src/assets/` so the site does not depend on external media requests at runtime. All three photographs are real nature photography. The section titles describe their subjects; they do not claim that the site owner visited these places.

## Photographs

Each linked photo page explicitly identifies the image as free under the [Unsplash License](https://unsplash.com/license), which permits downloading, copying, modifying, distributing, and using the photos for commercial and noncommercial purposes. These files use Unsplash's JPEG renditions, resized by its image service without changing their aspect ratios. Credit is included even though the license does not require attribution.

| Local file | Photographer | Original photo and license evidence | Downloaded rendition |
| --- | --- | --- | --- |
| `mountains.jpg` | Lisha Riabinina (@weekendtripcreator) | [A view of a mountain range with a lake in the foreground](https://unsplash.com/photos/a-view-of-a-mountain-range-with-a-lake-in-the-foreground-ok1KivJHzB4), Lake Como, Italy; Unsplash License | [JPEG, 1920 × 1280, 198,056 bytes](https://images.unsplash.com/photo-1719888471663-5fb90793af11?auto=format&fit=max&fm=jpg&q=75&w=1920) |
| `coast.jpg` | Kellen Riggin (@kalaniparker) | [Rocky coastline with ocean waves and green foliage](https://unsplash.com/photos/rocky-coastline-with-ocean-waves-and-green-foliage-yXNOqgvbTEc); Unsplash License | [JPEG, 1440 × 960, 212,749 bytes](https://images.unsplash.com/photo-1774550419023-b7970cba9d65?auto=format&fit=max&fm=jpg&q=75&w=1440) |
| `forest.jpg` | Luke Stackpoole | [The sun shines through the trees in a forest](https://unsplash.com/photos/the-sun-shines-through-the-trees-in-a-forest-ke50GMONqqo/), Surrey, United Kingdom; Unsplash License | [JPEG, 1000 × 1250, 332,340 bytes](https://images.unsplash.com/photo-1525856484235-977149196c5b?auto=format&fit=max&fm=jpg&q=75&w=1000) |

The forest source has portrait orientation. A landscape display can crop it through the site's `object-fit` or background sizing while retaining the original local photo.

These smaller renditions were downloaded directly from the same Unsplash image sources with quality set to 75. No local raster editing was applied. Their combined size is 743,145 bytes.

## Video

- **Local file:** `flower.mp4`
- **Content:** short close-up nature video of flowers.
- **Source/distributor:** MDN Web Docs contributors. An individual original filmmaker is not identified in the source repository; no individual creator is assumed.
- **Downloaded URL:** [MDN flower.mp4](https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4).
- **Primary source:** [MDN interactive-examples CC0 video directory](https://github.com/mdn/interactive-examples/tree/main/live-examples/media/cc0-videos).
- **License:** [CC0 1.0 Universal, as provided by the source repository](https://github.com/mdn/interactive-examples/blob/main/LICENSE).
- **Local modification:** removed the original audio track and moved MP4 metadata to the beginning for progressive playback; the H.264 video stream was copied without re-encoding.
- **Verified local format:** H.264, 960 × 540, approximately 5.005 seconds, no audio track. FFmpeg decoded the complete local file successfully.

## Video poster

- **Local file:** `flower-poster.jpg`, 960 × 540, 38,399 bytes.
- **Source and license:** a frame from the MDN CC0 `flower.mp4` described above; the same source attribution and CC0 terms apply.
- **Creation:** extracted the frame at one second with FFmpeg, without compositing or generated imagery: `ffmpeg -ss 1 -i src/assets/flower.mp4 -frames:v 1 -q:v 3 src/assets/flower-poster.jpg`.
- **Purpose:** show the actual flowers before the browser loads or plays the video.
- **Preservation check:** the existing local MP4 remained unchanged during poster extraction and photo optimization. Its SHA-256 is `5be3b62df38cf3816bbf4aab756e48a4375487633d140e3ef438962a9cdcad22`.

Sources and downloaded media were checked on September 11, 2026 (America/Chicago).
