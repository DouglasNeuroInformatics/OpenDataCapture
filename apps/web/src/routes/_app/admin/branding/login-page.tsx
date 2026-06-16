/**
 * Admin "Customize Login Page" route.
 *
 * Lets an administrator brand the login page: instance name/tagline/details,
 * logo, resource links, panel gradients, per-section font sizes, bold and
 * alignment, and the left-panel text color. All edits live in local `form`
 * state and are rendered live by <LoginBrandingPanel> (left) plus a mock form
 * (right); the same shape is persisted via the setup-state mutation on Save.
 *
 * A few cross-cutting concerns to keep in mind when editing:
 *  - `form` is the single source of truth; `previewBranding` and the submit
 *    payload are both derived from it (keep the two in sync when adding fields).
 *  - An unsaved-changes guard (useBlocker) compares a JSON snapshot of `form`.
 *  - Empty strings are normalized to `null` on save so the panel uses defaults.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  Button,
  Card,
  Checkbox,
  Dialog,
  Heading,
  Input,
  Label,
  RadioGroup,
  Select,
  Tabs,
  TextArea
} from '@douglasneuroinformatics/libui/components';
import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import { Logo } from '@opendatacapture/react-core';
import { FONT_SIZES, LOGIN_THEMES, LOGO_ALIGNMENTS, LOGO_SIZES, PANEL_SECTIONS } from '@opendatacapture/schemas/setup';
import type {
  BrandingConfig,
  BrandingText,
  LoginTheme,
  LogoAlignment,
  LogoSize,
  LogoSource,
  PanelSection
} from '@opendatacapture/schemas/setup';
import { createFileRoute, useBlocker } from '@tanstack/react-router';
import { ChevronDownIcon, ChevronUpIcon, MaximizeIcon, PlusIcon, TrashIcon, UploadIcon, XIcon } from 'lucide-react';

import { LoginBrandingPanel } from '@/components/LoginBranding';
import { PageHeader } from '@/components/PageHeader';
import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useUpdateSetupStateMutation } from '@/hooks/useUpdateSetupStateMutation';
import { getLoginGradient, getRightPanelGradient, LOGIN_THEME_COLORS } from '@/utils/branding';

/**
 * Options for the right-panel theme picker: 'default' (no override) + a curated
 * subset of LoginTheme values. Sunset is intentionally omitted to keep the
 * swatch grid at 8 cells (2 rows × 4 columns).
 */
const RIGHT_PANEL_OPTIONS = ['none', 'slate', 'ocean', 'forest', 'violet', 'rose', 'midnight', 'custom'] as const;
type RightPanelOption = (typeof RIGHT_PANEL_OPTIONS)[number];

const RIGHT_PANEL_LABELS: { [K in RightPanelOption]: { en: string; fr: string } } = {
  custom: { en: 'Custom', fr: 'Personnalisé' },
  forest: { en: 'Forest', fr: 'Forêt' },
  midnight: { en: 'Midnight', fr: 'Minuit' },
  none: { en: 'Default', fr: 'Par défaut' },
  ocean: { en: 'Ocean', fr: 'Océan' },
  rose: { en: 'Rose', fr: 'Rose' },
  slate: { en: 'Slate', fr: 'Ardoise' },
  violet: { en: 'Violet', fr: 'Violet' }
};

// ── Constants ─────────────────────────────────────────────────────────────────

const THEME_LABELS: { [K in LoginTheme]: { en: string; fr: string } } = {
  custom: { en: 'Custom', fr: 'Personnalisé' },
  forest: { en: 'Forest', fr: 'Forêt' },
  midnight: { en: 'Midnight', fr: 'Minuit' },
  ocean: { en: 'Ocean', fr: 'Océan' },
  rose: { en: 'Rose', fr: 'Rose' },
  slate: { en: 'Slate', fr: 'Ardoise' },
  sunset: { en: 'Sunset', fr: 'Coucher de soleil' },
  violet: { en: 'Violet', fr: 'Violet' }
};

const LOGO_SIZE_LABELS: { [K in LogoSize]: { en: string; fr: string } } = {
  custom: { en: 'Custom', fr: 'Personnalisé' },
  large: { en: 'Large', fr: 'Grand' },
  medium: { en: 'Medium', fr: 'Moyen' },
  small: { en: 'Small', fr: 'Petit' },
  xlarge: { en: 'Extra Large', fr: 'Très grand' }
};

const LOGO_ALIGNMENT_LABELS: { [K in LogoAlignment]: { en: string; fr: string } } = {
  center: { en: 'Center', fr: 'Centre' },
  left: { en: 'Left', fr: 'Gauche' },
  right: { en: 'Right', fr: 'Droite' }
};

const SECTION_TITLES: { [K in PanelSection]: { en: string; fr: string } } = {
  details: { en: 'Details', fr: 'Détails' },
  logo: { en: 'Logo', fr: 'Logo' },
  name: { en: 'Instance Name', fr: "Nom de l'instance" },
  resources: { en: 'Resources', fr: 'Ressources' },
  tagline: { en: 'Main Description', fr: 'Description principale' }
};

const DEFAULT_SECTIONS_ORDER: PanelSection[] = ['logo', 'name', 'tagline', 'details', 'resources'];
const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
/** Accept http(s) URLs with a hostname containing at least one dot (e.g. example.com). */
const URL_PATTERN = /^https?:\/\/[^\s/]+\.[^\s/]+(\/\S*)?$/;
const MAX_LOGO_BYTES = 1024 * 1024;
const FORM_ID = 'branding-form';
/** Sentinel Select value representing "no override — use the default font size". */
const FONT_SIZE_DEFAULT = 'default';
/** Seed color for the left-panel text picker — matches the panel's default `text-slate-100`. */
const DEFAULT_PANEL_TEXT_COLOR = '#f1f5f9';

// ── Types ─────────────────────────────────────────────────────────────────────

