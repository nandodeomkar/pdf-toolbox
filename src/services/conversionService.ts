import { PDFDocument, PageSizes } from 'pdf-lib';

export type PageSizeFormat = 'A4' | 'Letter' | 'Fit';
export type PageOrientation = 'portrait' | 'landscape';

export interface ConversionOptions {
  pageSize: PageSizeFormat;
  orientation: PageOrientation;
  margin: number;
}

export const convertImagesToPdf = async (files: File[], options: ConversionOptions): Promise<Uint8Array> => {
  const pdf = await PDFDocument.create();

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    
    let image;
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      image = await pdf.embedJpg(arrayBuffer);
    } else if (file.type === 'image/png') {
      image = await pdf.embedPng(arrayBuffer);
    } else {
      throw new Error(`Unsupported image type: ${file.type}`);
    }

    const { width: imgWidth, height: imgHeight } = image.scale(1);

    let pageW = 0;
    let pageH = 0;

    if (options.pageSize === 'Fit') {
      pageW = imgWidth + options.margin * 2;
      pageH = imgHeight + options.margin * 2;
    } else {
      const standardSize = options.pageSize === 'A4' ? PageSizes.A4 : PageSizes.Letter;
      pageW = options.orientation === 'portrait' ? standardSize[0] : standardSize[1];
      pageH = options.orientation === 'portrait' ? standardSize[1] : standardSize[0];
    }

    const page = pdf.addPage([pageW, pageH]);

    // Calculate dimensions to fit within margin
    const availWidth = pageW - options.margin * 2;
    const availHeight = pageH - options.margin * 2;

    const scale = Math.min(availWidth / imgWidth, availHeight / imgHeight);
    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    // Center image
    const x = options.margin + (availWidth - drawWidth) / 2;
    const y = options.margin + (availHeight - drawHeight) / 2;

    page.drawImage(image, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  return pdf.save();
};
