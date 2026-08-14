"""Prepare credited NASA source maps for the portfolio's project worlds."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "tmp" / "space-assets"
OUTPUT_DIR = ROOT / "public" / "media" / "celestial"
APPLE_SOURCE_DIR = ROOT.parent / "苹果落下之前"
APPLE_OUTPUT_DIR = ROOT / "public" / "media"
ASSETS = {
    "iapetus.jpg": ("apple-iapetus.webp", (0.90, 0.96, 1.04)),
    "callisto.jpg": ("yongshu-callisto.webp", (1.03, 0.92, 0.78)),
    "europa.jpg": ("nearby-europa.webp", (0.96, 0.91, 1.08)),
}


def grade_channel(channel: Image.Image, factor: float) -> Image.Image:
    return channel.point(lambda value: min(255, round(value * factor)))


def prepare_space_assets() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for source_name, (output_name, grade) in ASSETS.items():
        source = SOURCE_DIR / source_name
        if not source.exists():
            raise FileNotFoundError(f"Missing NASA source texture: {source}")
        with Image.open(source) as image:
            fitted = ImageOps.fit(image.convert("RGB"), (2048, 1024), method=Image.Resampling.LANCZOS)
            channels = fitted.split()
            graded = Image.merge("RGB", tuple(grade_channel(channel, factor) for channel, factor in zip(channels, grade)))
            graded.save(OUTPUT_DIR / output_name, "WEBP", quality=82, method=6)


def add_edge_light(canvas: Image.Image, portrait: Image.Image, position: tuple[int, int]) -> None:
    alpha = portrait.getchannel("A")
    expanded = alpha.filter(ImageFilter.MaxFilter(13))
    edge = ImageChops.subtract(expanded, alpha).point(lambda value: round(value * 0.34))
    light = Image.new("RGBA", portrait.size, (133, 170, 196, 0))
    light.putalpha(edge)
    canvas.alpha_composite(light, position)


def ensure_cutout(source: Image.Image) -> Image.Image:
    if "A" in source.getbands():
        return source.convert("RGBA")
    rgb = source.convert("RGB")
    minimum = ImageChops.darker(ImageChops.darker(*rgb.split()[:2]), rgb.split()[2])
    white = minimum.point(lambda value: 255 if value > 238 else 0)
    ImageDraw.floodfill(white, (0, 0), 128, thresh=0)
    alpha = white.point(lambda value: 0 if value == 128 else 255).filter(ImageFilter.GaussianBlur(0.7))
    rgba = rgb.convert("RGBA")
    rgba.putalpha(alpha)
    return rgba


def prepare_apple_media() -> None:
    APPLE_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    hero_source = APPLE_SOURCE_DIR / "牛顿立绘.png"
    npc_sources = sorted((APPLE_SOURCE_DIR / "NPC立绘").glob("*-no-bg.png"))
    if not hero_source.exists() or not npc_sources:
        raise FileNotFoundError("Missing Apple portrait sources")

    print(hero_source.name)
    with Image.open(hero_source) as source:
        hero = source.convert("RGB")
        hero.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
        hero.save(APPLE_OUTPUT_DIR / "apple-young-newton.webp", "WEBP", quality=86, method=6)

    width, height = 3200, 1500
    canvas = Image.new("RGBA", (width, height), (18, 20, 26, 255))
    draw = ImageDraw.Draw(canvas, "RGBA")
    for y in range(height):
        amount = y / max(1, height - 1)
        draw.line((0, y, width, y), fill=(round(25 + 31 * amount), round(29 + 15 * amount), round(39 - 6 * amount), 255))
    vignette = Image.new("L", (800, 375), 0)
    vignette_draw = ImageDraw.Draw(vignette)
    for inset in range(180):
        alpha = round(255 * (inset / 180) ** 1.8)
        vignette_draw.rectangle((inset * 2, inset, 799 - inset * 2, 374 - inset), outline=alpha, width=4)
    vignette = vignette.resize((width, height), Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(42))
    shade = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    shade.putalpha(vignette.point(lambda value: round(value * 0.52)))
    canvas.alpha_composite(shade)

    preferred = [
        "1696年听证书记-no-bg.png", "1696年委员会委员-no-bg.png", "埃德蒙·贝尔，邻地土地所有者-no-bg.png",
        "亨利·斯托克斯，1666年格兰瑟姆学校校长-no-bg.png", "伍尔索普庄园管事-no-bg.png",
        "克拉克先生，1666年格兰瑟姆药剂师-no-bg.png", "凯瑟琳·斯托勒-no-bg.png", "奈德，13至14岁的旅店跑腿少年-no-bg.png", "尼古拉斯·默瑟-no-bg.png",
        "玛格丽特-no-bg.png", "1696年牛顿-no-bg.png", "威廉·查洛纳，1696年伪币高手与牛顿的对手-no-bg.png", "汉弗莱·巴宾顿-no-bg.png",
    ]
    by_name = {source.name: source for source in npc_sources}
    ordered = [by_name[name] for name in preferred if name in by_name]
    ordered.extend(source for source in npc_sources if source not in ordered)
    rows = [(ordered[:5], 880, 1340), (ordered[5:9], 1040, 1440), (ordered[9:], 1220, 1510)]

    # Paint tall foreground figures first. Shorter rows begin lower on the canvas,
    # so layering them afterwards reveals every head instead of covering it with a torso.
    for row_index, (row, target_height, baseline) in reversed(list(enumerate(rows))):
        if not row:
            continue
        centers = [round((index + 0.5) * width / len(row)) for index in range(len(row))]
        if row_index == 1:
            centers = [center + (-120 if index % 2 == 0 else 120) for index, center in enumerate(centers)]
        for center, source_path in zip(centers, row):
            print(source_path.name)
            with Image.open(source_path) as source:
                portrait = ensure_cutout(source)
                bbox = portrait.getchannel("A").getbbox()
                if bbox:
                    portrait = portrait.crop(bbox)
                scale = target_height / portrait.height
                portrait = portrait.resize((round(portrait.width * scale), target_height), Image.Resampling.LANCZOS)
                x = round(center - portrait.width / 2)
                y = min(baseline - portrait.height, round(height * 0.68 - portrait.height * 0.3))
                shadow_width = max(140, round(portrait.width * 0.7))
                draw.ellipse((center - shadow_width // 2, baseline - 45, center + shadow_width // 2, baseline + 32), fill=(0, 0, 0, 72))
                add_edge_light(canvas, portrait, (x, y))
                canvas.alpha_composite(portrait, (x, y))

    bottom_vignette = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    bottom_draw = ImageDraw.Draw(bottom_vignette, "RGBA")
    for y in range(1120, height):
        amount = (y - 1120) / (height - 1120)
        bottom_draw.line((0, y, width, y), fill=(18, 16, 17, round(236 * amount**1.25)))
    canvas.alpha_composite(bottom_vignette)

    canvas.convert("RGB").save(APPLE_OUTPUT_DIR / "apple-cast-ensemble.webp", "WEBP", quality=84, method=6)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--space-assets", action="store_true")
    parser.add_argument("--apple-media", action="store_true")
    args = parser.parse_args()
    if not args.space_assets and not args.apple_media:
        parser.error("pass --space-assets or --apple-media")
    if args.space_assets:
        prepare_space_assets()
    if args.apple_media:
        prepare_apple_media()


if __name__ == "__main__":
    main()
