import { defineInstrument } from '/runtime/v1/@opendatacapture/runtime-core';
import { z } from '/runtime/v1/zod@3.x';

export default defineInstrument({
  kind: 'FORM',
  language: ['en', 'fr'],
  tags: {
    en: ['Consent'],
    fr: ['Consentement']
  },
  internal: {
    edition: 1,
    name: 'DNP_GENERAL_CONSENT_FORM'
  },
  content: [
    {
      kind: 'block',
      render: () => (
        <div className="text-muted-foreground space-y-2 text-sm" data-testid="consent-preamble">
          <p>
            WHEREAS the party of the first part, hereinafter and forever referred to as &ldquo;the Participant&rdquo;,
            enters into the within arrangement of their own volition and without duress; and WHEREAS the recitals set
            forth above are hereby incorporated by reference as though fully restated at length herein; NOW THEREFORE,
            in consideration of the mutual covenants contained herein, the receipt and sufficiency of which are hereby
            acknowledged, the parties do covenant and agree as hereinafter provided.
          </p>
          <p>
            Nothing contained in this preamble shall be construed to create, imply, or give rise to any obligation,
            right, or remedy not otherwise existing at law or in equity, nor to modify, waive, supersede, or otherwise
            affect any provision hereof. The headings appearing herein are inserted for convenience of reference only
            and shall in no way define, limit, or describe the scope or intent of any clause. Any term left undefined
            shall bear the meaning ordinarily ascribed to it, save where the context manifestly requires otherwise.
          </p>
        </div>
      )
    },
    {
      title: {
        en: 'Terms and Conditions',
        fr: 'Conditions générales'
      },
      description: {
        en: 'You agree that all data you enter into our system will become the property of the Douglas Neuroinformatics Platform. You grant us full ownership of this data, allowing us to use, analyze, distribute, and share it for any purpose, including but not limited to research and performance improvement.',
        fr: "Vous acceptez que toutes les données que vous entrez dans notre système deviennent la propriété du Douglas Neuroinformatics Platform. Vous nous accordez la pleine propriété de ces données, ce qui nous permet de les utiliser, de les analyser, de les distribuer et de les partager à toutes fins, y compris, mais sans s'y limiter, à des fins de recherche et d'amélioration des performances."
      },
      fields: {
        consent: {
          kind: 'boolean',
          label: {
            en: 'Do you accept the above terms?',
            fr: 'Acceptez-vous les conditions ci-dessus ?'
          },
          options: {
            en: {
              false: 'I decline the terms',
              true: 'I have read, understand, and accept the above terms'
            },
            fr: {
              false: 'Je refuse les conditions',
              true: "J'ai lu, compris et accepté les conditions ci-dessus"
            }
          },
          variant: 'radio'
        }
      }
    }
  ],
  clientDetails: {
    estimatedDuration: 1
  },
  details: {
    description: {
      en: 'The general consent form asks participants if they consent to their data being used for any purpose. This is intended for demo purposes and is not recommended for real-world research projects.',
      fr: "Le formulaire de consentement général demande aux participants s'ils acceptent que leurs données soient utilisées à quelque fin que ce soit. Ce formulaire est destiné à des fins de démonstration et n'est pas recommandé pour des projets de recherche réels."
    },
    license: 'Apache-2.0',
    title: {
      en: 'General Consent Form',
      fr: 'Formulaire de consentement général'
    }
  },
  measures: null,
  validationSchema: z.object({
    consent: z.boolean()
  })
});
