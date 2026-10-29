/**
 * A File object cannot travel through a URL. The dashboard composer stores the picked video here
 * and the Publish page takes it when it opens (client side navigation keeps module state).
 */
let pending: File | null = null;

export function setPendingVideo(file: File): void {
  pending = file;
}

export function takePendingVideo(): File | null {
  const file = pending;
  pending = null;
  return file;
}
