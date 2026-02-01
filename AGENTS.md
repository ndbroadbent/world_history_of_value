# AGENTS

## Image generation
- Use the project venv: `source .venv/bin/activate`
- Run: `python3 generate_image.py`
- Originals are saved to `generated-images/`, then converted and resized to JPEGs in `public/images/`.
- The script reads `GOOGLE_API_KEY` from the environment (see `.env.example`).

## Notes
- The script depends on the `google.genai` package and a configured API key.
