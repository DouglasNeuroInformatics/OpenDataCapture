---
type: article
title: 'Open Data Capture v2.0: Capturing Files, Not Just Forms'
description: 'Open Data Capture v2.0 introduces file instruments, letting researchers collect uploaded files — from a single consent PDF to a complete multi-file MRI scan session — alongside the structured and interactive instruments you already use. Here is what is new and how it works.'
author: joshua-unrau
language: en
datePublished: 2026-06-11
isDraft: false
---

Since its first release, Open Data Capture has been built around two kinds of instruments: **forms**, for structured questionnaire-style data, and **interactive instruments**, for richer, code-driven tasks. Both produce structured records that live in the database. But not all research data fits neatly into a JSON document. Sometimes the data _is_ a file — a signed consent form, a spreadsheet of behavioural results, or the raw output of an imaging session.

With **v2.0**, Open Data Capture introduces a third kind of instrument: the **file instrument**.

## What is a file instrument?

A file instrument collects one or more uploaded files as a participant's response, instead of form fields. Like every other instrument, it is versioned, assigned to subjects and sessions, and governed by the same fine-grained access controls — but its "data" is a set of files rather than a set of answers.

Each file instrument defines one or more **file groups**, and each group declares:

- a **basename** that identifies the group,
- an allowed **file type** (documents, images, spreadsheets, structured data, or arbitrary binary), and
- a **count** — a minimum and maximum number of files the group accepts.

That small amount of structure covers a wide range of real-world needs. A consent instrument might define a single group that accepts exactly one PDF. An imaging instrument can define a group that accepts anywhere from one to twenty files in a single submission. To make this concrete, v2.0 ships two example instruments out of the box:

- **Arbitrary Single File** — the simplest case: upload one file of any type.
- **MRI Scan Session** — a multi-file group modelling a complete scan session.

## How it works under the hood

Files are fundamentally different from form responses, and v2.0 treats them that way. Rather than pushing large binary payloads through the API and into the database, Open Data Capture stores files in **S3-compatible object storage** and keeps only lightweight **metadata** (file name, size, and its place within a group) in the database.

Uploads and downloads happen **directly between the browser and the storage service** using short-lived **presigned URLs**:

1. When a participant opens a file instrument, the API issues presigned upload URLs scoped to that specific record.
2. The browser uploads each file straight to storage, with a progress bar and a navigation guard so a half-finished upload isn't lost by an accidental click.
3. Once every file is in place, the client confirms completion and the record is finalized.

Downloads work the same way in reverse: the API hands out short-lived, access-controlled URLs, and files are served with an `attachment` content disposition so they download rather than render in the browser.

This design keeps large transfers off the API server, so collecting a multi-gigabyte scan session doesn't tie up application resources the way streaming it through the backend would.

## Security and access control

File instruments inherit Open Data Capture's existing permission model. Access to a record's files is scoped through the same group- and record-level abilities that protect every other record, and presigned URLs are short-lived by design — minutes, not hours. Files are namespaced per group and per record in storage, and download links expire well before they could be casually shared.

## Opt-in and fully backward compatible

Upgrading to v2.0 is **non-breaking**. Object storage is **opt-in** through a single `STORAGE_ENABLED` flag, which defaults to off. Existing deployments upgrade and run exactly as before — every form and interactive instrument behaves identically, and nothing new is required until you decide you want file instruments.

When you're ready, you have two options:

- **Use the bundled storage service.** The default Docker Compose stack now ships a self-hosted, S3-compatible [RustFS](https://rustfs.com) service. Flip `STORAGE_ENABLED` to `true`, provide a set of credentials (the setup script can generate them for you), and you're done.
- **Bring your own S3.** Point Open Data Capture at any managed S3-compatible bucket — AWS S3, MinIO, or another provider — and drop the bundled service entirely.

Because storage is opt-in, the rest of the application never depends on it. If a file instrument is used while storage is disabled, the API returns a clear, actionable error rather than failing to start.

## Getting started

If you're running Open Data Capture, see the [v2.0.0 migration guide](https://opendatacapture.org/docs/updating/v2.0.0) for the exact upgrade steps, the new environment variables, and notes on backing up your storage volume.

File instruments close the gap between structured data capture and the files that real research produces. We're excited to see what you collect with them.
