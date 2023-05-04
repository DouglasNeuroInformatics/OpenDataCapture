# Creating Instruments

All instruments are stored within the database and contain the information necessary to render the instrument to the user and validate the data received through the API.

Users with permission to create objects of type `Instrument` may do so through two methods:

1. Through a graphical web-based tool
2. Programmatically using the API

## Creating Forms

### Web-Based Method

Regarding the first method, instructions are provided in the GUI and so are not detailed here.

### Programmatic Method

For programmatic users, you submit a `POST` request to `/v1/instruments/forms` with the necessary body. Although this is possible in any programming language, it is recommended to use either TypeScript or JavaScript to take advantage of our type definitions.

#### Example

This example assumed that Node (v18+) is installed on your system and that you are using VSCode.

First, set your login credentials:

```shell
export DDCP_USERNAME=admin
export DDCP_PASSWORD=password
```

Then, create a new npm package:

```shell
mkdir create-instruments
cd create-instruments
npm init -y
```

Create your script, for example:

**index.js**
```javascript
// @ts-check
const process = require('node:process');

const { createTranslatedForms } = require('@douglasneuroinformatics/instruments');

// Change as needed depending on deployment
const API_BASE_URL = 'http://localhost:5500/v1';

/**
 * @typedef Data
 * @type {object}
 * @property {number} overallHappiness
 */

/** @type { import('@douglasneuroinformatics/common').MultilingualForm<Data> } */
const multilingualForm = {
  name: 'HappinessQuestionnaire',
  tags: ['Well-Being'],
  version: 1,
  details: {
    title: {
      en: 'Happiness Questionnaire',
      fr: 'Questionnaire sur le bonheur'
    },
    description: {
      en: 'The Happiness Questionnaire is a questionnaire about happiness.',
      fr: 'Le questionnaire sur le bonheur est un questionnaire sur le bonheur.'
    },
    instructions: {
      en: 'Please answer the question based on your current feelings.',
      fr: 'Veuillez répondre à la question en fonction de vos sentiments actuels.'
    },
    estimatedDuration: 1
  },
  content: {
    overallHappiness: {
      kind: 'numeric',
      label: {
        en: 'Overall Happiness',
        fr: 'Bonheur général'
      },
      description: {
        en: 'Overall happiness from 1 through 10 (inclusive)',
        fr: 'Bonheur général de 1 à 10 (inclus)'
      },
      isRequired: true,
      min: 0,
      max: 10,
      variant: 'slider'
    }
  },
  validationSchema: {
    type: 'object',
    properties: {
      overallHappiness: {
        type: 'integer',
        minimum: 1,
        maximum: 10
      }
    },
    required: ['overallHappiness']
  }
};

async function main() {
  const forms = createTranslatedForms(multilingualForm);

  const response = await fetch(API_BASE_URL + '/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: process.env['DDCP_USERNAME'],
      password: process.env['DDCP_PASSWORD']
    })
  });

  if (!response.ok) {
    console.error(`${response.status}: ${response.statusText}`);
    process.exit(1);
  }

  const { accessToken } = await response.json();

  for (const language in forms) {
    fetch(API_BASE_URL + '/instruments/forms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(forms[language])
    })
      .then((response) => {
        console.log('Status: ' + response.status);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

main();
```

Run your script

```shell
node index.js
```

## Instrument Structure

An instrument can be construed as an abstract entity with the following properties:

- Title
- Details
- Kind
- Data

All instruments must have a title and a variety of details/metadata (e.g., description, language, version).
The data property determines the content of the instruments (e.g., in the case of a form, the fields to be completed by the user). The structure of this data is discriminated by the kind of the instrument.

## Form Instrument

If an instrument is a "form", then the data is an array of objects which define the properties of the various fields that make up the form, such as:

- Name
- Label
- Description
- Variant

## Aggregate Instrument

_If an instrument is an "aggregate", then the data is an array of instruments, which may themselves be of any valid kind, with the possible exception of aggregate._
