/**
 * Compresses an image File using HTML5 Canvas.
 * Downscales image to fit within maxWidth / maxHeight keeping aspect ratio,
 * and encodes to JPEG format at specified quality.
 */
export async function compressPhoto(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.7
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas image compression failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts EXIF DateTime from JPEG file if present (e.g. tag 0x9003 or 0x0132),
 * or falls back to file.lastModified timestamp.
 */
export async function extractExifTimestamp(file: File): Promise<number | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const dataView = new DataView(arrayBuffer);

    // Check for JPEG SOI marker (0xFFD8)
    if (dataView.getUint16(0) === 0xffd8) {
      let offset = 2;
      const length = dataView.byteLength;

      while (offset < length) {
        const marker = dataView.getUint16(offset);
        offset += 2;

        if (marker === 0xffe1) {
          // APP1 (EXIF) marker
          offset += 2;

          // Check for "Exif\0\0" header
          if (
            dataView.getUint32(offset) === 0x45786966 &&
            dataView.getUint16(offset + 4) === 0x0000
          ) {
            const exifOffset = offset + 6;
            const littleEndian = dataView.getUint16(exifOffset) === 0x4949;

            const getUint16 = (o: number) => dataView.getUint16(exifOffset + o, littleEndian);
            const getUint32 = (o: number) => dataView.getUint32(exifOffset + o, littleEndian);

            const firstIfdOffset = getUint32(4);
            if (firstIfdOffset) {
              const numEntries = getUint16(firstIfdOffset);
              for (let i = 0; i < numEntries; i++) {
                const entryOffset = firstIfdOffset + 2 + i * 12;
                const tag = getUint16(entryOffset);

                // Tag 0x0132 (DateTime) or 0x9003 (DateTimeOriginal)
                if (tag === 0x0132 || tag === 0x9003) {
                  const valOffset = getUint32(entryOffset + 8);
                  let str = '';
                  for (let j = 0; j < 19; j++) {
                    const charCode = dataView.getUint8(exifOffset + valOffset + j);
                    if (charCode === 0) break;
                    str += String.fromCharCode(charCode);
                  }

                  // EXIF Date format: "YYYY:MM:DD HH:MM:SS"
                  const match = str.match(/^(\d{4}):(\d{2}):(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/);
                  if (match) {
                    const [, year, month, day, hour, min, sec] = match;
                    const date = new Date(
                      Date.UTC(
                        Number(year),
                        Number(month) - 1,
                        Number(day),
                        Number(hour),
                        Number(min),
                        Number(sec)
                      )
                    );
                    if (!isNaN(date.getTime())) {
                      return date.getTime();
                    }
                  }
                }
              }
            }
          }
          break;
        } else if ((marker & 0xff00) !== 0xff00) {
          break;
        } else {
          const blockLength = dataView.getUint16(offset);
          offset += blockLength;
        }
      }
    }
  } catch (err) {
    console.warn('Could not parse EXIF DateTime, falling back to file.lastModified:', err);
  }

  return file.lastModified || Date.now();
}

/**
 * Converts a Blob object to Base64 Data URL.
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to Data URL'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(blob);
  });
}
