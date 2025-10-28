
import { Injectable } from '@angular/core';

// Let TypeScript know that the GIF library is loaded globally from the CDN
declare var GIF: any;

export interface GifOptions {
  colors: string[];
  width: number;
  height: number;
  delay: number;
}

@Injectable({
  providedIn: 'root',
})
export class GifGeneratorService {
  generate(options: GifOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      if (options.colors.length === 0 || options.width <= 0 || options.height <= 0) {
        return reject(new Error('Invalid GIF options provided.'));
      }
      
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: options.width,
        height: options.height,
      });

      // Create a canvas for each color and add it as a frame
      for (const color of options.colors) {
        const canvas = this.createFrame(color, options.width, options.height);
        gif.addFrame(canvas, { delay: options.delay });
      }

      gif.on('finished', (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        resolve(url);
      });

      gif.render();
    });
  }

  private createFrame(color: string, width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, width, height);
    }
    
    return canvas;
  }
}
