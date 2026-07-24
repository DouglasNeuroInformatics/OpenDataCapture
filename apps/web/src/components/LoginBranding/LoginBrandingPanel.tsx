import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { Logo } from '@opendatacapture/react-core';
import type {
  BrandingConfig,
  LogoAlignment,
  LogoSize,
  PanelSection,
  ResourceLink
} from '@opendatacapture/schemas/setup';
import { BookOpenIcon, GithubIcon, LinkIcon } from 'lucide-react';

import { config } from '@/config';
import { getLoginGradient } from '@/utils/branding';

const CURRENT_YEAR = new Date().getFullYear();

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
const PREVIEW_FONT_SCALE = 0.5;
const PREVIEW_FONT_MIN_PX = 7;
const PREVIEW_LOGO_SCALE = 0.18;
const PREVIEW_LOGO_MAX_PX = 120;
const DEFAULT_INSTANCE_NAME = 'Open Data Capture';

type LoginBrandingPanelProps = {
  branding?: BrandingConfig | null;
  className?: string;
  lang?: 'en' | 'fr';
  preview?: boolean;
};

const fontStyle = (px: null | number | undefined, preview: boolean): React.CSSProperties =>
  px ? { fontSize: `${preview ? Math.max(Math.round(px * PREVIEW_FONT_SCALE), PREVIEW_FONT_MIN_PX) : px}px` } : {};

// ── Sub-components ────────────────────────────────────────────────────────────

type LogoSectionProps = {
  alignment: LogoAlignment;
  branding?: BrandingConfig | null;
  instanceName: string;
  preview: boolean;
};

const LogoSection = ({ alignment, branding, instanceName, preview }: LogoSectionProps) => {
  const logoSrc = branding?.logoSource === 'url' ? (branding.customLogoUrl ?? null) : (branding?.customLogoSrc ?? null);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);

  useEffect(() => {
    setLogoLoadFailed(false);
  }, [logoSrc]);

  const logoSize: LogoSize = branding?.logoSize ?? 'small';
  const baseW = branding?.customLogoWidth ?? null;
  const baseH = branding?.customLogoHeight ?? null;
  const useCustomSize = logoSize === 'custom' && (baseW !== null || baseH !== null);

  const { logoImgClass, logoImgStyle } = useMemo(() => {
    if (useCustomSize) {
      const w = baseW ?? 0;
      const h = baseH ?? 0;
      if (preview) {
        const maxDim = Math.max(w, h);
        const scale = maxDim > 0 ? Math.min(PREVIEW_LOGO_MAX_PX / maxDim, PREVIEW_LOGO_SCALE) : 1;
        return {
          logoImgClass: '',
          logoImgStyle: {
            height: h > 0 ? `${Math.round(h * scale)}px` : 'auto',
            width: w > 0 ? `${Math.round(w * scale)}px` : 'auto'
          } satisfies React.CSSProperties
        };
      }
      return {
        logoImgClass: '',
        logoImgStyle: {
          height: baseH ? `${baseH}px` : 'auto',
          width: baseW ? `${baseW}px` : 'auto'
        } satisfies React.CSSProperties
      };
    }
    const presetKey = logoSize === 'custom' ? 'small' : logoSize;
    const heightClass = PRESET_LOGO_HEIGHT_CLASS[presetKey][preview ? 'preview' : 'main'];
    return { logoImgClass: cn('w-auto', heightClass), logoImgStyle: {} };
  }, [useCustomSize, baseW, baseH, preview, logoSize]);

  return (
    <div className={cn('relative z-10 flex w-full items-center', LOGO_ALIGNMENT_CLASS[alignment])}>
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
  );
};

type ResourcesSectionProps = {
  boldResourceLinks: boolean;
  fontSize: null | number | undefined;
  lang: string;
  links: ResourceLink[];
  preview: boolean;
  tc: (slateClass: string) => null | string;
  tl: (obj: { [key: string]: string }) => string;
};

