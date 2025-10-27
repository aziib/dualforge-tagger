// Enumerations describing the upload mode and tag style.  These
// values mirror the enums defined in the original TypeScript
// implementation.  Using plain objects avoids the need for a
// TypeScript compiler while still making the values easy to import.

export const UploadMode = {
  Single: 'single',
  Batch: 'batch',
};

export const TagStyle = {
  Flux: 'flux',
  Illustrious: 'illustrious',
};

// JSZip is loaded globally via a `<script>` tag in index.html.  We
// intentionally do not import it here to avoid bundling issues.  To
// make TypeScript consumers happy, you would declare it on the
// window, but for plain JS it is sufficient that JSZip exists in
// the global scope at runtime.