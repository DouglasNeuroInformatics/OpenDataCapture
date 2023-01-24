## Inspiration

The web client is a single page application (SPA), the architecture of which is based heavily on the patterns in [Bulletproof React](https://github.com/alan2207/bulletproof-react/blob/master/docs/style-guide.md).

## Key Technologies

### React

React is a JavaScript library for building user interfaces. It allows developers to build reusable UI components and manage the state of an application in a way that is easy to understand and predict. React uses a virtual DOM to optimize performance by only updating the parts of the UI that have changed.

### Vite

Vite is a build tool and development server that is optimized for building React applications. It uses the native ES modules feature in modern browsers to provide a fast and lightweight development experience. Vite also has a plugin system that allows developers to add additional functionality, such as support for JSX and TypeScript.

### Tailwind CSS

Tailwind CSS is a utility-first CSS framework that provides a set of pre-defined CSS classes that can be used to quickly style an application. It uses a low-level approach, which means that instead of providing a set of pre-defined UI components, it provides a set of CSS classes that can be used to create any type of layout or design. Tailwind CSS also provides a set of tools for generating a custom design system that can be easily integrated into an application.

### Storybook

Storybook is a development tool that allows developers to create, develop, and test UI components in isolation. It provides a way to visualize and interact with components in different states, and to document and share those components with others.

Storybook runs as a separate application accessed through a web browser, and allows developers to see how a component will look and behave in different contexts. It also provides a way to test components using various testing frameworks such as Jest, Mocha, and Cypress. Currently, we do not implement this, but we may do so in the near future (probably using Cypress).

Storybook also provides a way to document components, and view the documentation inline with the component itself. This allows developers to better understand how a component is intended to be used, and to share that information with others on the team.

### i18next

i18next is an internationalization (i18n) library for JavaScript. It allows developers to add localization support to their web and mobile applications, making it easy to translate text and other content into different languages. i18next uses a simple, JSON-based file format to store translations, and supports features such as namespaces, fallback languages, and pluralization. It is also compatible with a variety of frameworks and libraries, including React. In our application, we use it to support both English and French. These translations are stored in the `public` directory. 

## Directory Structure

The application's source code is organized within the "src" directory, which contains several subdirectories:
  - The "assets" folder contains images and fonts used throughout the application.
  - The "components" folder contains components that are shared across the application. These components are reusable and can be used in multiple pages or features.
  - The "features" folder contains pages and components specific to a particular feature, along with the corresponding API calls and React hooks. Each feature is organized within its own subfolder, and contains the necessary components, hooks, and services specific to that feature.
  - The "hooks" directory contains React hooks that are shared across the application. These hooks are used to manage state and perform other logic that can be reused across multiple components.
  - The "services" folder contains the configuration for third-party libraries that are used across the application. This includes libraries such as axios for handling API calls, and any other libraries used throughout the application.
  - The "stores" folder contains global stores managed with zustand, a simple and flexible state management library for React. These stores are used to manage state that is shared across the entire application.
  
Routing is defined in the "router.tsx" file using React Router version 6. This file contains the routing configuration for the application and maps URLs to the corresponding pages or components.

The App component is the root component of the application and is responsible for organizing providers and handling most errors in the application. Providers are used to provide global state and functionality to components throughout the application.

Finally, the "main.tsx" file serves as the entry point for the application. This is where the application is rendered and where the necessary imports and configuration are defined.
