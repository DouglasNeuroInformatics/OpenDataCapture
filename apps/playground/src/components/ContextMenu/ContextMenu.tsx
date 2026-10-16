import { Root, Trigger } from '@radix-ui/react-context-menu';

import { ContextMenuContent } from './ContextMenuContent';
import { ContextMenuItem } from './ContextMenuItem';

export const ContextMenu = Object.assign(Root.bind(null), {
  Content: ContextMenuContent,
  Item: ContextMenuItem,
  Trigger
});
