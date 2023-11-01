import prettierPluginBabel from 'prettier/plugins/babel';
import prettierPluginEstree from 'prettier/plugins/estree';
import prettier from 'prettier/standalone';

type Monaco = typeof import('monaco-editor');

export type LibraryDefinition = {
  content: string;
  path: string;
};

export type MonacoConfigureOptions = {
  libraries: LibraryDefinition[];
};

/**
 * The `MonacoConfigurer` class is responsible for setting default options
 * for a variety of monaco options. After creating an instance, the `configure` 
 * method must be called to preform the setup operations. As the only public method,
 * users have the option to specify options for various aspects of monaco here.
 */
export class MonacoConfigurer {
  constructor(private readonly monaco: Monaco) {}

  configure({ libraries }: MonacoConfigureOptions) {
    this.setCompilerOptions();
    this.setLibraries(libraries);
    this.setThemes();
    this.setupPrettier();
    this.monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  }

  /**
   * Setup the TypeScript compiler options as similarly as possible to 
   * the  project setup. This is limited by an absence of modern options 
   * (e.g., module resolution) in the monaco enum options.
   */
  private setCompilerOptions() {
    this.monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      allowSyntheticDefaultImports: true,
      jsx: this.monaco.languages.typescript.JsxEmit.ReactJSX,
      module: this.monaco.languages.typescript.ModuleKind.ESNext,
      moduleResolution: this.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      strict: true,
      target: this.monaco.languages.typescript.ScriptTarget.ESNext
    });
  }

  /** 
   * Given a list of library definitions, add them to the instance and create 
   * models to allow users to inspect the source definitions as required.
   */
  private setLibraries(libraries: LibraryDefinition[]) {
    for (const lib of libraries) {
      this.monaco.languages.typescript.javascriptDefaults.addExtraLib(lib.content, lib.path);
      this.monaco.editor.createModel(lib.content, 'typescript', this.monaco.Uri.parse(lib.path));
    }
  }

  /** Define custom light and dark themes for the editor */
  private setThemes() {
    this.monaco.editor.defineTheme('odc-light', {
      base: 'vs',
      colors: {
        'editor.background': '#F8FAFC'
      },
      inherit: true,
      rules: []
    });
    this.monaco.editor.defineTheme('odc-dark', {
      base: 'vs-dark',
      colors: {
        'editor.background': '#1E313B'
      },
      inherit: true,
      rules: []
    });
  }

  /**
   * Configure the monaco instance to use prettier as the document formatter.
   * The keyboard shortcut to format the document is set to Alt + F.
   */
  private setupPrettier() {
    this.monaco.editor.addKeybindingRule({
      command: 'editor.action.formatDocument',
      keybinding: this.monaco.KeyMod.Alt | this.monaco.KeyCode.KeyF
    });
    this.monaco.languages.registerDocumentFormattingEditProvider('typescript', {
      async provideDocumentFormattingEdits(model) {
        const range = model.getFullModelRange();
        const value = model.getValue();
        const text = await prettier.format(value, {
          parser: 'babel-ts',
          plugins: [prettierPluginBabel, prettierPluginEstree],
          printWidth: 120,
          singleQuote: true,
          trailingComma: 'none'
        });
        return [{ range, text }];
      }
    });
  }
}
