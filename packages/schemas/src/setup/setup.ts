import { z } from 'zod/v4';

import { $CreateUserData } from '../user/user.js';

// ── Internal helpers (must precede all exports for import/exports-last) ───────

const $ReleaseVersion = z.string().regex(/^[0-9]+\.[0-9]+\.[0-9]+$/);

const $DevelopmentReleaseInfo = z.object({
  branch: z.string().min(1),
  buildTime: z.number(),
  commit: z.string().min(1),
  type: z.enum(['development', 'test']),
  version: $ReleaseVersion
});

const $ProductionReleaseInfo = z.object({
  buildTime: z.number(),
  type: z.literal('production'),
  version: $ReleaseVersion
});

const $ReleaseInfo = z.discriminatedUnion('type', [$DevelopmentReleaseInfo, $ProductionReleaseInfo]);

/** The curated gradient themes available for the login page background. */
const LOGIN_THEMES = ['slate', 'ocean', 'sunset', 'forest', 'violet', 'rose', 'midnight', 'custom'] as const;

/** Preset logo sizes (plus `custom` for an explicit width × height). */
const LOGO_SIZES = ['small', 'medium', 'large', 'xlarge', 'custom'] as const;

/** Horizontal alignment of the logo within the branding panel. */
const LOGO_ALIGNMENTS = ['left', 'center', 'right'] as const;

/** Which logo slot is active: an uploaded image (`customLogoSrc`) or an external URL (`customLogoUrl`). */
const LOGO_SOURCES = ['upload', 'url'] as const;

/** Independently orderable content sections in the login branding panel. */
const PANEL_SECTIONS = ['logo', 'name', 'tagline', 'details', 'resources'] as const;

const $HexColor = z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color (e.g. #0ea5e9)');

/** A piece of branding text with an English and French variant. */
const $BrandingText = z.object({
  en: z.string().max(300).nullish(),
  fr: z.string().max(300).nullish()
});

/**
 * Resource-link hrefs render into `<a href>` on the login page, so they must be
 * restricted to http(s) here (the server-side gate) — otherwise a crafted value
 * like `javascript:` or `data:` would be a script-injection vector. The pattern
 * also requires a dotted host (e.g. example.com) and mirrors the client form's.
 */
const RESOURCE_LINK_URL_PATTERN = /^https?:\/\/[^\s/]+\.[^\s/]+(\/\S*)?$/;

/**
 * Both logo fields render into `<img src>`, so — like resource-link hrefs — they
 * must be restricted here to values that can only ever load an image; otherwise a
 * crafted `javascript:` or `data:text/html` value would be a script-injection
 * vector. An uploaded logo is a base64 data URI of some image type, while
 * `customLogoSrc` may also hold an http(s) URL for logos saved before
 * `customLogoUrl` existed (see `logoSource`).
 *
 * Any `image/*` subtype is allowed rather than just the four the editor offers:
 * this schema also gates reads, where a rejected value drops the whole branding
 * config, so it must stay permissive enough for images saved by earlier versions.
 * The narrower list the editor accepts is enforced client-side.
 */
const LOGO_DATA_URI_PATTERN = /^data:image\/[a-zA-Z0-9.+-]+;base64,[A-Za-z0-9+/]+={0,2}$/;
const HTTP_URL_SCHEME_PATTERN = /^https?:\/\//;

/** A single resource link displayed in the branding panel. */
const $ResourceLink = z.object({
  href: z.string().max(2000).regex(RESOURCE_LINK_URL_PATTERN, 'Must be an http(s) URL'),
  label: $BrandingText
});

/** Allowed login-panel font sizes, in pixels. Used by the per-section size pickers. */
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72] as const;

const $FontSize = z
  .number()
  .int()
  .refine(
    (n): n is (typeof FONT_SIZES)[number] => (FONT_SIZES as readonly number[]).includes(n),
    'Must be a supported font size'
  );

