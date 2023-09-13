import React from 'react';
import { FormCreator } from './FormCreator';
export default {
  component: FormCreator,
  decorators: [
    function (Story) {
      return React.createElement('div', { className: 'container' }, React.createElement(Story, null));
    }
  ]
};
export var Default = {};
