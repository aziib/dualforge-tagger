# DualForge‑Tagger  
**Offline image tagging with dual AI styles: Flux and Illustrious.**

DualForge‑Tagger is a browser‑based AI tagging tool that runs completely offline using Chrome’s built-in Prompt API powered by Gemini Nano. Upload a single image or a ZIP of multiple images to generate two types of tags:

- **Flux** — natural language, poetic-style descriptions  
- **Illustrious** — structured LoRA-style comma-separated tags (e.g. `1girl, black hair, hoodie, cityscape`)  

Perfect for artists, LoRA creators, dataset builders, and AI trainers.

---

## ✨ Features

- 🖼️ **Single image mode**: View & copy tags directly.
- 📦 **Batch mode (ZIP)**: Upload multiple images and get a ZIP with matching `.txt` tag files.
- 🔐 **Fully offline**: No cloud, no API keys, no data leaves your browser.
- ⚙️ Powered by Chrome’s **Prompt API** running **on-device** with Gemini Nano.

---

## 🚀 Getting Started

### Requirements
- Chrome browser with built-in AI support (Prompt API + Gemini Nano enabled).
- No server, no dependencies — runs directly in browser.

### How to Use
1. Open `index.html` in Chrome.
2. Upload an image or a ZIP file of images.
3. Tags are generated locally and displayed (or exported as a new ZIP).
4. Copy results or download your dataset-ready package.

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
- [ ] Drag-and-drop UI
- [ ] Multilingual tag output (Japanese / Indonesian)
- [ ] Tag editing before export
- [ ] Integration with AI training toolkits

---

## 🧠 Prompt Instruction (used in the app)

```
You are an AI image captioning assistant. For each image, return:

### Flux:
A short natural language caption describing the image emotionally or poetically.

### Illustrious:
A comma-separated list of visual tags for AI training, such as: 
1girl, brown hair, long hair, hoodie, smile, outdoors, anime style
```

---

## 👤 Author

Made by [Romario Martinus (megaaziib)](https://github.com/aziib)  
Freelance illustrator & AI model developer | Specializing in LoRAs, anime art, and toolmaking

---

## 📜 License

MIT License — free for personal and commercial use.

---
