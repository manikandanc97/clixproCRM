import { BrandingService } from './branding.service';
import sharp from 'sharp';

describe('BrandingService', () => {
  let service: BrandingService;

  beforeEach(() => {
    service = new BrandingService();
  });

  describe('validateImageBuffer', () => {
    it('should validate PNG magic bytes', async () => {
      const pngBuffer = await sharp({
        create: {
          width: 10,
          height: 10,
          channels: 4,
          background: { r: 255, g: 0, b: 0, alpha: 1 },
        },
      })
        .png()
        .toBuffer();

      const result = service.validateImageBuffer(pngBuffer, 'test.png');
      expect(result.format).toBe('png');
      expect(result.mimeType).toBe('image/png');
    });

    it('should validate JPEG magic bytes', async () => {
      const jpegBuffer = await sharp({
        create: {
          width: 10,
          height: 10,
          channels: 3,
          background: { r: 0, g: 255, b: 0 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = service.validateImageBuffer(jpegBuffer, 'test.jpg');
      expect(result.format).toBe('jpeg');
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('should validate WebP magic bytes', async () => {
      const webpBuffer = await sharp({
        create: {
          width: 10,
          height: 10,
          channels: 4,
          background: { r: 0, g: 0, b: 255, alpha: 1 },
        },
      })
        .webp()
        .toBuffer();

      const result = service.validateImageBuffer(webpBuffer, 'test.webp');
      expect(result.format).toBe('webp');
      expect(result.mimeType).toBe('image/webp');
    });

    it('should reject invalid / executable files', () => {
      const invalidBuffer = Buffer.from('MZ...This program cannot be run in DOS mode');
      expect(() => service.validateImageBuffer(invalidBuffer, 'malicious.exe')).toThrow();
    });
  });

  describe('optimizeToWebP', () => {
    it('should convert an image to WebP with dimensions constrained to 512x512', async () => {
      const inputBuffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 4,
          background: { r: 100, g: 150, b: 200, alpha: 0.8 },
        },
      })
        .png()
        .toBuffer();

      const webpBuffer = await service.optimizeToWebP(inputBuffer);
      const metadata = await sharp(webpBuffer).metadata();

      expect(metadata.format).toBe('webp');
      expect(metadata.width).toBeLessThanOrEqual(512);
      expect(metadata.height).toBeLessThanOrEqual(512);
      expect(metadata.hasAlpha).toBe(true);
    });
  });

  describe('extractDominantColor', () => {
    it('should extract dominant vibrant blue color while ignoring white background', async () => {
      // Create an image with 80% white background and a dominant 20% vibrant blue box
      const blueBox = await sharp({
        create: {
          width: 40,
          height: 40,
          channels: 4,
          background: { r: 37, g: 99, b: 235, alpha: 1 }, // #2563eb
        },
      })
        .png()
        .toBuffer();

      const compositeImage = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }, // pure white
        },
      })
        .composite([{ input: blueBox, top: 30, left: 30 }])
        .png()
        .toBuffer();

      const color = await service.extractDominantColor(compositeImage);
      expect(color.toLowerCase()).toMatch(/^#2[56]63eb$/);
    });

    it('should fallback to default #10b981 for pure black-and-white or transparent images', async () => {
      const transparentImage = await sharp({
        create: {
          width: 50,
          height: 50,
          channels: 4,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
      })
        .png()
        .toBuffer();

      const color = await service.extractDominantColor(transparentImage);
      expect(color.toLowerCase()).toBe('#10b981');
    });
  });
});
