/**
 * The customizable branding panel shown beside the login form (and in the admin
 * "Customize Login Page" live preview / fullscreen preview).
 *
 * Renders the configured `branding` (logo, instance name, tagline, details and
 * resource links) over a gradient background. Content sections are emitted in
 * the admin-chosen `sectionsOrder`. Most styling derives from the `branding`
 * config: per-section font size (inline px, scaled in `preview`), bold flags,
 * name alignment, and an optional single text color applied to all text.
 *
 * `preview` renders a downscaled variant for the small admin preview card; the
 * same component at full scale powers the real login page.
 */
import type React from 'react';
import { useEffect, useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { Logo } from '@opendatacapture/react-core';
import type { BrandingConfig, LogoAlignment, LogoSize, PanelSection } from '@opendatacapture/schemas/setup';
import { BookOpenIcon, GithubIcon, LinkIcon } from 'lucide-react';

import { config } from '@/config';
import { useCurrentYear } from '@/hooks/useCurrentYear';
import { getLoginGradient } from '@/utils/branding';

const PRESET_LOGO_HEIGHT_CLASS: { [K in Exclude<LogoSize, 'custom'>]: { main: string; preview: string } } = {
  large: { main: 'h-28', preview: 'h-14' },
  medium: { main: 'h-20', preview: 'h-10' },
  small: { main: 'h-12', preview: 'h-8' },
  xlarge: { main: 'h-44', preview: 'h-20' }
};

const LOGO_ALIGNMENT_CLASS: { [K in LogoAlignment]: string } = {
  center: 'justify-center',
  left: 'justify-start',
  right: 'justify-end'
};

const TEXT_ALIGNMENT_CLASS: { [K in LogoAlignment]: string } = {
  center: 'text-center',
  left: 'text-left',
  right: 'text-right'
};

const DEFAULT_SECTIONS_ORDER: PanelSection[] = ['logo', 'name', 'tagline', 'details', 'resources'];
/** Scale factor applied to custom font sizes in the small preview card. */
const PREVIEW_FONT_SCALE = 0.5;
/** Smallest rendered font size (px) in the preview, so tiny choices stay legible. */
const PREVIEW_FONT_MIN_PX = 7;
/** Linear scale factor applied to custom logo dimensions in the small preview card. */
const PREVIEW_LOGO_SCALE = 0.18;
/** Hard cap on logo dimensions in the small preview card (prevents huge logos from blowing out the layout). */
const PREVIEW_LOGO_MAX_PX = 120;

type LoginBrandingPanelProps = {
  branding?: BrandingConfig | null;
  className?: string;
  /** When provided, overrides the resolved app language — used for live preview language toggle */
  lang?: 'en' | 'fr';
  /** When true, render at a reduced scale suitable for an inline preview */
  preview?: boolean;
};

/** Default brand name shown when no `instanceName` is configured. */
const DEFAULT_INSTANCE_NAME = 'Open Data Capture';

export const LoginBrandingPanel = ({
  branding,
  className,
  lang: langOverride,
  preview = false
}: LoginBrandingPanelProps) => {
  const { resolvedLanguage, t } = useTranslation();
  const lang = langOverride ?? (resolvedLanguage === 'fr' ? 'fr' : 'en');
  const currentYear = useCurrentYear();

  /** Translate an inline bilingual object using the (possibly overridden) lang. */
  const tl = (obj: { en: string; fr: string }): string => obj[lang];

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const instanceName = branding?.instanceName?.[lang]?.trim() || DEFAULT_INSTANCE_NAME;
  const instanceTagline = branding?.instanceTagline?.[lang]?.trim() ?? null;
  const instanceDetails = branding?.instanceDetails?.[lang]?.trim() ?? null;
  const showFooterLinks = branding?.showFooterLinks ?? true;
  const showLogo = branding?.showLogo !== false;
  const showTagline = branding?.showTagline !== false;
  const showDetails = branding?.showDetails !== false;
  const boldName = branding?.boldName !== false;
  const nameAlignment: LogoAlignment = branding?.nameAlignment ?? 'left';
  const boldTagline = branding?.boldTagline === true;
  const boldDetails = branding?.boldDetails === true;
  const boldResourceLinks = branding?.boldResourceLinks === true;
  const panelTextColor = branding?.panelTextColor ?? null;

  /**
   * Returns the given default slate text-color class, or `null` when a custom
   * panel text color is configured — in which case the element instead inherits
   * the color set inline on the panel root, so every text uses the chosen color.
   */
  const tc = (slateClass: string): null | string => (panelTextColor ? null : slateClass);

  // The active logo image: the URL slot when logoSource is 'url', otherwise the
  // uploaded-image slot. An absent logoSource (legacy data) falls back to
  // `customLogoSrc`, which historically held either an upload or a URL.
  const logoSrc = branding?.logoSource === 'url' ? (branding.customLogoUrl ?? null) : (branding?.customLogoSrc ?? null);

  // If a logo *URL* fails to load (e.g. a 404), fall back to the default logo
  // instead of showing a broken image. Reset when the active source changes.
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  useEffect(() => {
    setLogoLoadFailed(false);
  }, [logoSrc]);

  /**
   * Inline `font-size` override (px) for a configured section size, scaled down
   * in the preview card. Returns `{}` when unset so the default Tailwind size
   * class applies. An inline `font-size` always wins over the class, including
   * its responsive `lg:` variant.
   */
  const fontStyle = (px: null | number | undefined): React.CSSProperties =>
    px ? { fontSize: `${preview ? Math.max(Math.round(px * PREVIEW_FONT_SCALE), PREVIEW_FONT_MIN_PX) : px}px` } : {};
  const logoSize: LogoSize = branding?.logoSize ?? 'small';
  const logoAlignment: LogoAlignment = branding?.logoAlignment ?? 'left';
  const showResourceLinks = (branding?.showResourceLinks ?? false) && (branding?.resourceLinks?.length ?? 0) > 0;

  const sectionsOrder: PanelSection[] =
    branding?.sectionsOrder?.length === DEFAULT_SECTIONS_ORDER.length
      ? (branding.sectionsOrder as PanelSection[])
      : DEFAULT_SECTIONS_ORDER;

  // ── Logo sizing ──────────────────────────────────────────────────────────
  const baseW = branding?.customLogoWidth ?? null;
  const baseH = branding?.customLogoHeight ?? null;
  const useCustomSize = logoSize === 'custom' && (baseW !== null || baseH !== null);

  let logoImgClass: string;
  let logoImgStyle: React.CSSProperties;

  if (useCustomSize) {
    if (preview) {
      // Apply a fixed scale so different real-world sizes look visibly different,
      // then clamp so a very large logo can't blow out the preview card.
      const w = baseW ?? 0;
      const h = baseH ?? 0;
      const maxDim = Math.max(w, h);
      const scale = maxDim > 0 ? Math.min(PREVIEW_LOGO_MAX_PX / maxDim, PREVIEW_LOGO_SCALE) : 1;
      logoImgStyle = {
        height: h > 0 ? `${Math.round(h * scale)}px` : 'auto',
        width: w > 0 ? `${Math.round(w * scale)}px` : 'auto'
      };
    } else {
      // Full size — exact specified dimensions.
      logoImgStyle = {
        height: baseH ? `${baseH}px` : 'auto',
        width: baseW ? `${baseW}px` : 'auto'
      };
    }
    // No object-fit class — the <img> element's content stretches (`fill`, the default)
    // to fully cover the explicit width × height box the user requested.
    logoImgClass = '';
  } else {
    const presetKey = logoSize === 'custom' ? 'small' : logoSize;
    const heightClass = PRESET_LOGO_HEIGHT_CLASS[presetKey][preview ? 'preview' : 'main'];
    logoImgClass = cn('w-auto', heightClass);
    logoImgStyle = {};
  }

  // ── Section nodes ────────────────────────────────────────────────────────

  const logoNode: React.ReactNode = showLogo ? (
    <div className={cn('relative z-10 flex w-full items-center', LOGO_ALIGNMENT_CLASS[logoAlignment])}>
      {logoSrc && !logoLoadFailed ? (
        <img
          alt={instanceName}
          className={logoImgClass}
          src={logoSrc}
          style={logoImgStyle}
          onError={() => setLogoLoadFailed(true)}
        />
      ) : (
        <Logo className={logoImgClass} style={logoImgStyle} variant="light" />
      )}
    </div>
  ) : null;

  const nameNode: React.ReactNode = (
    <h1
      className={cn(
        'relative z-10 leading-tight tracking-tight subpixel-antialiased',
        preview ? 'text-xl' : 'text-4xl lg:text-5xl',
        boldName ? 'font-bold' : 'font-medium',
        TEXT_ALIGNMENT_CLASS[nameAlignment]
      )}
      style={fontStyle(branding?.nameFontSize)}
    >
      {instanceName}
    </h1>
  );

  const taglineNode: React.ReactNode =
    showTagline && instanceTagline ? (
      <p
        className={cn(
          'relative z-10 leading-relaxed',
          tc('text-slate-200/90'),
          preview ? 'text-xs' : 'text-base lg:text-lg',
          boldTagline && 'font-bold'
        )}
        style={fontStyle(branding?.taglineFontSize)}
      >
        {instanceTagline}
      </p>
    ) : null;

  const detailsNode: React.ReactNode =
    showDetails && instanceDetails ? (
      <p
        className={cn(
          'relative z-10 leading-relaxed',
          tc('text-slate-200/80'),
          preview ? 'text-[11px]' : 'text-sm lg:text-base',
          boldDetails && 'font-bold'
        )}
        style={fontStyle(branding?.detailsFontSize)}
      >
        {instanceDetails}
      </p>
    ) : null;

  const resourcesNode: React.ReactNode = showResourceLinks ? (
    <div className="relative z-10 flex flex-col gap-2">
      <p
        className={cn(
          'font-semibold uppercase tracking-wider',
          tc('text-slate-100'),
          preview ? 'text-[9px]' : 'text-xs'
        )}
        style={fontStyle(branding?.resourceLinksFontSize)}
      >
        {tl({ en: 'Resources', fr: 'Ressources' })}
      </p>
      <div
        className={cn('flex flex-wrap items-center gap-x-5 gap-y-2', preview ? 'text-[11px]' : 'text-sm')}
        style={fontStyle(branding?.resourceLinksFontSize)}
      >
        {branding!.resourceLinks!.map((link, index) => (
          <a
            className={cn(
              'inline-flex items-center gap-1.5 underline-offset-4 transition-colors hover:underline',
              tc('text-slate-200/90 hover:text-white'),
              boldResourceLinks ? 'font-bold' : 'font-medium'
            )}
            href={link.href}
            key={`${link.href}-${index}`}
            rel="noreferrer"
            target="_blank"
          >
            <LinkIcon className={preview ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} />
            {link.label}
          </a>
        ))}
      </div>
    </div>
  ) : null;

  // Map each section key to its rendered node, then emit them in the
  // admin-configured order, skipping any that resolved to `null` (hidden or
  // empty). This is what makes the sections independently orderable.
  const sectionNodes: { [K in PanelSection]: React.ReactNode } = {
    details: detailsNode,
    logo: logoNode,
    name: nameNode,
    resources: resourcesNode,
    tagline: taglineNode
  };

  const visibleSections = sectionsOrder.filter((s) => sectionNodes[s] !== null);

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden',
        tc('text-slate-100'),
        preview ? 'p-5' : 'p-10 lg:p-14',
        className
      )}
      data-testid="login-branding-panel"
      style={{ backgroundImage: getLoginGradient(branding), ...(panelTextColor ? { color: panelTextColor } : {}) }}
    >
      {/* Decorative shading */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/25"
      />

      {/* Ordered content sections */}
      <div className={cn('flex flex-1 flex-col', preview ? 'gap-4' : 'gap-8')}>
        {visibleSections.map((section) => (
          <div key={section}>{sectionNodes[section]}</div>
        ))}
      </div>

      {/* Footer — always pinned to the bottom with breathing room */}
      <div className={cn('relative z-10 flex flex-col', preview ? 'pt-5' : 'pt-10')}>
        {showFooterLinks && (
          <div
            className={cn(
              'flex flex-wrap items-center gap-x-5 gap-y-2',
              preview ? 'pb-1.5 text-[11px]' : 'pb-3 text-sm'
            )}
          >
            <a
              className={cn(
                'inline-flex items-center gap-1.5 font-medium underline-offset-4 transition-colors hover:underline',
                tc('text-slate-200/90 hover:text-white')
              )}
              href={config.meta.githubRepoUrl}
              rel="noopener noreferrer"
            >
              <GithubIcon className={preview ? 'h-3 w-3' : 'h-4 w-4'} />
              {tl({ en: 'Source Code', fr: 'Code source' })}
            </a>
            <a
              className={cn(
                'inline-flex items-center gap-1.5 font-medium underline-offset-4 transition-colors hover:underline',
                tc('text-slate-200/90 hover:text-white')
              )}
              href={config.meta.docsUrl}
              rel="noopener noreferrer"
            >
              <BookOpenIcon className={preview ? 'h-3 w-3' : 'h-4 w-4'} />
              {tl({ en: 'Documentation', fr: 'Documentation' })}
            </a>
          </div>
        )}
        <p className={cn(tc('text-slate-300/70'), preview ? 'text-[9px]' : 'text-xs')}>
          &copy; {currentYear} {t('layout.organization.name')}
        </p>
      </div>
    </div>
  );
};
