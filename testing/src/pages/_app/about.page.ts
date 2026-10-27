import type { Locator, Page } from '@playwright/test';

import { AppPage } from './route.page';

export class AboutPage extends AppPage {
  readonly coreApiInfo: Locator;
  readonly gatewayInfo: Locator;
  readonly pageHeader: Locator;
  readonly platformTitle: Locator;
  readonly webClientInfo: Locator;

  constructor(page: Page) {
    super(page);
    this.pageHeader = page.getByTestId('page-header');
    this.platformTitle = page.getByRole('heading', { level: 3, name: 'Open Data Capture' });
    this.webClientInfo = page.getByTestId('about-web-client-info');
    this.coreApiInfo = page.getByTestId('about-core-api-info');
    this.gatewayInfo = page.getByTestId('about-gateway-info');
  }

  async getCoreApiUptimeSeconds() {
    const uptimeText = await this.coreApiInfo.getByRole('listitem').filter({ hasText: 'Uptime:' }).textContent();
    const [hours, minutes, seconds] = uptimeText!.slice('Uptime: '.length).split(':').map(Number);
    return hours! * 3600 + minutes! * 60 + seconds!;
  }
}
