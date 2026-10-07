import { Tabs } from '@douglasneuroinformatics/libui/components';
import { useMediaQuery, useTranslation } from '@douglasneuroinformatics/libui/hooks';

import { Editor } from '../Editor';
import { Resizable } from '../Resizable';
import { Viewer } from '../Viewer';

export const MainContent = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { t } = useTranslation();
  return (
    <main className="flex grow flex-col overflow-hidden py-4">
      {isDesktop ? (
        // A Panel's id is also its data-testid, which is the only testid the library lets it carry.
        <Resizable.PanelGroup orientation="horizontal">
          <Resizable.Panel defaultSize="66%" id="editor-pane" minSize="25%">
            <Editor />
          </Resizable.Panel>
          <Resizable.Handle className="mr-12" />
          <Resizable.Panel defaultSize="34%" id="preview-pane" minSize="25%">
            <Viewer />
          </Resizable.Panel>
        </Resizable.PanelGroup>
      ) : (
        <Tabs className="flex grow flex-col overflow-hidden" defaultValue="editor">
          <Tabs.List className="grid w-full grid-cols-2">
            <Tabs.Trigger value="editor">{t({ en: 'Editor', fr: 'Éditeur' })}</Tabs.Trigger>
            <Tabs.Trigger value="viewer">{t({ en: 'Viewer', fr: 'Aperçu' })}</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content className="grow" value="editor">
            <Editor />
          </Tabs.Content>
          <Tabs.Content className="grow overflow-hidden pt-6" value="viewer">
            <Viewer />
          </Tabs.Content>
        </Tabs>
      )}
    </main>
  );
};