type FormState = {
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

const buildFormState = (saved: BrandingConfig | null | undefined): FormState => {
  const savedLogoSrc = saved?.customLogoSrc ?? '';
  const savedLogoUrl = saved?.customLogoUrl ?? '';
  const legacyUrlInSrc = !savedLogoUrl && savedLogoSrc !== '' && !savedLogoSrc.startsWith('data:');
  return {
    boldDetails: saved?.boldDetails === true,
    boldName: saved?.boldName !== false,
    boldResourceLinks: saved?.boldResourceLinks === true,
    boldTagline: saved?.boldTagline === true,
    customLogoHeight: saved?.customLogoHeight ? String(saved.customLogoHeight) : '',
    customLogoSrc: legacyUrlInSrc ? '' : savedLogoSrc,
    customLogoUrl: legacyUrlInSrc ? savedLogoSrc : savedLogoUrl,
    customLogoWidth: saved?.customLogoWidth ? String(saved.customLogoWidth) : '',
    customPrimaryColor: saved?.customPrimaryColor ?? LOGIN_THEME_COLORS.ocean.primary,
    customSecondaryColor: saved?.customSecondaryColor ?? LOGIN_THEME_COLORS.ocean.secondary,
    detailsFontSize: saved?.detailsFontSize ?? null,
    enableBranding: saved?.enableBranding === true,
    instanceDetails: { en: saved?.instanceDetails?.en ?? '', fr: saved?.instanceDetails?.fr ?? '' },
    instanceName: { en: saved?.instanceName?.en ?? '', fr: saved?.instanceName?.fr ?? '' },
    instanceTagline: { en: saved?.instanceTagline?.en ?? '', fr: saved?.instanceTagline?.fr ?? '' },
    loginTheme: saved?.loginTheme ?? 'slate',
    logoAlignment: saved?.logoAlignment ?? 'left',
    logoSize: saved?.logoSize ?? 'small',
    logoSource: saved?.logoSource ?? (legacyUrlInSrc ? 'url' : 'upload'),
    nameAlignment: saved?.nameAlignment ?? 'left',
    nameFontSize: saved?.nameFontSize ?? null,
    panelTextColor: saved?.panelTextColor ?? DEFAULT_PANEL_TEXT_COLOR,
    resourceLinks: saved?.resourceLinks?.length
      ? saved.resourceLinks.map((l) => ({ href: l.href, label: { en: l.label?.en ?? '', fr: l.label?.fr ?? '' } }))
      : [],
    resourceLinksFontSize: saved?.resourceLinksFontSize ?? null,
    rightPanelOption: RIGHT_PANEL_OPTIONS.includes((saved?.rightPanelTheme ?? 'none') as RightPanelOption)
      ? ((saved?.rightPanelTheme ?? 'none') as RightPanelOption)
      : 'none',
    rightPanelPrimaryColor: saved?.rightPanelPrimaryColor ?? LOGIN_THEME_COLORS.slate.primary,
    rightPanelSecondaryColor: saved?.rightPanelSecondaryColor ?? LOGIN_THEME_COLORS.slate.secondary,
    sectionsOrder:
      saved?.sectionsOrder?.length === PANEL_SECTIONS.length ? saved.sectionsOrder : DEFAULT_SECTIONS_ORDER,
    showDetails: saved?.showDetails !== false,
    showFooterLinks: saved?.showFooterLinks ?? true,
    showLogo: saved?.showLogo !== false,
    showResourceLinks: saved?.showResourceLinks ?? false,
    showTagline: saved?.showTagline !== false,
    taglineFontSize: saved?.taglineFontSize ?? null
  };
};

/**
 * Serialize form state for the unsaved-changes check. The uploaded-logo data URI
 * (`customLogoSrc`) can be megabytes, so it is collapsed to a short fingerprint
 * (length + head + tail) — collision-resistant but cheap on every keystroke.
 */
const snapshotForm = (form: FormState): string => {
  const s = form.customLogoSrc;
  return JSON.stringify({ ...form, customLogoSrc: `${s.length}:${s.slice(0, 32)}:${s.slice(-32)}` });
};

// ── Component ─────────────────────────────────────────────────────────────────

const RouteComponent = () => {
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const setupStateQuery = useSetupStateQuery();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [previewLang, setPreviewLang] = useState<'en' | 'fr'>('en');

  const updateSetupStateMutation = useUpdateSetupStateMutation({
    successNotification: {
      message: t({ en: 'The login page has been updated.', fr: 'La page de connexion a été mise à jour.' }),
      title: t({ en: 'Success', fr: 'Succès' })
    }
  });

  const saved = setupStateQuery.data.branding;

  const [form, setForm] = useState<FormState>(() => buildFormState(saved));

  // ── Unsaved-changes guard ───────────────────────────────────────────────
  // Snapshot of the form state as it appeared when last saved (or on mount).
  // Used to detect unsaved edits and warn the user before they navigate away.
  // Memoized so the (potentially large) form is serialized only when it changes.
  const formSnapshot = useMemo(() => snapshotForm(form), [form]);
  const savedSnapshotRef = useRef<string>(formSnapshot);
  const isDirty = formSnapshot !== savedSnapshotRef.current;

  // Rehydrate the form when the server data changes (e.g. after a save triggers
  // a refetch) — but only when there are no unsaved local edits.
  useEffect(() => {
    if (!isDirty) {
      const fresh = buildFormState(saved);
      setForm(fresh);
      savedSnapshotRef.current = snapshotForm(fresh);
    }
  }, [saved]);

  // Block in-app navigation (TanStack Router back button, link clicks, etc.)
  // and the native `beforeunload` (tab close / refresh / external nav) when dirty.
  // `withResolver` gives us proceed/reset controls to drive a custom dialog
  // instead of the native confirm() — lets us show Yes/No with No as default.
  const blocker = useBlocker({
    enableBeforeUnload: () => isDirty,
    shouldBlockFn: () => isDirty,
    withResolver: true
  });

  // ── State helpers ────────────────────────────────────────────────────────

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const updateText = (
    field: 'instanceDetails' | 'instanceName' | 'instanceTagline',
    lang: 'en' | 'fr',
    value: string
  ) => setForm((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));

  const updateResourceLinkHref = (index: number, value: string) =>
    setForm((prev) => ({
      ...prev,
      resourceLinks: prev.resourceLinks.map((l, i) => (i === index ? { ...l, href: value } : l))
    }));

  const updateResourceLinkLabel = (index: number, lang: 'en' | 'fr', value: string) =>
    setForm((prev) => ({
      ...prev,
      resourceLinks: prev.resourceLinks.map((l, i) =>
        i === index ? { ...l, label: { ...l.label, [lang]: value } } : l
      )
    }));

  const addResourceLink = () =>
    setForm((prev) => ({
      ...prev,
      resourceLinks: [...prev.resourceLinks, { href: '', label: { en: '', fr: '' } }]
    }));

  const removeResourceLink = (index: number) =>
    setForm((prev) => ({ ...prev, resourceLinks: prev.resourceLinks.filter((_, i) => i !== index) }));

  const moveSection = (fromIndex: number, toIndex: number) =>
    setForm((prev) => {
      const order = [...prev.sectionsOrder];
      const [item] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, item!);
      return { ...prev, sectionsOrder: order };
    });

  const handleLogoFile = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      addNotification({
        message: t({ en: 'The selected image is larger than 1 MB.', fr: "L'image sélectionnée dépasse 1 Mo." }),
        title: t({ en: 'File too large', fr: 'Fichier trop volumineux' }),
        type: 'error'
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update('customLogoSrc', reader.result as string);
    reader.readAsDataURL(file);
  };

  const parseDimension = (v: string): null | number => {
    const n = Number.parseInt(v.trim(), 10);
    return !v.trim() || Number.isNaN(n) || n <= 0 || n > 5000 ? null : n;
  };

  // ── Derived ──────────────────────────────────────────────────────────────

  const customWidth = parseDimension(form.customLogoWidth);
  const customHeight = parseDimension(form.customLogoHeight);

  const isCustomSizeInvalid =
    form.logoSize === 'custom' &&
    ((form.customLogoWidth.trim() !== '' && customWidth === null) ||
      (form.customLogoHeight.trim() !== '' && customHeight === null) ||
      (customWidth === null && customHeight === null));

  const isCustomColorInvalid =
    form.loginTheme === 'custom' &&
    (!HEX_PATTERN.test(form.customPrimaryColor) || !HEX_PATTERN.test(form.customSecondaryColor));

  const isRightPanelCustomColorInvalid =
    form.rightPanelOption === 'custom' &&
    (!HEX_PATTERN.test(form.rightPanelPrimaryColor) || !HEX_PATTERN.test(form.rightPanelSecondaryColor));

  // The left-panel text color is always shown (no enable toggle), so it just
  // needs to be a valid hex; an empty/garbage value disables Save.
  const isPanelTextColorInvalid = !HEX_PATTERN.test(form.panelTextColor);

  const isResourceLinkHrefInvalid = (href: string): boolean => {
    const trimmed = href.trim();
    return !trimmed || !URL_PATTERN.test(trimmed);
  };
  const hasInvalidResourceLinks =
    form.showResourceLinks &&
    form.resourceLinks.some((l) => (!l.label.en.trim() && !l.label.fr.trim()) || isResourceLinkHrefInvalid(l.href));

  const isSubmitDisabled =
    isCustomColorInvalid ||
    isRightPanelCustomColorInvalid ||
    isPanelTextColorInvalid ||
    isCustomSizeInvalid ||
    hasInvalidResourceLinks ||
    updateSetupStateMutation.isPending;

  // Live-preview branding object. Mirrors the shape persisted by handleSubmit so
  // the on-screen preview reflects exactly what saving would produce. Unlike the
  // submit payload, it keeps the raw form values (e.g. an in-progress logo URL)
  // so the preview updates as the admin types; the `null` coalescing only guards
  // values the panel can't render (empty logo, non-custom theme colors).
  const previewBranding: BrandingConfig = {
    boldDetails: form.boldDetails,
    boldName: form.boldName,
    boldResourceLinks: form.boldResourceLinks,
    boldTagline: form.boldTagline,
    customLogoHeight: customHeight,
    customLogoSrc: form.customLogoSrc || null,
    customLogoUrl: form.customLogoUrl || null,
    customLogoWidth: customWidth,
    customPrimaryColor: form.customPrimaryColor,
    customSecondaryColor: form.customSecondaryColor,
    detailsFontSize: form.detailsFontSize,
    enableBranding: form.enableBranding,
    instanceDetails: form.instanceDetails,
    instanceName: form.instanceName,
    instanceTagline: form.instanceTagline,
    loginTheme: form.loginTheme,
    logoAlignment: form.logoAlignment,
    logoSize: form.logoSize,
    logoSource: form.logoSource,
    nameAlignment: form.nameAlignment,
    nameFontSize: form.nameFontSize,
    panelTextColor: HEX_PATTERN.test(form.panelTextColor) ? form.panelTextColor : null,
    resourceLinks: form.resourceLinks,
    resourceLinksFontSize: form.resourceLinksFontSize,
    rightPanelPrimaryColor: form.rightPanelOption === 'custom' ? form.rightPanelPrimaryColor : null,
    rightPanelSecondaryColor: form.rightPanelOption === 'custom' ? form.rightPanelSecondaryColor : null,
    rightPanelTheme: form.rightPanelOption === 'none' ? null : form.rightPanelOption,
    sectionsOrder: form.sectionsOrder,
    showDetails: form.showDetails,
    showFooterLinks: form.showFooterLinks,
    showLogo: form.showLogo,
    showResourceLinks: form.showResourceLinks,
    showTagline: form.showTagline,
    taglineFontSize: form.taglineFontSize
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Guard again on submit in case Enter bypassed the disabled Save button.
    if (
      isCustomColorInvalid ||
      isRightPanelCustomColorInvalid ||
      isPanelTextColorInvalid ||
      isCustomSizeInvalid ||
      hasInvalidResourceLinks
    )
      return;
    // Empty text fields persist as `null` rather than '' so the panel falls back
    // to its defaults; a BrandingText is omitted entirely when both langs are blank.
    const trim = (v: string) => (v.trim() ? v.trim() : null);
    const toText = (text: { en: string; fr: string }): BrandingText | null => {
      const en = trim(text.en);
      const fr = trim(text.fr);
      return (en ?? fr) ? { en, fr } : null;
    };
    // Drop blank/partial resource links so we never persist half-filled rows.
    const cleanedLinks = form.resourceLinks
      .map((l) => ({
        href: l.href.trim(),
        label: { en: trim(l.label.en), fr: trim(l.label.fr) }
      }))
      .filter((l) => l.href && (l.label.en ?? l.label.fr));
    // Capture the snapshot at submit time so a concurrent edit during the
    // request doesn't get marked clean if the user typed while saving.
    const submittedSnapshot = snapshotForm(form);
    updateSetupStateMutation.mutate(
      {
        branding: {
          boldDetails: form.boldDetails,
          boldName: form.boldName,
          boldResourceLinks: form.boldResourceLinks,
          boldTagline: form.boldTagline,
          customLogoHeight: form.logoSize === 'custom' ? customHeight : null,
          customLogoSrc: form.customLogoSrc.trim() || null,
          customLogoUrl: form.customLogoUrl.trim() || null,
          customLogoWidth: form.logoSize === 'custom' ? customWidth : null,
          customPrimaryColor: form.loginTheme === 'custom' ? form.customPrimaryColor : null,
          customSecondaryColor: form.loginTheme === 'custom' ? form.customSecondaryColor : null,
          detailsFontSize: form.detailsFontSize,
          enableBranding: form.enableBranding,
          instanceDetails: toText(form.instanceDetails),
          instanceName: toText(form.instanceName),
          instanceTagline: toText(form.instanceTagline),
          loginTheme: form.loginTheme,
          logoAlignment: form.logoAlignment,
          logoSize: form.logoSize,
          logoSource: form.logoSource,
          nameAlignment: form.nameAlignment,
          nameFontSize: form.nameFontSize,
          panelTextColor: HEX_PATTERN.test(form.panelTextColor) ? form.panelTextColor : null,
          resourceLinks: form.showResourceLinks ? cleanedLinks : [],
          resourceLinksFontSize: form.resourceLinksFontSize,
          rightPanelPrimaryColor: form.rightPanelOption === 'custom' ? form.rightPanelPrimaryColor : null,
          rightPanelSecondaryColor: form.rightPanelOption === 'custom' ? form.rightPanelSecondaryColor : null,
          rightPanelTheme: form.rightPanelOption === 'none' ? null : form.rightPanelOption,
          sectionsOrder: form.sectionsOrder,
          showDetails: form.showDetails,
          showFooterLinks: form.showFooterLinks,
          showLogo: form.showLogo,
          showResourceLinks: form.showResourceLinks && cleanedLinks.length > 0,
          showTagline: form.showTagline,
          taglineFontSize: form.taglineFontSize
        }
      },
      {
        onSuccess: () => {
          savedSnapshotRef.current = submittedSnapshot;
        }
      }
    );
  };

  // ── Section card renderer ────────────────────────────────────────────────

  const orderButtons = (section: PanelSection) => {
    const idx = form.sectionsOrder.indexOf(section);
    return (
      <div className="flex shrink-0 gap-0.5">
        <Button
          aria-label={t({ en: 'Move up', fr: 'Haut' })}
          disabled={idx <= 0}
          size="sm"
          type="button"
          variant="ghost"
          onClick={() => moveSection(idx, idx - 1)}
        >
          <ChevronUpIcon className="h-4 w-4" />
        </Button>
        <Button
          aria-label={t({ en: 'Move down', fr: 'Bas' })}
          disabled={idx >= form.sectionsOrder.length - 1}
          size="sm"
          type="button"
          variant="ghost"
          onClick={() => moveSection(idx, idx + 1)}
        >
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  // Font-size dropdown reused by every text section. `null` = use default size.
  const fontSizeField = (id: string, value: null | number, onChange: (v: null | number) => void) => (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{t({ en: 'Font size', fr: 'Taille de police' })}</Label>
      <Select
        value={value === null ? FONT_SIZE_DEFAULT : String(value)}
        onValueChange={(v) => onChange(v === FONT_SIZE_DEFAULT ? null : Number(v))}
      >
        <Select.Trigger className="sm:w-48" id={id}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Group>
            <Select.Item value={FONT_SIZE_DEFAULT}>{t({ en: 'Default', fr: 'Par défaut' })}</Select.Item>
            {FONT_SIZES.map((s) => (
              <Select.Item key={s} value={String(s)}>{`${s} px`}</Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select>
    </div>
  );

  // Bold on/off toggle shown next to a section's "Show" checkbox.
  const boldToggle = (id: string, checked: boolean, onChange: (b: boolean) => void) => (
    <div className="flex items-center gap-2">
      <Checkbox checked={checked} id={id} onCheckedChange={(c) => onChange(c === true)} />
      <Label className="cursor-pointer text-sm font-normal" htmlFor={id}>
        {t({ en: 'Bold', fr: 'Gras' })}
      </Label>
    </div>
  );

  const renderSectionCard = (section: PanelSection): React.ReactNode => {
    switch (section) {
      case 'details':
        return (
          <Card key="details">
            <Card.Header>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Card.Title>{t(SECTION_TITLES.details)}</Card.Title>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={form.showDetails}
                        id="showDetails"
                        onCheckedChange={(checked) => update('showDetails', checked === true)}
                      />
                      <Label className="cursor-pointer text-sm font-normal" htmlFor="showDetails">
                        {t({ en: 'Show', fr: 'Afficher' })}
                      </Label>
                    </div>
                    {boldToggle('boldDetails', form.boldDetails, (b) => update('boldDetails', b))}
                  </div>
                  <Card.Description className="mt-1">
                    {t({
                      en: 'Additional notes shown on the branding panel',
                      fr: 'Remarques supplémentaires figurant sur le panneau de marque.'
                    })}
                  </Card.Description>
                </div>
                {orderButtons('details')}
              </div>
            </Card.Header>
            {form.showDetails && (
              <Card.Content className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="instanceDetails-en">{t({ en: 'English', fr: 'Anglais' })}</Label>
                    <TextArea
                      id="instanceDetails-en"
                      maxLength={300}
                      rows={3}
                      value={form.instanceDetails.en}
                      onChange={(e) => updateText('instanceDetails', 'en', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="instanceDetails-fr">{t({ en: 'French', fr: 'Français' })}</Label>
                    <TextArea
                      id="instanceDetails-fr"
                      maxLength={300}
                      rows={3}
                      value={form.instanceDetails.fr}
                      onChange={(e) => updateText('instanceDetails', 'fr', e.target.value)}
                    />
                  </div>
                </div>
                {fontSizeField('detailsFontSize', form.detailsFontSize, (v) => update('detailsFontSize', v))}
              </Card.Content>
            )}
          </Card>
        );

      case 'logo':
        return (
          <Card key="logo">
            <Card.Header>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Card.Title>{t(SECTION_TITLES.logo)}</Card.Title>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={form.showLogo}
                        id="showLogo"
                        onCheckedChange={(checked) => update('showLogo', checked === true)}
                      />
                      <Label className="cursor-pointer text-sm font-normal" htmlFor="showLogo">
                        {t({ en: 'Show', fr: 'Afficher' })}
                      </Label>
                    </div>
                  </div>
                  <Card.Description className="mt-1">
                    {t({
                      en: 'Upload a 1 MB image (SVG, PNG, JPEG) or link to one.',
                      fr: 'Téléversez une image de 1 Mo (SVG, PNG, JPEG) ou indiquez un lien.'
                    })}
                  </Card.Description>
                </div>
                {orderButtons('logo')}
              </div>
            </Card.Header>
            {form.showLogo && (
              <Card.Content className="flex flex-col gap-4">
                {/*
                  An uploaded image and a URL can both be saved at once; the radio
                  selects which one the login page actually renders. The inactive
                  option is dimmed (but still editable) to signal it isn't in use.
                */}
                <RadioGroup value={form.logoSource} onValueChange={(v) => update('logoSource', v as LogoSource)}>
                  {/* Uploaded image slot */}
                  <div
                    className={cn(
                      'flex flex-col gap-3 rounded-md border p-3',
                      form.logoSource !== 'upload' && 'opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroup.Item id="logoSource-upload" value="upload" />
                      <Label className="cursor-pointer font-medium" htmlFor="logoSource-upload">
                        {t({ en: 'Uploaded image', fr: 'Image téléversée' })}
                      </Label>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="bg-muted flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border">
                        {form.customLogoSrc ? (
                          <img
                            alt="Logo preview"
                            className="h-full w-full object-contain p-1"
                            src={form.customLogoSrc}
                          />
                        ) : (
                          <span className="text-muted-foreground text-xs">{t({ en: 'None', fr: 'Aucune' })}</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <input
                          accept="image/png,image/jpeg,image/svg+xml,image/webp"
                          className="hidden"
                          ref={fileInputRef}
                          type="file"
                          onChange={(e) => {
                            handleLogoFile(e.target.files?.[0]);
                            e.target.value = '';
                          }}
                        />
                        <Button size="sm" type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <UploadIcon className="mr-1.5 h-4 w-4" />
                          {t({ en: 'Upload image', fr: 'Téléverser' })}
                        </Button>
                        {/* Clears only the uploaded image; the saved URL is left intact. */}
                        {form.customLogoSrc && (
                          <Button size="sm" type="button" variant="ghost" onClick={() => update('customLogoSrc', '')}>
                            <XIcon className="mr-1.5 h-4 w-4" />
                            {t({ en: 'Remove', fr: 'Retirer' })}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Image URL slot */}
                  <div
                    className={cn(
                      'flex flex-col gap-3 rounded-md border p-3',
                      form.logoSource !== 'url' && 'opacity-60'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroup.Item id="logoSource-url" value="url" />
                      <Label className="cursor-pointer font-medium" htmlFor="logoSource-url">
                        {t({ en: 'Image URL', fr: "URL de l'image" })}
                      </Label>
                    </div>
                    <Input
                      aria-label={t({ en: 'Image URL', fr: "URL de l'image" })}
                      maxLength={2000}
                      placeholder="https://example.org/logo.png"
                      value={form.customLogoUrl}
                      onChange={(e) => update('customLogoUrl', e.target.value)}
                    />
                  </div>
                </RadioGroup>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="logoSize">{t({ en: 'Size', fr: 'Taille' })}</Label>
                    <Select value={form.logoSize} onValueChange={(v) => update('logoSize', v as LogoSize)}>
                      <Select.Trigger id="logoSize">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Group>
                          {LOGO_SIZES.map((s) => (
                            <Select.Item key={s} value={s}>
                              {t(LOGO_SIZE_LABELS[s])}
                            </Select.Item>
                          ))}
                        </Select.Group>
                      </Select.Content>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="logoAlignment">{t({ en: 'Alignment', fr: 'Alignement' })}</Label>
                    <Select
                      value={form.logoAlignment}
                      onValueChange={(v) => update('logoAlignment', v as LogoAlignment)}
                    >
                      <Select.Trigger id="logoAlignment">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Group>
                          {LOGO_ALIGNMENTS.map((a) => (
                            <Select.Item key={a} value={a}>
                              {t(LOGO_ALIGNMENT_LABELS[a])}
                            </Select.Item>
                          ))}
                        </Select.Group>
                      </Select.Content>
                    </Select>
                  </div>
                </div>
                {form.logoSize === 'custom' && (
                  <div className="flex flex-col gap-2">
                    <Label>{t({ en: 'Custom dimensions (pixels)', fr: 'Dimensions personnalisées (pixels)' })}</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        aria-label={t({ en: 'Width', fr: 'Largeur' })}
                        inputMode="numeric"
                        placeholder={t({ en: 'Width', fr: 'Largeur' })}
                        value={form.customLogoWidth}
                        onChange={(e) => update('customLogoWidth', e.target.value.replace(/[^0-9]/g, ''))}
                      />
                      <span className="text-muted-foreground text-sm">×</span>
                      <Input
                        aria-label={t({ en: 'Height', fr: 'Hauteur' })}
                        inputMode="numeric"
                        placeholder={t({ en: 'Height', fr: 'Hauteur' })}
                        value={form.customLogoHeight}
                        onChange={(e) => update('customLogoHeight', e.target.value.replace(/[^0-9]/g, ''))}
                      />
                    </div>
                    {isCustomSizeInvalid && (
                      <p className="text-destructive text-xs">
                        {t({
                          en: 'Enter at least one positive value (1–5000).',
                          fr: 'Entrez au moins une valeur positive (1–5000).'
                        })}
                      </p>
                    )}
                  </div>
                )}
              </Card.Content>
            )}
          </Card>
        );

      case 'name':
        return (
          <Card key="name">
            <Card.Header>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Card.Title>{t(SECTION_TITLES.name)}</Card.Title>
                    {boldToggle('boldName', form.boldName, (b) => update('boldName', b))}
                  </div>
                  <Card.Description className="mt-1">
                    {t({
                      en: 'The primary name shown on the login page.',
                      fr: 'Le nom principal affiché sur la page de connexion.'
                    })}
                  </Card.Description>
                </div>
                {orderButtons('name')}
              </div>
            </Card.Header>
            <Card.Content className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="instanceName-en">{t({ en: 'English', fr: 'Anglais' })}</Label>
                  <Input
                    id="instanceName-en"
                    maxLength={60}
                    placeholder="Open Data Capture"
                    value={form.instanceName.en}
                    onChange={(e) => updateText('instanceName', 'en', e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="instanceName-fr">{t({ en: 'French', fr: 'Français' })}</Label>
                  <Input
                    id="instanceName-fr"
                    maxLength={60}
                    placeholder="Open Data Capture"
                    value={form.instanceName.fr}
                    onChange={(e) => updateText('instanceName', 'fr', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="nameAlignment">{t({ en: 'Alignment', fr: 'Alignement' })}</Label>
                  <Select value={form.nameAlignment} onValueChange={(v) => update('nameAlignment', v as LogoAlignment)}>
                    <Select.Trigger id="nameAlignment">
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        {LOGO_ALIGNMENTS.map((a) => (
                          <Select.Item key={a} value={a}>
                            {t(LOGO_ALIGNMENT_LABELS[a])}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select>
                </div>
                {fontSizeField('nameFontSize', form.nameFontSize, (v) => update('nameFontSize', v))}
              </div>
            </Card.Content>
          </Card>
        );

      case 'resources':
        return (
          <Card key="resources">
            <Card.Header>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Card.Title>{t(SECTION_TITLES.resources)}</Card.Title>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={form.showResourceLinks}
                        id="showResourceLinks"
                        onCheckedChange={(checked) => update('showResourceLinks', checked === true)}
                      />
                      <Label className="cursor-pointer text-sm font-normal" htmlFor="showResourceLinks">
                        {t({ en: 'Show', fr: 'Afficher' })}
                      </Label>
                    </div>
                    {boldToggle('boldResourceLinks', form.boldResourceLinks, (b) => update('boldResourceLinks', b))}
                  </div>
                  <Card.Description className="mt-1">
                    {t({ en: 'Optional links shown on the branding panel.', fr: 'Liens optionnels sur le panneau.' })}
                  </Card.Description>
                </div>
                {orderButtons('resources')}
              </div>
            </Card.Header>
            {form.showResourceLinks && (
              <Card.Content className="flex flex-col gap-3">
                {form.resourceLinks.length === 0 && (
                  <p className="text-muted-foreground text-sm">
                    {t({ en: 'No links yet. Add one to get started.', fr: "Aucun lien pour l'instant." })}
                  </p>
                )}
                {form.resourceLinks.map((link, index) => {
                  const hrefInvalid = link.href.trim() !== '' && !URL_PATTERN.test(link.href.trim());
                  return (
                    <div className="flex flex-col gap-2 rounded-md border p-3" key={index}>
                      <div className="flex items-start justify-between gap-2">
                        <Label className="text-sm font-medium">
                          {t({ en: `Link ${index + 1}`, fr: `Lien ${index + 1}` })}
                        </Label>
                        <Button
                          aria-label={t({ en: 'Remove', fr: 'Retirer' })}
                          size="sm"
                          type="button"
                          variant="ghost"
                          onClick={() => removeResourceLink(index)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input
                          aria-label={t({ en: 'Label (English)', fr: 'Libellé (anglais)' })}
                          maxLength={120}
                          placeholder={t({ en: 'Label (English)', fr: 'Libellé (anglais)' })}
                          value={link.label.en}
                          onChange={(e) => updateResourceLinkLabel(index, 'en', e.target.value)}
                        />
                        <Input
                          aria-label={t({ en: 'Label (French)', fr: 'Libellé (français)' })}
                          maxLength={120}
                          placeholder={t({ en: 'Label (French)', fr: 'Libellé (français)' })}
                          value={link.label.fr}
                          onChange={(e) => updateResourceLinkLabel(index, 'fr', e.target.value)}
                        />
                      </div>
                      <Input
                        aria-invalid={hrefInvalid}
                        aria-label="URL"
                        maxLength={2000}
                        placeholder="https://example.org"
                        value={link.href}
                        onChange={(e) => updateResourceLinkHref(index, e.target.value)}
                      />
                      {hrefInvalid && (
                        <p className="text-destructive text-xs">
                          {t({
                            en: 'URL must start with http:// or https:// and include a domain (e.g. example.com).',
                            fr: "L'URL doit commencer par http:// ou https:// et inclure un domaine (ex. example.com)."
                          })}
                        </p>
                      )}
                    </div>
                  );
                })}
                <Button className="self-start" size="sm" type="button" variant="outline" onClick={addResourceLink}>
                  <PlusIcon className="mr-1.5 h-4 w-4" />
                  {t({ en: 'Add link', fr: 'Ajouter un lien' })}
                </Button>
                {fontSizeField('resourceLinksFontSize', form.resourceLinksFontSize, (v) =>
                  update('resourceLinksFontSize', v)
                )}
              </Card.Content>
            )}
          </Card>
        );

      case 'tagline':
        return (
          <Card key="tagline">
            <Card.Header>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Card.Title>{t(SECTION_TITLES.tagline)}</Card.Title>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={form.showTagline}
                        id="showTagline"
                        onCheckedChange={(checked) => update('showTagline', checked === true)}
                      />
                      <Label className="cursor-pointer text-sm font-normal" htmlFor="showTagline">
                        {t({ en: 'Show', fr: 'Afficher' })}
                      </Label>
                    </div>
                    {boldToggle('boldTagline', form.boldTagline, (b) => update('boldTagline', b))}
                  </div>
                  <Card.Description className="mt-1">
                    {t({
                      en: 'A short description shown on the branding panel',
                      fr: 'Une courte description figurant sur le panneau de marque.'
                    })}
                  </Card.Description>
                </div>
                {orderButtons('tagline')}
              </div>
            </Card.Header>
            {form.showTagline && (
              <Card.Content className="flex flex-col gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="instanceTagline-en">{t({ en: 'English', fr: 'Anglais' })}</Label>
                    <TextArea
                      id="instanceTagline-en"
                      maxLength={300}
                      rows={2}
                      value={form.instanceTagline.en}
                      onChange={(e) => updateText('instanceTagline', 'en', e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="instanceTagline-fr">{t({ en: 'French', fr: 'Français' })}</Label>
                    <TextArea
                      id="instanceTagline-fr"
                      maxLength={300}
                      rows={2}
                      value={form.instanceTagline.fr}
                      onChange={(e) => updateText('instanceTagline', 'fr', e.target.value)}
                    />
                  </div>
                </div>
                {fontSizeField('taglineFontSize', form.taglineFontSize, (v) => update('taglineFontSize', v))}
              </Card.Content>
            )}
          </Card>
        );

      default:
        return null;
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <React.Fragment>
      {/*
        `overflow-x-clip` prevents any unintended horizontal overflow on this
        page (e.g. from very long URLs in an Input). We use `clip` rather than
        `hidden` because hidden would create a scrolling context that breaks
        the `lg:sticky` preview column inside this wrapper.
      */}
      <div className="w-full overflow-x-clip">
        <PageHeader>
          <Heading className="text-center" variant="h2">
            {t({ en: 'Customize Login Page', fr: 'Personnaliser la page de connexion' })}
          </Heading>
        </PageHeader>

        <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Stop Enter in a text input from submitting the whole form (it should
            only submit via the explicit Save button). The key handler lives on
            the <form> deliberately, hence the a11y rule is disabled here. */}
          {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
          <form
            className="flex flex-col gap-6"
            id={FORM_ID}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') e.preventDefault();
            }}
            onSubmit={handleSubmit}
          >
            {/* Enable / disable branding toggle */}
            <Card>
              <Card.Header>
                <Card.Title>
                  {t({ en: 'Enable Custom Login Page', fr: 'Activer la page de connexion personnalisée' })}
                </Card.Title>
                <Card.Description>
                  {t({
                    en: 'When disabled, the classic Open Data Capture login page is shown instead.',
                    fr: "Lorsque désactivé, la page de connexion classique d'Open Data Capture est affichée."
                  })}
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={form.enableBranding}
                    id="enableBranding"
                    onCheckedChange={(checked) => update('enableBranding', checked === true)}
                  />
                  <Label className="cursor-pointer" htmlFor="enableBranding">
                    {t({ en: 'Enable', fr: 'Activer' })}
                  </Label>
                </div>
              </Card.Content>
            </Card>

            {/* Orderable section cards */}
            {form.sectionsOrder.map(renderSectionCard)}

            {/* ── Footer ────────────────────────────────────────── */}
            <Card>
              <Card.Header>
                <Card.Title>{t({ en: 'Footer', fr: 'Pied de page' })}</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={form.showFooterLinks}
                    id="showFooterLinks"
                    onCheckedChange={(checked) => update('showFooterLinks', checked === true)}
                  />
                  <Label className="cursor-pointer" htmlFor="showFooterLinks">
                    {t({ en: 'Show GitHub and documentation links', fr: 'Afficher les liens GitHub et documentation' })}
                  </Label>
                </div>
              </Card.Content>
            </Card>

            {/* ── Background Theme - Left Panel ─────────────────── */}
            <Card>
              <Card.Header>
                <Card.Title>
                  {t({ en: 'Background Theme - Left Panel', fr: "Thème d'arrière-plan - Panneau gauche" })}
                </Card.Title>
                <Card.Description>
                  {t({
                    en: 'The gradient shown behind the branding panel.',
                    fr: 'Le dégradé affiché derrière le panneau.'
                  })}
                </Card.Description>
              </Card.Header>
              <Card.Content className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {LOGIN_THEMES.map((theme) => {
                    const isSelected = form.loginTheme === theme;
                    const swatchBranding: BrandingConfig =
                      theme === 'custom'
                        ? {
                            customPrimaryColor: form.customPrimaryColor,
                            customSecondaryColor: form.customSecondaryColor,
                            loginTheme: 'custom'
                          }
                        : { loginTheme: theme };
                    return (
                      <button
                        className={cn(
                          'flex flex-col gap-1.5 rounded-lg border p-1.5 text-left transition-all',
                          isSelected ? 'border-primary ring-primary/40 ring-2' : 'border-input hover:border-primary/50'
                        )}
                        key={theme}
                        type="button"
                        onClick={() => update('loginTheme', theme)}
                      >
                        <span
                          className="h-12 w-full rounded-md"
                          style={{ backgroundImage: getLoginGradient(swatchBranding) }}
                        />
                        <span className="text-xs font-medium">{t(THEME_LABELS[theme])}</span>
                      </button>
                    );
                  })}
                </div>
                {form.loginTheme === 'custom' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(['customPrimaryColor', 'customSecondaryColor'] as const).map((key) => {
                      const value = form[key];
                      const isInvalid = !HEX_PATTERN.test(value);
                      return (
                        <div className="flex flex-col gap-2" key={key}>
                          <Label htmlFor={key}>
                            {key === 'customPrimaryColor'
                              ? t({ en: 'Gradient Start', fr: 'Début du dégradé' })
                              : t({ en: 'Gradient End', fr: 'Fin du dégradé' })}
                          </Label>
                          <div className="flex items-center gap-2">
                            <input
                              aria-label={key}
                              className="border-input h-9 w-10 shrink-0 cursor-pointer rounded-md border bg-transparent"
                              type="color"
                              value={HEX_PATTERN.test(value) ? value : '#000000'}
                              onChange={(e) => update(key, e.target.value)}
                            />
                            <Input
                              id={key}
                              placeholder="#0ea5e9"
                              value={value}
                              onChange={(e) => update(key, e.target.value)}
                            />
                          </div>
                          {isInvalid && (
                            <p className="text-destructive text-xs">
                              {t({ en: 'Enter a valid hex color.', fr: 'Entrez une couleur hexadécimale valide.' })}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* ── Text Color - Left Panel ───────────────────────── */}
            {/*
            A single color applied to every text element on the branding panel.
            Shown directly (no enable toggle) pre-filled with the default light
            color, so an admin can just tweak it. The native color input drives
            the hex text field and vice-versa; an invalid hex disables Save.
          */}
            <Card>
              <Card.Header>
                <Card.Title>{t({ en: 'Text Color - Left Panel', fr: 'Couleur du texte - Panneau gauche' })}</Card.Title>
                <Card.Description>
                  {t({
                    en: 'The color applied to all text on the branding panel.',
                    fr: 'La couleur appliquée à tout le texte du panneau.'
                  })}
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="flex flex-col gap-2 sm:max-w-xs">
                  <Label htmlFor="panelTextColor">{t({ en: 'Text color', fr: 'Couleur du texte' })}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      aria-label="panelTextColor"
                      className="border-input h-9 w-10 shrink-0 cursor-pointer rounded-md border bg-transparent"
                      type="color"
                      value={HEX_PATTERN.test(form.panelTextColor) ? form.panelTextColor : DEFAULT_PANEL_TEXT_COLOR}
                      onChange={(e) => update('panelTextColor', e.target.value)}
                    />
                    <Input
                      id="panelTextColor"
                      placeholder={DEFAULT_PANEL_TEXT_COLOR}
                      value={form.panelTextColor}
                      onChange={(e) => update('panelTextColor', e.target.value)}
                    />
                  </div>
                  {isPanelTextColorInvalid && (
                    <p className="text-destructive text-xs">
                      {t({ en: 'Enter a valid hex color.', fr: 'Entrez une couleur hexadécimale valide.' })}
                    </p>
                  )}
                </div>
              </Card.Content>
            </Card>

            {/* ── Background Theme - Right Panel ────────────────── */}
            <Card>
              <Card.Header>
                <Card.Title>
                  {t({ en: 'Background Theme - Right Panel', fr: "Thème d'arrière-plan - Panneau droit" })}
                </Card.Title>
                <Card.Description>
                  {t({
                    en: 'The gradient applied behind the login form.',
                    fr: 'Le dégradé appliqué derrière le formulaire de connexion.'
                  })}
                </Card.Description>
              </Card.Header>
              <Card.Content className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {RIGHT_PANEL_OPTIONS.map((option) => {
                    const isSelected = form.rightPanelOption === option;
                    const swatchStyle =
                      option === 'none'
                        ? {
                            backgroundImage: 'repeating-linear-gradient(45deg, #e2e8f0 0 8px, #cbd5e1 8px 16px)'
                          }
                        : {
                            backgroundImage: getRightPanelGradient({
                              rightPanelTheme: option,
                              ...(option === 'custom'
                                ? {
                                    rightPanelPrimaryColor: form.rightPanelPrimaryColor,
                                    rightPanelSecondaryColor: form.rightPanelSecondaryColor
                                  }
                                : {})
                            })!
                          };
                    return (
                      <button
                        className={cn(
                          'flex flex-col gap-1.5 rounded-lg border p-1.5 text-left transition-all',
                          isSelected ? 'border-primary ring-primary/40 ring-2' : 'border-input hover:border-primary/50'
                        )}
                        key={option}
                        type="button"
                        onClick={() => update('rightPanelOption', option)}
                      >
                        <span className="h-12 w-full rounded-md" style={swatchStyle} />
                        <span className="text-xs font-medium">{t(RIGHT_PANEL_LABELS[option])}</span>
                      </button>
                    );
                  })}
                </div>
                {form.rightPanelOption === 'custom' && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(['rightPanelPrimaryColor', 'rightPanelSecondaryColor'] as const).map((key) => {
                      const value = form[key];
                      const isInvalid = !HEX_PATTERN.test(value);
                      return (
                        <div className="flex flex-col gap-2" key={key}>
                          <Label htmlFor={key}>
                            {key === 'rightPanelPrimaryColor'
                              ? t({ en: 'Gradient Start', fr: 'Début du dégradé' })
                              : t({ en: 'Gradient End', fr: 'Fin du dégradé' })}
                          </Label>
                          <div className="flex items-center gap-2">
                            <input
                              aria-label={key}
                              className="border-input h-9 w-10 shrink-0 cursor-pointer rounded-md border bg-transparent"
                              type="color"
                              value={HEX_PATTERN.test(value) ? value : '#ffffff'}
                              onChange={(e) => update(key, e.target.value)}
                            />
                            <Input
                              id={key}
                              placeholder="#0ea5e9"
                              value={value}
                              onChange={(e) => update(key, e.target.value)}
                            />
                          </div>
                          {isInvalid && (
                            <p className="text-destructive text-xs">
                              {t({ en: 'Enter a valid hex color.', fr: 'Entrez une couleur hexadécimale valide.' })}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card.Content>
            </Card>
          </form>

          {/* ── Right column: Live Preview + Save ─────────────── */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {/* Preview header */}
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-muted-foreground">{t({ en: 'Live Preview', fr: 'Aperçu en direct' })}</Label>
              <div className="flex items-center gap-1">
                {/* Language toggle — drives `previewLang` state; no content panes needed */}
                <Tabs value={previewLang} onValueChange={(v) => setPreviewLang(v as 'en' | 'fr')}>
                  <Tabs.List className="h-7 p-0.5">
                    <Tabs.Trigger className="h-6 px-2 text-xs" value="en">
                      EN
                    </Tabs.Trigger>
                    <Tabs.Trigger className="h-6 px-2 text-xs" value="fr">
                      FR
                    </Tabs.Trigger>
                  </Tabs.List>
                </Tabs>
                <Button
                  aria-label={t({ en: 'Fullscreen preview', fr: 'Aperçu plein écran' })}
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => setShowFullscreen(true)}
                >
                  <MaximizeIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Preview card — mirrors the actual login page layout: two-panel when
                branding is enabled, centered single-panel when disabled. */}
            <div className="bg-background flex aspect-[4/3] w-full overflow-hidden rounded-xl border shadow-sm">
              {form.enableBranding && (
                <LoginBrandingPanel
                  preview
                  branding={previewBranding}
                  className="hidden w-3/5 overflow-hidden sm:flex"
                  lang={previewLang}
                />
              )}
              <div
                className={cn(
                  'bg-background flex flex-col items-center justify-center gap-3 p-6',
                  form.enableBranding ? 'w-full sm:w-2/5' : 'w-full'
                )}
                style={
                  form.enableBranding && getRightPanelGradient(previewBranding)
                    ? { backgroundImage: getRightPanelGradient(previewBranding)! }
                    : undefined
                }
              >
                <div className="bg-muted h-8 w-8 rounded-full" />
                <div className="bg-foreground/80 h-2.5 w-20 rounded" />
                <div className={cn('bg-muted h-7 rounded-md', form.enableBranding ? 'w-full' : 'w-2/5')} />
                <div className={cn('bg-muted h-7 rounded-md', form.enableBranding ? 'w-full' : 'w-2/5')} />
                <div className={cn('bg-primary h-7 rounded-md', form.enableBranding ? 'w-full' : 'w-2/5')} />
              </div>
            </div>

            {/* Save button — centered below preview */}
            <div className="mt-10 flex justify-center">
              <Button className="min-w-40" disabled={isSubmitDisabled} form={FORM_ID} type="submit">
                {t('core.save')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/*
        Fullscreen preview — driven by `showFullscreen`. libui's `Dialog`
        handles the portal, overlay, focus trap, ESC-to-close, click-outside
        dismiss, and the close button (top-right X) consistently with every
        other dialog in the app. The className overrides stretch the default
        centered modal to fill the viewport so the two-panel mock fits edge to
        edge.
      */}
      <Dialog open={showFullscreen} onOpenChange={setShowFullscreen}>
        <Dialog.Content
          className="inset-0 flex h-full max-h-screen w-full max-w-full translate-x-0 translate-y-0 gap-0 overflow-hidden border-0 p-0 shadow-none sm:max-w-full sm:rounded-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Dialog.Title className="sr-only">
            {t({ en: 'Login page fullscreen preview', fr: 'Aperçu plein écran de la page de connexion' })}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            {t({
              en: 'A full-screen preview of how the login page will appear to users with the current branding settings.',
              fr: 'Un aperçu plein écran de la page de connexion telle que les utilisateurs la verront avec les paramètres de personnalisation actuels.'
            })}
          </Dialog.Description>
          {/* Left — branding panel */}
          {form.enableBranding && (
            <LoginBrandingPanel
              branding={previewBranding}
              className="flex w-1/2 overflow-y-auto xl:w-3/5"
              lang={previewLang}
            />
          )}
          {/* Right — actual login form mockup */}
          <div
            className={cn(
              'bg-background relative flex flex-col items-center justify-center overflow-y-auto p-8',
              form.enableBranding ? 'w-1/2 xl:w-2/5' : 'w-full'
            )}
            style={
              form.enableBranding && getRightPanelGradient(previewBranding)
                ? { backgroundImage: getRightPanelGradient(previewBranding)! }
                : undefined
            }
          >
            <Card className="w-full max-w-sm border-none shadow-none">
              <Card.Header className="flex flex-col items-center justify-center pb-2">
                <Logo className="m-1.5 h-auto w-14" variant="auto" />
                <Heading variant="h2">{previewLang === 'fr' ? 'Se connecter' : 'Login'}</Heading>
              </Card.Header>
              <Card.Content className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>{previewLang === 'fr' ? "Nom d'utilisateur" : 'Username'}</Label>
                  <Input disabled placeholder={previewLang === 'fr' ? "Nom d'utilisateur" : 'Username'} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>{previewLang === 'fr' ? 'Mot de passe' : 'Password'}</Label>
                  <Input disabled placeholder="••••••••" type="password" />
                </div>
                <Button disabled className="mt-1 w-full">
                  {previewLang === 'fr' ? 'Se connecter' : 'Login'}
                </Button>
              </Card.Content>
            </Card>
          </div>
        </Dialog.Content>
      </Dialog>

      {/* Unsaved-changes confirmation — shown when the user tries to navigate
          away while dirty. "No" is auto-focused so Enter keeps them on the page. */}
      <Dialog open={blocker.status === 'blocked'} onOpenChange={() => blocker.reset?.()}>
        <Dialog.Content>
          <Dialog.Title>{t({ en: 'Unsaved Changes', fr: 'Modifications non enregistrées' })}</Dialog.Title>
          <Dialog.Description>
            {t({
              en: 'You have unsaved changes. Are you sure you want to leave? Your changes will be lost. Select "No" and click the X in the top-right corner to keep your changes.',
              fr: 'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter ? Vos modifications seront perdues. Sélectionnez « Non » et cliquez sur le X en haut à droite pour conserver vos modifications.'
            })}
          </Dialog.Description>
          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => blocker.proceed?.()}>
              {t({ en: 'Yes', fr: 'Oui' })}
            </Button>
            {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
            <Button autoFocus type="button" onClick={() => blocker.reset?.()}>
              {t({ en: 'No', fr: 'Non' })}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog>
    </React.Fragment>
  );
};

export const Route = createFileRoute('/_app/admin/branding/login-page')({
  component: RouteComponent
});
