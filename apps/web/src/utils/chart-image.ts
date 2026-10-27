import { CHART_SURFACE, inkColors } from '@/utils/chart-theme';

/**
 * Charts are captured by rasterizing their own SVG rather than by screenshotting the page.
 *
 * html2canvas re-implements CSS parsing and understands no colour function newer than `rgb()`, while
 * this app's tokens resolve to Tailwind v4's palette, authored in `oklch()`. Pinning each element's
 * colours inline was not enough, because it also parses pseudo-element styles, which no inline
 * declaration can reach — hence "Attempting to parse an unsupported color function".
 *
 * The SVG has no such problem: every colour recharts draws with arrives as a hex attribute from
 * `chart-theme` or the palette, so the markup is already self-contained. Nothing here consults a
 * stylesheet, which is what makes the capture independent of how the page is themed.
 */

/** The capture's own typography, declared because a detached SVG inherits no font from the page. */
const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

const HEADING_FONT = `600 16px ${FONT_STACK}`;

const CAPTION_FONT = `500 13px ${FONT_STACK}`;

const LINE_HEIGHT = 24;

const GUTTER = 16;

const LEGEND_SWATCH = 10;

const LEGEND_GAP = 20;

type LegendEntry = { color: string; label: string };

type ChartImageOptions = {
  /** Lines drawn below the chart, for the filters the capture was taken under */
  footnotes?: string[];
  /** Lines drawn above the chart, so the file says what it depicts once it is out of the app */
  headings?: string[];
  /**
   * Redrawn from the series rather than captured: recharts renders its legend as HTML beside the
   * SVG, so rasterizing the SVG alone would silently drop it.
   */
  legend?: LegendEntry[];
  mode: 'dark' | 'light';
};

/** The chart's own markup, detached and made to stand alone as a document. */
function serializeChart(svg: SVGSVGElement, width: number, height: number): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  clone.setAttribute('viewBox', `0 0 ${width} ${height}`);
  // Set on the root so every `<text>` inherits it, since the page's own font never reaches here.
  clone.style.fontFamily = FONT_STACK;
  return new XMLSerializer().serializeToString(clone);
}

async function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('The chart could not be rasterized')));
    image.src = source;
  });
}

function drawLegend(
  context: CanvasRenderingContext2D,
  entries: LegendEntry[],
  { ink, width, y }: { ink: string; width: number; y: number }
): void {
  context.font = CAPTION_FONT;
  const entryWidth = (entry: LegendEntry) => LEGEND_SWATCH + 6 + context.measureText(entry.label).width;
  const total = entries.reduce((sum, entry) => sum + entryWidth(entry), 0) + LEGEND_GAP * (entries.length - 1);
  let x = Math.max(GUTTER, (width - total) / 2);
  for (const entry of entries) {
    context.fillStyle = entry.color;
    context.beginPath();
    context.arc(x + LEGEND_SWATCH / 2, y - 4, LEGEND_SWATCH / 2, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = ink;
    context.textAlign = 'left';
    context.fillText(entry.label, x + LEGEND_SWATCH + 6, y);
    x += entryWidth(entry) + LEGEND_GAP;
  }
}

/**
 * Rasterizes a chart to a PNG blob at twice its on-screen size.
 *
 * Throws rather than returning null on failure, so the caller reports it: a download that quietly
 * does nothing is indistinguishable from a broken button.
 */
async function renderChartPng(
  container: HTMLElement,
  { footnotes = [], headings = [], legend = [], mode }: ChartImageOptions
): Promise<Blob> {
  const svg = container.querySelector('svg');
  if (!svg) {
    throw new Error('There is no chart on screen to save');
  }

  const bounds = svg.getBoundingClientRect();
  const chartWidth = Math.round(bounds.width) || Number(svg.getAttribute('width')) || 800;
  const chartHeight = Math.round(bounds.height) || Number(svg.getAttribute('height')) || 400;

  const image = await loadImage(
    `data:image/svg+xml;charset=utf-8,${encodeURIComponent(serializeChart(svg, chartWidth, chartHeight))}`
  );

  const legendHeight = legend.length > 0 ? LINE_HEIGHT : 0;
  const width = chartWidth;
  const height =
    GUTTER * 2 + headings.length * LINE_HEIGHT + chartHeight + legendHeight + footnotes.length * LINE_HEIGHT;

  const scale = 2;
  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('This browser cannot encode the chart as an image');
  }
  context.scale(scale, scale);

  const ink = inkColors[mode];
  context.fillStyle = CHART_SURFACE[mode];
  context.fillRect(0, 0, width, height);

  let y = GUTTER;

  context.font = HEADING_FONT;
  context.fillStyle = ink;
  context.textAlign = 'center';
  for (const heading of headings) {
    y += LINE_HEIGHT - 6;
    context.fillText(heading, width / 2, y);
    y += 6;
  }

  context.drawImage(image, 0, y, chartWidth, chartHeight);
  y += chartHeight;

  if (legend.length > 0) {
    y += LINE_HEIGHT - 6;
    drawLegend(context, legend, { ink, width, y });
    y += 6;
  }

  context.font = CAPTION_FONT;
  context.fillStyle = ink;
  context.textAlign = 'left';
  for (const footnote of footnotes) {
    y += LINE_HEIGHT - 6;
    context.fillText(footnote, GUTTER, y);
    y += 6;
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error('The chart could not be encoded as an image'));
    }, 'image/png');
  });
}

/** A filesystem-safe stem for a chart capture, stamped so repeated downloads do not collide. */
function chartImageFilename(label: string): string {
  const stem = label.replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '') || 'chart';
  return `${stem}_${new Date().toISOString()}.png`;
}

export { chartImageFilename, renderChartPng };