const ResourcesSection = ({ boldResourceLinks, fontSize, lang, links, preview, tc, tl }: ResourcesSectionProps) => (
  <div className="relative z-10 flex flex-col gap-2">
    <p
      className={cn('font-semibold uppercase tracking-wider', tc('text-slate-100'), preview ? 'text-[9px]' : 'text-xs')}
      style={fontStyle(fontSize, preview)}
    >
      {tl({ en: 'Resources', fr: 'Ressources' })}
    </p>
    <div
      className={cn('flex flex-wrap items-center gap-x-5 gap-y-2', preview ? 'text-[11px]' : 'text-sm')}
      style={fontStyle(fontSize, preview)}
    >
      {links.map((link, index) => {
        /* eslint-disable @typescript-eslint/prefer-nullish-coalescing -- blank strings must fall back, so `||` not `??` */
        const linkLabel =
          (link.label as undefined | { [key: string]: string })?.[lang]?.trim() ||
          link.label?.en?.trim() ||
          link.label?.fr?.trim() ||
          '';
        /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */
        if (!linkLabel) return null;
        return (
          <a
            className={cn(
              'inline-flex items-center gap-1.5 underline-offset-4 transition-colors hover:underline',
              tc('text-slate-200/90 hover:text-white'),
              boldResourceLinks ? 'font-bold' : 'font-medium'
            )}
            href={link.href}
            key={`${link.href}-${index}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <LinkIcon className={preview ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} />
            {linkLabel}
          </a>
        );
      })}
    </div>
  </div>
);

type PanelFooterProps = {
  preview: boolean;
  showFooterLinks: boolean;
  tc: (slateClass: string) => null | string;
  tl: (obj: { en: string; fr: string }) => string;
};

const PanelFooter = ({ preview, showFooterLinks, tc, tl }: PanelFooterProps) => (
  <div className={cn('relative z-10 flex flex-col', preview ? 'pt-5' : 'pt-10')}>
    {showFooterLinks && (
      <div
        className={cn('flex flex-wrap items-center gap-x-5 gap-y-2', preview ? 'pb-1.5 text-[11px]' : 'pb-3 text-sm')}
      >
        <a
          className={cn(
            'inline-flex items-center gap-1.5 font-medium underline-offset-4 transition-colors hover:underline',
            tc('text-slate-200/90 hover:text-white')
          )}
          href={config.meta.githubRepoUrl}
          rel="noopener noreferrer"
          target="_blank"
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
          target="_blank"
        >
          <BookOpenIcon className={preview ? 'h-3 w-3' : 'h-4 w-4'} />
          {tl({ en: 'Documentation', fr: 'Documentation' })}
        </a>
      </div>
    )}
    <p className={cn(tc('text-slate-300/70'), preview ? 'text-[9px]' : 'text-xs')}>
      &copy; {CURRENT_YEAR} Douglas Neuroinformatics
    </p>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

export const LoginBrandingPanel = ({
  branding,
  className,
  lang: langOverride,
  preview = false
}: LoginBrandingPanelProps) => {
  const { resolvedLanguage } = useTranslation();
  const lang = langOverride ?? resolvedLanguage;

  const tl = (obj: { [key: string]: string }): string => obj[lang] ?? obj.en ?? '';

  const derived = useMemo(() => {
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing -- blank strings must fall back, so `||` not `??` */
    const instanceName =
      (branding?.instanceName as undefined | { [key: string]: string })?.[lang]?.trim() || DEFAULT_INSTANCE_NAME;
    const instanceTagline =
      (branding?.instanceTagline as undefined | { [key: string]: string })?.[lang]?.trim() || null;
    const instanceDetails =
      (branding?.instanceDetails as undefined | { [key: string]: string })?.[lang]?.trim() || null;
    /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */
    const panelTextColor = branding?.panelTextColor ?? null;
    return {
      boldDetails: branding?.boldDetails === true,
      boldName: branding?.boldName !== false,
      boldResourceLinks: branding?.boldResourceLinks === true,
      boldTagline: branding?.boldTagline === true,
      instanceDetails,
      instanceName,
      instanceTagline,
      logoAlignment: branding?.logoAlignment ?? 'left',
      nameAlignment: branding?.nameAlignment ?? 'left',
      panelTextColor,
      sectionsOrder:
        branding?.sectionsOrder?.length === DEFAULT_SECTIONS_ORDER.length
          ? branding.sectionsOrder
          : DEFAULT_SECTIONS_ORDER,
      showDetails: branding?.showDetails !== false,
      showFooterLinks: branding?.showFooterLinks ?? true,
      showLogo: branding?.showLogo !== false,
      showResourceLinks: (branding?.showResourceLinks ?? false) && (branding?.resourceLinks?.length ?? 0) > 0,
      showTagline: branding?.showTagline !== false,
      tc: (slateClass: string): null | string => (panelTextColor ? null : slateClass)
    };
  }, [branding, lang]);

  const sectionNodes = useMemo(() => {
    const {
      boldDetails,
      boldName,
      boldResourceLinks,
      boldTagline,
      instanceDetails,
      instanceName,
      instanceTagline,
      logoAlignment,
      nameAlignment,
      showDetails,
      showLogo,
      showResourceLinks,
      showTagline,
      tc
    } = derived;

    const logoNode: React.ReactNode = showLogo ? (
      <LogoSection alignment={logoAlignment} branding={branding} instanceName={instanceName} preview={preview} />
    ) : null;

    const nameNode: React.ReactNode = (
      <h1
        className={cn(
          'relative z-10 leading-tight tracking-tight subpixel-antialiased',
          preview ? 'text-xl' : 'text-4xl lg:text-5xl',
          boldName ? 'font-bold' : 'font-medium',
          TEXT_ALIGNMENT_CLASS[nameAlignment]
        )}
        style={fontStyle(branding?.nameFontSize, preview)}
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
          style={fontStyle(branding?.taglineFontSize, preview)}
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
          style={fontStyle(branding?.detailsFontSize, preview)}
        >
          {instanceDetails}
        </p>
      ) : null;

    const resourcesNode: React.ReactNode = showResourceLinks ? (
      <ResourcesSection
        boldResourceLinks={boldResourceLinks}
        fontSize={branding?.resourceLinksFontSize}
        lang={lang}
        links={branding!.resourceLinks!}
        preview={preview}
        tc={tc}
        tl={tl}
      />
    ) : null;

    return {
      details: detailsNode,
      logo: logoNode,
      name: nameNode,
      resources: resourcesNode,
      tagline: taglineNode
    } satisfies { [K in PanelSection]: React.ReactNode };
  }, [derived, branding, preview, lang]);

  const visibleSections = derived.sectionsOrder.filter((s) => sectionNodes[s] !== null);

  return (
    <div
      className={cn(
        'relative flex flex-col overflow-hidden',
        derived.tc('text-slate-100'),
        preview ? 'p-5' : 'p-10 lg:p-14',
        className
      )}
      data-testid="login-branding-panel"
      style={{
        backgroundImage: getLoginGradient(branding),
        ...(derived.panelTextColor ? { color: derived.panelTextColor } : {})
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/25"
      />

      <div className={cn('flex flex-1 flex-col', preview ? 'gap-4' : 'gap-8')}>
        {visibleSections.map((section) => (
          <div key={section}>{sectionNodes[section]}</div>
        ))}
      </div>

      <PanelFooter preview={preview} showFooterLinks={derived.showFooterLinks} tc={derived.tc} tl={tl} />
    </div>
  );
};
