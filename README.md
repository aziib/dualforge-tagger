# DualForge‑Tagger  
**Offline image tagging with dual AI styles: Flux and Illustrious.**

DualForge‑Tagger is a browser‑based AI tagging tool that runs completely offline using Chrome’s built‑in Prompt API powered by Gemini Nano. Upload a single image or a ZIP of multiple images to generate two types of tags:

- **Flux** — natural language, poetic‑style descriptions  
- **Illustrious** — structured LoRA‑style comma‑separated tags (e.g. `1girl, black hair, hoodie, cityscape`)  

Perfect for artists, LoRA creators, dataset builders, and AI trainers.

---

## ✨ Features

- 🖼️ **Single image mode**: View & copy tags directly.
- 📦 **Batch mode (ZIP)**: Upload multiple images and get a ZIP with matching `.txt` tag files.
- 🔐 **Fully offline**: No cloud, no API keys, no data leaves your browser.
- ⚙️ Powered by Chrome’s **Prompt API** running **on‑device** with Gemini Nano.

---

## 🚀 Getting Started

### Requirements
- Chrome browser with built‑in AI support (Prompt API + Gemini Nano enabled).
- No server, no dependencies — runs directly in browser.

### How to Use
1. Open `index.html` in Chrome.
2. Upload an image or a ZIP file of images.
3. Tags are generated locally and displayed (or exported as a new ZIP).
4. Copy results or download your dataset‑ready package.

---

## 🔧 Built With

- `Prompt API` — main AI engine (image input → text output)
- `JSZip` — for handling ZIP file extraction and export
- HTML + Vanilla JS + CSS (no frameworks needed)

---

## 📂 Folder Structure

```
dualforge-tagger/
├── index.html          # Main UI
├── app.js              # Upload, tagging logic, Prompt API calls
├── style.css           # Basic styling
├── /vendor
│   └── jszip.min.js    # ZIP library
```

---

## 💡 Example Output

For an uploaded image:

### Flux:
> “a girl in a red hoodie stares into the city lights, her hair swaying in the wind”

### Illustrious:
> `1girl, red hoodie, brown hair, streetlights, night, cityscape, anime style`

---

## 📦 Output Format (Batch Mode)

Uploaded:
```
input.zip
├── image001.png
├── image002.jpg
```

Downloaded:
```
tagged_images.zip
├── image001.png
├── image001.txt  ← contains tags
├── image002.jpg
├── image002.txt
```

---

## 🛠️ Roadmap

- [ ] Export CSV (filename + tags)
- [ ] Drag‑and‑drop UI
- [ ] Multilingual tag output (Japanese / Indonesian)
- [ ] Tag editing before export
- [ ] Integration with AI training toolkits

---

## For Web Developers (Using Gemini Nano via APIs)

Gemini Nano is exposed to developers through Chrome’s built‑in AI APIs (like the Prompt API, Summarizer API, Writer API, etc.) that enable on‑device AI capabilities for web applications and Chrome extensions.

To build and experiment with these on‑device models, the process generally involves:

- **Prerequisites:** Use a Chrome Dev or Canary build (version 127 or higher). Ensure your device meets the necessary hardware requirements (sufficient RAM, VRAM and storage).
- **Enable Flags:** In `chrome://flags` enable the following:
  - `#prompt-api-for-gemini-nano` → set to “Enabled”
  - `#optimization-guide-on-device-model` → set to “Enabled BypassPrefRequirement” (or a similar option)
- **Model Download:** Visit `chrome://components`, find *Optimization Guide On Device Model* and click **Check for Update**. This triggers the model download when your device is eligible.
- **Verification:** Open the developer console (press F12 or Option+⌘+J on Mac) and run `await ai.canCreateTextSession()`. A return value of `readily` confirms the model is ready.
- **Use the APIs:** Interact with Gemini Nano via JavaScript using the exposed APIs (e.g. `ai.createTextSession()` for the Prompt API). These APIs enable on‑device summarization, translation, proofreading and more, offering speed and privacy.

---

## 👤 Author

Made by [Romario Martinus (megaaziib)](https://github.com/aziib)  
Freelance illustrator & AI model developer | Specializing in LoRAs, anime art, and toolmaking

---

## 📜 License

MIT License — free for personal and commercial use.

---
