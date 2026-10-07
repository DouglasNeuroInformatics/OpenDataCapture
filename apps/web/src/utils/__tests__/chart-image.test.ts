import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { chartImageFilename, renderChartPng } from '@/utils/chart-image';

const pngBlob = new Blob(['png'], { type: 'image/png' });

let encodedBlob: Blob | null = pngBlob;
let drawnText: string[] = [];
let imageSource = '';

const fakeContext = {
  arc: () => undefined,
  beginPath: () => undefined,
  drawImage: () => undefined,
  fill: () => undefined,
  fillRect: () => undefined,
  fillStyle: '',
  fillText: (text: string) => {
    drawnText.push(text);
  },
  font: '',
  measureText: (text: string) => ({ width: text.length * 6 }),
  scale: () => undefined,
  textAlign: ''
};

/** A detached image never loads a data URL under happy-dom, so the decode is resolved here. */
class FakeImage {
  private onLoad: (() => void) | null = null;

  set src(value: string) {
    imageSource = value;
    queueMicrotask(() => this.onLoad?.());
  }

  addEventListener(type: string, listener: () => void) {
    if (type === 'load') {
      this.onLoad = listener;
    }
  }
}

const chartCard = (markup = '<svg width="600" height="300"><text>tick</text></svg>') => {
  const container = document.createElement('div');
  container.innerHTML = markup;
  return container;
};

beforeEach(() => {
  encodedBlob = pngBlob;
  drawnText = [];
  imageSource = '';
  vi.stubGlobal('Image', FakeImage);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    fakeContext as unknown as CanvasRenderingContext2D
  );
  vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(encodedBlob));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('renderChartPng', () => {
  it('should encode the chart as a png', async () => {
    await expect(renderChartPng(chartCard(), { mode: 'light' })).resolves.toBe(pngBlob);
  });

  // The chart is rasterized from its own markup, so the capture never depends on the page's CSS —
  // which is what made html2canvas fail on the oklch the theme tokens resolve to.
  it('should rasterize the chart from its own svg markup', async () => {
    await renderChartPng(chartCard(), { mode: 'light' });
    expect(imageSource.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
    expect(decodeURIComponent(imageSource)).toContain('<text>tick</text>');
  });

  // A detached svg inherits no font, so one is declared rather than left to the renderer's default.
  it('should declare a font on the serialized chart', async () => {
    await renderChartPng(chartCard(), { mode: 'light' });
    expect(decodeURIComponent(imageSource)).toContain('font-family');
  });

  it('should draw the headings above the chart and the footnotes below it', async () => {
    await renderChartPng(chartCard(), {
      footnotes: ['Timeframe: All time'],
      headings: ['Happiness Questionnaire', 'Total Score'],
      mode: 'light'
    });
    expect(drawnText).toEqual(['Happiness Questionnaire', 'Total Score', 'Timeframe: All time']);
  });

  // Recharts renders its legend as HTML beside the svg, so rasterizing the svg alone drops it.
  it('should redraw the legend, which is not part of the chart markup', async () => {
    await renderChartPng(chartCard(), {
      legend: [
        { color: '#111111', label: 'In Person' },
        { color: '#222222', label: 'Remote' }
      ],
      mode: 'light'
    });
    expect(drawnText).toEqual(['In Person', 'Remote']);
  });

  it('should report that there is nothing to save when the card holds no chart', async () => {
    await expect(
      renderChartPng(chartCard('<p>No records match the current filters.</p>'), { mode: 'light' })
    ).rejects.toThrow('There is no chart on screen to save');
  });

  it('should report a failure to encode rather than resolving with nothing', async () => {
    encodedBlob = null;
    await expect(renderChartPng(chartCard(), { mode: 'light' })).rejects.toThrow(
      'The chart could not be encoded as an image'
    );
  });
});

describe('chartImageFilename', () => {
  it('should keep a readable stem and stamp it so repeated downloads do not collide', () => {
    expect(chartImageFilename('Happiness Questionnaire')).toMatch(/^Happiness_Questionnaire_.+\.png$/);
  });

  it('should drop the characters a filesystem would object to', () => {
    expect(chartImageFilename('A/B: "C"')).toMatch(/^A_B_C_.+\.png$/);
  });

  it('should fall back to a generic stem when the label contributes nothing', () => {
    expect(chartImageFilename('///')).toMatch(/^chart_.+\.png$/);
  });
});
