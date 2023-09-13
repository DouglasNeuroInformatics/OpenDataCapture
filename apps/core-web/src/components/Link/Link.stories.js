import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Link } from './Link';
export default {
  component: Link,
  args: {
    children: 'Hello World',
    to: '#'
  },
  decorators: [
    function (Story) {
      return React.createElement(MemoryRouter, null, React.createElement(Story, null));
    }
  ]
};
export var Default = {};
export var BtnDark = {
  args: {
    variant: 'btn-primary'
  }
};
export var BtnLight = {
  args: {
    variant: 'btn-secondary'
  }
};