const $BrandingConfig = z.object({
  /** Whether the details section text is rendered bold */
  boldDetails: z.boolean().nullish(),
  /** Whether the instance name is rendered bold (defaults to bold) */
  boldName: z.boolean().nullish(),
  /** Whether the resource links text is rendered bold */
  boldResourceLinks: z.boolean().nullish(),
  /** Whether the tagline (main description) text is rendered bold */
  boldTagline: z.boolean().nullish(),
  /** Custom logo height in pixels, used when logoSize is 'custom' */
  customLogoHeight: z.number().int().positive().max(5000).nullish(),
  /**
   * The uploaded logo image as a data URI (SVG, PNG, JPEG, WebP); used when logoSource is 'upload'.
   * The limit accommodates a 2 MB source image, which is ~2.74M characters once base64-encoded.
   */
  customLogoSrc: z
    .string()
    .max(3_000_000)
    .refine(
      (value) => LOGO_DATA_URI_PATTERN.test(value) || HTTP_URL_SCHEME_PATTERN.test(value),
      'Must be a base64 image data URI, or an http(s) URL'
    )
    .nullish(),
  /** An external logo image URL; used when logoSource is 'url' */
  customLogoUrl: z.string().url().max(2000).regex(HTTP_URL_SCHEME_PATTERN, 'Must be an http(s) URL').nullish(),
  /** Custom logo width in pixels, used when logoSize is 'custom' */
  customLogoWidth: z.number().int().positive().max(5000).nullish(),
  /** The starting gradient color, used when loginTheme is 'custom' */
  customPrimaryColor: $HexColor.nullish(),
  /** The ending gradient color, used when loginTheme is 'custom' */
  customSecondaryColor: $HexColor.nullish(),
  /** Font size (px) for the details section; null/undefined uses the default size */
  detailsFontSize: $FontSize.nullish(),
  /** Whether the custom branded login page is enabled (defaults to false) */
  enableBranding: z.boolean().nullish(),
  /** Extended description / notes shown below the tagline */
  instanceDetails: $BrandingText.nullish(),
  /** The display name of the instance, shown on the login branding panel */
  instanceName: $BrandingText.nullish(),
  /** Short tagline shown on the login branding panel */
  instanceTagline: $BrandingText.nullish(),
  /** The selected background gradient theme for the login page */
  loginTheme: z.enum(LOGIN_THEMES).nullish(),
  /** Horizontal alignment of the logo within the branding panel */
  logoAlignment: z.enum(LOGO_ALIGNMENTS).nullish(),
  /** The preset (or 'custom') logo size shown on the login branding panel */
  logoSize: z.enum(LOGO_SIZES).nullish(),
  /** Selects which logo slot is shown; defaults to 'upload' (or legacy `customLogoSrc`) when unset */
  logoSource: z.enum(LOGO_SOURCES).nullish(),
  /** Horizontal alignment of the instance name within the branding panel */
  nameAlignment: z.enum(LOGO_ALIGNMENTS).nullish(),
  /** Font size (px) for the instance name; null/undefined uses the default size */
  nameFontSize: $FontSize.nullish(),
  /** Overrides the color of all text on the branding panel; null/undefined uses the default */
  panelTextColor: $HexColor.nullish(),
  /** Optional user-provided links rendered in the branding panel */
  resourceLinks: z.array($ResourceLink).max(50).optional(),
  /** Font size (px) for the resource links; null/undefined uses the default size */
  resourceLinksFontSize: $FontSize.nullish(),
  /** Gradient start color for the right panel when rightPanelTheme is 'custom' */
  rightPanelPrimaryColor: $HexColor.nullish(),
  /** Gradient end color for the right panel when rightPanelTheme is 'custom' */
  rightPanelSecondaryColor: $HexColor.nullish(),
  /** Selected gradient theme for the right-hand login form panel (null = use default background) */
  rightPanelTheme: z.enum(LOGIN_THEMES).nullish(),
  /** Order of the five panel sections */
  sectionsOrder: z
    .array(z.enum(PANEL_SECTIONS))
    .max(5)
    .refine((arr) => new Set(arr).size === arr.length, 'sectionsOrder must not contain duplicates')
    .optional(),
  /** Whether the details section is visible in the branding panel */
  showDetails: z.boolean().nullish(),
  /** Whether to show GitHub and documentation links in the login page footer */
  showFooterLinks: z.boolean().nullish(),
  /** Whether the logo section is visible in the branding panel */
  showLogo: z.boolean().nullish(),
  /** Whether the user-provided resource links section is shown */
  showResourceLinks: z.boolean().nullish(),
  /** Whether the main description (tagline) section is visible */
  showTagline: z.boolean().nullish(),
  /** Font size (px) for the tagline (main description); null/undefined uses the default size */
  taglineFontSize: $FontSize.nullish()
});

const $SetupState = z.object({
  branding: $BrandingConfig.nullish(),
  isDemo: z.boolean(),
  isExperimentalFeaturesEnabled: z.boolean().nullish(),
  isGatewayEnabled: z.boolean(),
  isSetup: z.boolean().nullable(),
  release: $ReleaseInfo,
  uptime: z.number()
});

const $UpdateSetupStateData = z.object({
  branding: $BrandingConfig.nullish(),
  isExperimentalFeaturesEnabled: z.boolean().nullish()
});

const $CreateAdminData = $CreateUserData.omit({
  basePermissionLevel: true,
  groupIds: true
});

const $InitAppOptions = z.object({
  admin: $CreateAdminData,
  dummySubjectCount: z.number().int().nonnegative().optional(),
  enableExperimentalFeatures: z.boolean(),
  initDemo: z.boolean(),
  recordsPerSubject: z.number().int().nonnegative().optional()
});

// ── Exports ──────────────────────────────────────────────────────────────────

export type BrandingConfig = z.infer<typeof $BrandingConfig>;
export type BrandingText = z.infer<typeof $BrandingText>;
export type CreateAdminData = z.infer<typeof $CreateAdminData>;
export type DevelopmentReleaseInfo = z.infer<typeof $DevelopmentReleaseInfo>;
export type FontSize = (typeof FONT_SIZES)[number];
export type InitAppOptions = z.infer<typeof $InitAppOptions>;
export type LoginTheme = (typeof LOGIN_THEMES)[number];
export type LogoAlignment = (typeof LOGO_ALIGNMENTS)[number];
export type LogoSize = (typeof LOGO_SIZES)[number];
export type LogoSource = (typeof LOGO_SOURCES)[number];
export type PanelSection = (typeof PANEL_SECTIONS)[number];
export type ProductionReleaseInfo = z.infer<typeof $ProductionReleaseInfo>;
export type ReleaseInfo = z.infer<typeof $ReleaseInfo>;
export type ResourceLink = z.infer<typeof $ResourceLink>;
export type SetupState = z.infer<typeof $SetupState>;
export type UpdateSetupStateData = z.infer<typeof $UpdateSetupStateData>;

export {
  $BrandingConfig,
  $BrandingText,
  $CreateAdminData,
  $DevelopmentReleaseInfo,
  $InitAppOptions,
  $ProductionReleaseInfo,
  $ReleaseInfo,
  $ReleaseVersion,
  $ResourceLink,
  $SetupState,
  $UpdateSetupStateData,
  FONT_SIZES,
  LOGIN_THEMES,
  LOGO_ALIGNMENTS,
  LOGO_SIZES,
  LOGO_SOURCES,
  PANEL_SECTIONS
};
