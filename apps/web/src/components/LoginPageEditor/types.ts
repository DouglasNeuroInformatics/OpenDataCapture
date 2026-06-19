import type { LoginTheme, LogoAlignment, LogoSize, LogoSource, PanelSection } from '@opendatacapture/schemas/setup';

import type { RightPanelOption } from './constants';

export type FormState = {
  boldDetails: boolean;
  boldName: boolean;
  boldResourceLinks: boolean;
  boldTagline: boolean;
  customLogoHeight: string;
  /** Uploaded logo image as a data URI (the 'upload' slot) */
  customLogoSrc: string;
  /** External logo image URL (the 'url' slot) */
  customLogoUrl: string;
  customLogoWidth: string;
  customPrimaryColor: string;
  customSecondaryColor: string;
  /** Per-section font size (px), or null to use the default size */
  detailsFontSize: null | number;
  enableBranding: boolean;
  instanceDetails: { en: string; fr: string };
  instanceName: { en: string; fr: string };
  instanceTagline: { en: string; fr: string };
  loginTheme: LoginTheme;
  logoAlignment: LogoAlignment;
  logoSize: LogoSize;
  /** Which logo slot is active: 'upload' or 'url' */
  logoSource: LogoSource;
  nameAlignment: LogoAlignment;
  nameFontSize: null | number;
  /** Hex color applied to all left-panel text (always set; seeded with the default). */
  panelTextColor: string;
  resourceLinks: { href: string; label: { en: string; fr: string } }[];
  resourceLinksFontSize: null | number;
  /** 'none' means no right-panel override; otherwise one of LoginTheme */
  rightPanelOption: RightPanelOption;
  rightPanelPrimaryColor: string;
  rightPanelSecondaryColor: string;
  sectionsOrder: PanelSection[];
  showDetails: boolean;
  showFooterLinks: boolean;
  showLogo: boolean;
  showResourceLinks: boolean;
  showTagline: boolean;
  taglineFontSize: null | number;
};
