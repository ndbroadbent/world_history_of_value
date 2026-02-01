from google import genai
from google.genai import types
import os
from pathlib import Path

from PIL import Image


def load_env(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value

load_env(Path(".env"))
api_key = os.environ.get("GOOGLE_API_KEY")
if not api_key:
    raise RuntimeError("Missing GOOGLE_API_KEY. Set it in your environment or .env file.")

client = genai.Client(api_key=api_key)

STYLE_SUFFIX = """

Style: Sepia-toned, fine ink linework with subtle watercolor washes, aged paper texture.

This is a standalone artwork, not a figure from a book. Do not include any text, captions, figure numbers, or labels."""

ORIGINAL_DIR = Path("generated-images")
OUTPUT_DIR = Path("public/images")
MAX_OUTPUT_WIDTH = 1400
JPEG_QUALITY = 85

IMAGES = {
    "first_stone_tools": """A hairy primitive hominid open palm holding a Lomekwian stone core, rendered as a Victorian scientific illustration.

The tool is a rough fist-sized rock with a few sharp flakes knocked off one edge. Just stone, no wood. Shown on cream-colored paper.""",

    "first_million": """A small group of early hominids gathered near a rocky outcrop, rendered as a Victorian scientific illustration.

They are knapping simple stone tools on the ground. No fire is present. The scene suggests open savanna and scattered stone flakes. Shown on cream-colored paper.""",

    "acheulean_handaxes": """A symmetrical Acheulean handaxe displayed in a hominid's hand, rendered as a Victorian scientific illustration.

The handaxe is teardrop-shaped with bifacial flaking and a sharp edge. The background suggests an early savanna landscape, faint and minimal. Shown on cream-colored paper.""",

    "last_glacial_maximum": """A small band of ice age humans huddled around a fire in a snow-covered landscape, rendered as a Victorian scientific illustration.

Woolly mammoths visible in the distance. The humans wear fur clothing and hold primitive spears. Shown on cream-colored paper.""",

    "neolithic_age": """A Neolithic village with small mud-brick houses, fields, and domesticated animals, rendered as a Victorian scientific illustration.

People harvest grain with stone sickles while goats graze nearby. Shown on cream-colored paper.""",

    "bronze_age": """Bronze Age metalworking scene, rendered as a Victorian scientific illustration.

A smith pours glowing bronze into a stone mold, with simple tools and a small furnace nearby. Shown on cream-colored paper.""",

    "iron_age": """Iron Age forge with a blacksmith hammering a red-hot iron blade, rendered as a Victorian scientific illustration.

An anvil, tongs, and charcoal fire are visible. Shown on cream-colored paper.""",

    "controlled_fire": """Early humans tending a controlled fire deep inside a cave, rendered as a Victorian scientific illustration.

Glowing embers illuminate cave walls with soot marks and faint animal bones on the ground. A few figures crouch around the flames. Shown on cream-colored paper.""",

    "out_of_africa": """A small band of early humans walking along a coastal plain, rendered as a Victorian scientific illustration.

They carry simple stone tools and bundles. The shoreline and distant hills suggest a migration route. No boats, no fire. Shown on cream-colored paper.""",

    "mid_pleistocene_bottleneck": """A tiny band of early humans in a harsh, windswept landscape, rendered as a Victorian scientific illustration.

Sparse trees and rocky ground suggest a cold, arid climate. The group is small, huddled near a shallow cave for shelter. Shown on cream-colored paper.""",

    "great_pyramid": """The Great Pyramid of Giza under construction, rendered as a Victorian scientific illustration.

Workers pulling limestone blocks up ramps, with the partially completed pyramid rising against the desert sky. Shown on cream-colored paper.""",

    "invention_of_coinage": """An ancient Lydian electrum coin (stater) shown in detail, rendered as a Victorian scientific illustration.

The coin displays a lion's head design. A merchant's hand weighs it on a small balance scale. Shown on cream-colored paper.""",

    "peak_roman_empire": """A Roman legionary eagle standard (aquila) held aloft, with the Colosseum in the background, rendered as a Victorian scientific illustration.

The golden eagle gleams atop its pole. Roman architecture stretches behind. Shown on cream-colored paper.""",

    "mansa_musa": """Mansa Musa on his hajj pilgrimage, seated on a camel, holding a large gold nugget, rendered as a Victorian scientific illustration.

He wears elaborate robes and a golden crown. Camels laden with gold follow behind. Shown on cream-colored paper.""",

    "first_corporation": """A Dutch East India Company merchant ship (fluyt) in Amsterdam harbor, rendered as a Victorian scientific illustration.

The VOC logo visible on cargo being loaded. Merchants inspect spices on the dock. Shown on cream-colored paper.""",

    "first_oil_well": """The Drake Oil Well wooden derrick in Titusville Pennsylvania, rendered as a Victorian scientific illustration.

A simple wooden tower structure with crude oil flowing into barrels. Workers stand nearby. Shown on cream-colored paper.""",

    "rockefeller": """A vast landscape of oil derricks stretching to the horizon, rendered as a Victorian scientific illustration.

Black oil gushes from multiple wells. Railroad tank cars wait to transport the oil. Industrial smoke rises. Shown on cream-colored paper.""",

    "getty": """J. Paul Getty examining an ancient Greek statue in his private museum, rendered as a Victorian scientific illustration.

The oil magnate in a suit studies a classical marble sculpture. Shown on cream-colored paper.""",

    "web_commercial": """An early 1990s computer monitor displaying the Netscape browser, rendered as a Victorian scientific illustration.

The chunky beige CRT monitor shows a webpage loading. A dial-up modem sits beside it. Shown on cream-colored paper.""",

    "iphone": """The original 2007 iPhone held in a human hand, rendered as a Victorian scientific illustration.

The revolutionary device displays its home screen with app icons. Shown on cream-colored paper.""",

    "today": """A satellite view of Earth at night showing city lights across continents, rendered as a Victorian scientific illustration.

The glowing network of human civilization visible from space. Shown on cream-colored paper.""",
}


def generate_image(name, prompt):
    img_path = ORIGINAL_DIR / f"{name}.png"

    if img_path.exists():
        print(f"Skipping {name} - already exists")
        return

    print(f"Generating {name}...")

    full_prompt = prompt + STYLE_SUFFIX

    response = client.models.generate_images(
        model="imagen-4.0-generate-001",
        prompt=full_prompt,
        config=types.GenerateImagesConfig(
            number_of_images=1,
            aspect_ratio="4:3",
        ),
    )

    if response.generated_images:
        img = response.generated_images[0]
        ORIGINAL_DIR.mkdir(parents=True, exist_ok=True)
        img.image.save(img_path)
        print(f"  Saved to {img_path} ({img_path.stat().st_size} bytes)")
    else:
        print(f"  Failed to generate {name}")


def convert_images():
    ORIGINAL_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for img_path in ORIGINAL_DIR.glob("*.png"):
        output_path = OUTPUT_DIR / f"{img_path.stem}.jpg"
        with Image.open(img_path) as img:
            img = img.convert("RGB")
            if img.width > MAX_OUTPUT_WIDTH:
                ratio = MAX_OUTPUT_WIDTH / img.width
                new_size = (MAX_OUTPUT_WIDTH, int(img.height * ratio))
                img = img.resize(new_size, Image.LANCZOS)
            img.save(output_path, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        print(f"Converted {img_path.name} -> {output_path} ({output_path.stat().st_size} bytes)")


if __name__ == "__main__":
    for name, prompt in IMAGES.items():
        generate_image(name, prompt)
    convert_images()
