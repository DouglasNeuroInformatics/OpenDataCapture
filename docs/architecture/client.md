# Client

The web client is a single page application (SPA), the architecture of which is based heavily on the patterns in [Bulletproof React](https://github.com/alan2207/bulletproof-react).

## Key Technologies

### React

[React](https://reactjs.org/) is a JavaScript library for building user interfaces. 

### JSX

[JSX](https://reactjs.org/docs/introducing-jsx.html) is a syntax extension for JavaScript that lets you write HTML-like markup inside a JavaScript file. It is mainly, although not exclusively, used with React.

In JSX, you can mix HTML and JavaScript code together, which makes it easy to create and manipulate the structure of your UI elements. The JSX code is then transpiled (converted) into regular JavaScript code, which can be understood by the browser and executed.

For example, instead of writing:

```javascript
const element = React.createElement('div', { className: 'my-class' }, 'Hello World!');
```

You can write:

```javascript
const element = <div className="my-class">Hello World!</div>;
```

### Vite

[Vite](https://vitejs.dev/) is a build tool that enables us to use technologies such as JSX and TypeScript that are not supported by browsers. 

### Tailwind CSS

[Tailwind CSS](https://tailwindcss.com/) is a utility-first CSS framework that provides a set of pre-defined CSS classes. Especially when combined with React, it is a very powerful tool to build reusable, modern interfaces.

### Storybook

[Storybook](https://storybook.js.org/) is a development tool for creating and testing UI components in isolation. It provides a way to visualize and interact with components in different states, and to document and share those components with others. 

### i18next

[i18next](https://www.i18next.com/) is an internationalization (i18n) library for JavaScript. It allows us to add localization support to the platform. i18next uses a simple, JSON-based file format to store translations, and supports features such as namespaces, fallback languages, and pluralization. In our application, we use it to support both English and French. These translations are stored in the `public` directory. 

## Directory Structure

```shell
src
├── assets        # contains static files such as images, fonts, etc.
├── components    # reusable components that are shared across the application
├── features      # contains code specific to a feature
├── hooks         # shared hooks used across the entire application
├── services      # re-exporting different libraries preconfigured for the application
├── stores        # global state stores managed with zustand
├── App.tsx       # the top-level element of the application
├── main.tsx      # the entry point to the application
├── router.tsx    # the routing configuration
└── styles.css    # postcss tailwind directives and other vanilla css
```
