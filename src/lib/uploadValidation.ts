export const UPLOAD_RULES = {
  maxBytes: 5 * 1024 * 1024,
  maxLongEdge: 1024,
  minWidth: 400,
  minHeight: 600,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  jpegQuality: 0.82,
};

export interface UploadValidationResult {
  ok: boolean;
  error?: string;
  warnings?: string[];
}

export function validateUploadMimeAndSize(
  mimeType: string,
  sizeBytes: number
): UploadValidationResult {
  if (!UPLOAD_RULES.allowedMimeTypes.includes(mimeType as (typeof UPLOAD_RULES.allowedMimeTypes)[number])) {
    return { ok: false, error: 'Please upload a JPEG, PNG, or WebP image.' };
  }
  if (sizeBytes > UPLOAD_RULES.maxBytes) {
    return { ok: false, error: 'Image size exceeds 5MB limit.' };
  }
  return { ok: true };
}

export function validateImageDimensions(width: number, height: number): UploadValidationResult {
  if (width < UPLOAD_RULES.minWidth || height < UPLOAD_RULES.minHeight) {
    return {
      ok: false,
      error: `Image must be at least ${UPLOAD_RULES.minWidth}×${UPLOAD_RULES.minHeight}px.`,
    };
  }

  const warnings: string[] = [];
  if (width > height) {
    warnings.push('Portrait orientation works best for virtual try-on.');
  }
  return { ok: true, warnings };
}

export function computeResizeDimensions(
  width: number,
  height: number,
  maxLongEdge = UPLOAD_RULES.maxLongEdge
): { width: number; height: number } {
  const longEdge = Math.max(width, height);
  if (longEdge <= maxLongEdge) {
    return { width, height };
  }
  const scale = maxLongEdge / longEdge;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export async function loadImageElementFromFile(file: File): Promise<HTMLImageElement> {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not read image file.'));
      img.src = objectUrl;
    });
    return img;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function processPortraitUpload(file: File): Promise<{
  dataUrl: string;
  warnings: string[];
}> {
  const basic = validateUploadMimeAndSize(file.type, file.size);
  if (!basic.ok) {
    throw new Error(basic.error);
  }

  const img = await loadImageElementFromFile(file);
  const dimensionCheck = validateImageDimensions(img.naturalWidth, img.naturalHeight);
  if (!dimensionCheck.ok) {
    throw new Error(dimensionCheck.error);
  }

  const { width, height } = computeResizeDimensions(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not process image in this browser.');
  }
  ctx.drawImage(img, 0, 0, width, height);

  const dataUrl = canvas.toDataURL('image/jpeg', UPLOAD_RULES.jpegQuality);
  return {
    dataUrl,
    warnings: dimensionCheck.warnings || [],
  };
}

export const UPLOAD_REQUIREMENTS_COPY = [
  'JPEG, PNG, or WebP only',
  'Maximum file size: 5MB',
  'Minimum size: 400×600 pixels',
  'Portrait photo with full torso visible',
  'Plain background and good lighting recommended',
];
