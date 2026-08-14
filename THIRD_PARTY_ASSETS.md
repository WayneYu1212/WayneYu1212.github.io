# Third-party space assets

All source assets below are used as factual space imagery or models and are credited to NASA. Usage follows the [NASA media usage guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/).

| Local asset | Source | Credit | Transformation |
| --- | --- | --- | --- |
| `public/media/models/explorer-1.glb` | [Explorer 1 GLB](https://assets.science.nasa.gov/content/dam/science/missions/explorer-1/3d/Explorer_1.glb), listed on the [NASA Explorer 1 page](https://science.nasa.gov/mission/explorer-1/about/) | NASA/JPL-Caltech | Runtime normalization to a 4.8-unit longest axis; material roughness/metalness restrained in code. |
| `public/media/celestial/apple-iapetus.webp` | [Saturn - Iapetus.jpg](https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/Images%20and%20Textures/Saturn%20-%20Iapetus/Saturn%20-%20Iapetus.jpg) | NASA 3D Resources | Fit to 2048×1024, RGB grade `(0.90, 0.96, 1.04)`, WebP quality 82. |
| `public/media/celestial/yongshu-callisto.webp` | [Jupiter - Callisto.jpg](https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/Images%20and%20Textures/Jupiter%20-%20Callisto/Jupiter%20-%20Callisto.jpg) | NASA 3D Resources | Fit to 2048×1024, RGB grade `(1.03, 0.92, 0.78)`, WebP quality 82. |
| `public/media/celestial/nearby-europa.webp` | [Jupiter - Europa.jpg](https://raw.githubusercontent.com/nasa/NASA-3D-Resources/master/Images%20and%20Textures/Jupiter%20-%20Europa/Jupiter%20-%20Europa.jpg) | NASA 3D Resources | Fit to 2048×1024, RGB grade `(0.96, 0.91, 1.08)`, WebP quality 82. |

The deterministic conversion is implemented in `scripts/prepare-space-assets.py`. The downloaded JPEG files live only under the ignored `tmp/` directory and are not shipped.
