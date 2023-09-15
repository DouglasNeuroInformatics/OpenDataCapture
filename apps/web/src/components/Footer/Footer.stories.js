import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { Footer } from './Footer';
export default { component: Footer };
export var Default = {
  decorators: [
    function (Story) {
      return React.createElement(
        MemoryRouter,
        null,
        React.createElement(
          'div',
          { className: 'container' },
          React.createElement(
            'main',
            { className: 'mx-auto max-w-prose' },
            React.createElement('h1', { className: 'mb-5 text-center text-2xl font-bold' }, 'My Website'),
            React.createElement(
              'p',
              null,
              'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Odit libero architecto obcaecati ullam nostrum doloribus. Eligendi voluptatem veniam nulla, illo praesentium doloremque, cum deleniti sunt asperiores saepe eius iusto commodi!'
            )
          ),
          React.createElement(Story, null)
        )
      );
    }
  ]
};
