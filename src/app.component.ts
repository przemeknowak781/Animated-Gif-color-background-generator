
import { Component, ChangeDetectionStrategy, signal, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GifGeneratorService } from './services/gif-generator.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class AppComponent {
  private gifGeneratorService = inject(GifGeneratorService);

  // --- State Signals ---
  colors = signal<string[]>(['#4a00e0', '#8e2de2', '#4a00e0']);
  width = signal(400);
  height = signal(200);
  delay = signal(500); // ms per frame

  // --- UI/Generated State ---
  gifUrl = signal<string | null>(null);
  isGenerating = signal(true);

  constructor() {
    // Auto-regenerate GIF on parameter change with a debounce
    let debounceTimeout: any;
    effect(() => {
      // Read signals to subscribe to changes
      const currentColors = this.colors();
      const currentWidth = this.width();
      const currentHeight = this.height();
      const currentDelay = this.delay();

      this.isGenerating.set(true);
      clearTimeout(debounceTimeout);
      
      debounceTimeout = setTimeout(() => {
        if (currentColors.length > 0 && currentWidth > 0 && currentHeight > 0) {
          this.generateGif();
        } else {
            this.gifUrl.set(null);
        }
      }, 300); // 300ms debounce
    });
  }

  async generateGif(): Promise<void> {
    this.isGenerating.set(true);
    try {
      const url = await this.gifGeneratorService.generate({
        colors: this.colors(),
        width: this.width(),
        height: this.height(),
        delay: this.delay(),
      });
      this.gifUrl.set(url);
    } catch (error) {
      console.error('Error generating GIF:', error);
      this.gifUrl.set(null);
    } finally {
      this.isGenerating.set(false);
    }
  }

  addColor(): void {
    // Generate a random pleasant color
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    this.colors.update(c => [...c, randomColor]);
  }

  removeColor(indexToRemove: number): void {
    this.colors.update(c => c.filter((_, index) => index !== indexToRemove));
  }

  updateColor(indexToUpdate: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newColor = input.value;
    this.colors.update(c => c.map((color, index) => (index === indexToUpdate ? newColor : color)));
  }

  updateDimension(dimension: 'width' | 'height', event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (!isNaN(value) && value > 0) {
      if (dimension === 'width') this.width.set(value);
      if (dimension === 'height') this.height.set(value);
    }
  }

  updateDelay(event: Event): void {
    const value = (event.target as HTMLInputElement).valueAsNumber;
    if (!isNaN(value) && value > 0) {
      this.delay.set(value);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
