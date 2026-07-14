import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useNotificationsStore, useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { PANEL_SECTIONS } from '@opendatacapture/schemas/setup';
import type { BrandingConfig, BrandingText } from '@opendatacapture/schemas/setup';
import { useBlocker } from '@tanstack/react-router';

import { useSetupStateQuery } from '@/hooks/useSetupStateQuery';
import { useUpdateSetupStateMutation } from '@/hooks/useUpdateSetupStateMutation';
import { LOGIN_THEME_COLORS } from '@/utils/branding';

import {
  DEFAULT_PANEL_TEXT_COLOR,
  DEFAULT_SECTIONS_ORDER,
  HEX_PATTERN,
  MAX_LOGO_BYTES,
  RIGHT_PANEL_OPTIONS,
  URL_PATTERN
} from './constants';

import type { RightPanelOption } from './constants';
import type { FormState } from './types';

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

const parseDimension = (v: string): null | number => {
  const n = Number.parseInt(v.trim(), 10);
  return !v.trim() || Number.isNaN(n) || n <= 0 || n > 5000 ? null : n;
};

/**
 * Owns all login-page branding editor state: the live `form`, every mutation
 * helper, the derived validation flags, the live-preview branding object, the
 * submit handler, and the unsaved-changes blocker. Returns a single object so it
 * can be threaded to the editor's child components without prop-drilling each field.
 */
export const useBrandingForm = () => {
  const { t } = useTranslation();
  const addNotification = useNotificationsStore((store) => store.addNotification);
  const setupStateQuery = useSetupStateQuery();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateText = (
    field: 'instanceDetails' | 'instanceName' | 'instanceTagline',
    lang: 'en' | 'fr',
    value: string
  ) => setForm((prev) => ({ ...prev, [field]: { ...prev[field], [lang]: value } }));

  const updateResourceLinkHref = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      resourceLinks: prev.resourceLinks.map((l, i) => (i === index ? { ...l, href: value } : l))
    }));
  };

  const updateResourceLinkLabel = (index: number, lang: 'en' | 'fr', value: string) => {
    setForm((prev) => ({
      ...prev,
      resourceLinks: prev.resourceLinks.map((l, i) =>
        i === index ? { ...l, label: { ...l.label, [lang]: value } } : l
      )
    }));
  };

  const addResourceLink = () => {
    setForm((prev) => ({
      ...prev,
      resourceLinks: [...prev.resourceLinks, { href: '', label: { en: '', fr: '' } }]
    }));
  };

  const removeResourceLink = (index: number) => {
    setForm((prev) => ({ ...prev, resourceLinks: prev.resourceLinks.filter((_, i) => i !== index) }));
  };

  const moveSection = (fromIndex: number, toIndex: number) => {
    setForm((prev) => {
      const order = [...prev.sectionsOrder];
      const [item] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, item!);
      return { ...prev, sectionsOrder: order };
    });
  };

  const handleLogoFile = (file: File | undefined) => {
    if (!file) {
      return;
    } else if (file.size > MAX_LOGO_BYTES) {
      addNotification({
        message: t({ en: 'The selected image is larger than 5 MB.', fr: "L'image sélectionnée dépasse 5 Mo." }),
        title: t({ en: 'File too large', fr: 'Fichier trop volumineux' }),
        type: 'error'
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update('customLogoSrc', reader.result as string);
    reader.readAsDataURL(file);
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

  return {
    addResourceLink,
    blocker,
    customHeight,
    customWidth,
    fileInputRef,
    form,
    handleLogoFile,
    handleSubmit,
    hasInvalidResourceLinks,
    isCustomColorInvalid,
    isCustomSizeInvalid,
    isPanelTextColorInvalid,
    isRightPanelCustomColorInvalid,
    isSubmitDisabled,
    moveSection,
    previewBranding,
    removeResourceLink,
    update,
    updateResourceLinkHref,
    updateResourceLinkLabel,
    updateText
  };
};

export type BrandingEditor = ReturnType<typeof useBrandingForm>;
