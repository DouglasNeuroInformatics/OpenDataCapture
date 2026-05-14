import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x/v4';

export default defineInstrument({
  kind: 'FILE',
  language: ['en', 'fr'],
  tags: {
    en: ['File', 'Neuroimaging', 'MRI'],
    fr: ['Fichier', 'Neuroimagerie', 'IRM']
  },
  internal: {
    edition: 1,
    name: 'MRI_SCAN_SESSION'
  },
  content: {
    fileGroups: [
      {
        basename: 'rawScans',
        count: {
          max: 20,
          min: 1
        },
        type: 'application/octet-stream',
        label: {
          en: 'Raw DICOM Scans',
          fr: 'Scans DICOM bruts'
        }
      },
      {
        basename: 'radiologistReport',
        count: {
          max: 1,
          min: 1
        },
        type: 'application/pdf',
        label: {
          en: 'Radiologist Report',
          fr: 'Rapport du radiologue'
        }
      }
    ]
  },
  measures: null,
  details: {
    description: {
      en: 'Upload the raw DICOM files from an MRI session along with the radiologist report PDF.',
      fr: 'Téléchargez les fichiers DICOM bruts d’une séance d’IRM accompagnés du rapport du radiologue en PDF.'
    },
    license: 'Apache-2.0',
    title: {
      en: 'MRI Scan Session',
      fr: 'Séance d’IRM'
    }
  },
  validationSchema: z.any()
});
