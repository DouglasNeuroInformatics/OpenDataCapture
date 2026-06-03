import type { BrandingConfig } from '@opendatacapture/schemas/setup';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { LoginBrandingPanel } from './LoginBrandingPanel';

type Story = StoryObj<typeof LoginBrandingPanel>;

export default { component: LoginBrandingPanel } as Meta<typeof LoginBrandingPanel>;

const baseBranding: BrandingConfig = {
  instanceName: { en: 'Open Data Capture', fr: 'Open Data Capture' },
  instanceTagline: {
    en: 'A platform for clinical and research data collection.',
    fr: 'Une plateforme pour la collecte de données cliniques et de recherche.'
  },
  loginTheme: 'ocean'
};

export const Default: Story = {
  args: {
    branding: baseBranding,
    className: 'h-screen w-screen'
  }
};

export const Preview: Story = {
  args: {
    branding: baseBranding,
    className: 'h-96 w-[36rem]',
    preview: true
  }
};

export const WithResources: Story = {
  args: {
    branding: {
      ...baseBranding,
      loginTheme: 'midnight',
      resourceLinks: [
        { href: 'https://example.org/handbook', label: 'Handbook' },
        { href: 'https://example.org/contact', label: 'Contact' }
      ],
      showResourceLinks: true
    },
    className: 'h-screen w-screen'
  }
};

export const CustomGradient: Story = {
  args: {
    branding: {
      ...baseBranding,
      customPrimaryColor: '#0ea5e9',
      customSecondaryColor: '#7c3aed',
      loginTheme: 'custom'
    },
    className: 'h-screen w-screen'
  }
};
