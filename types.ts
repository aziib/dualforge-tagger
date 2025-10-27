
export enum UploadMode {
  Single = 'single',
  Batch = 'batch',
}

export enum TagStyle {
  Flux = 'flux',
  Illustrious = 'illustrious',
}

declare global {
  const JSZip: any;
}
