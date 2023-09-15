import React from 'react';
import { StepperContext } from '@douglasneuroinformatics/ui';
import { FieldsForm } from './FieldsForm';
export default {
  decorators: [
    function (Story) {
      return React.createElement(
        StepperContext.Provider,
        {
          value: {
            index: 0,
            updateIndex: function () {
              return undefined;
            }
          }
        },
        React.createElement(Story, null)
      );
    }
  ],
  component: FieldsForm
};
export var Default = {};
