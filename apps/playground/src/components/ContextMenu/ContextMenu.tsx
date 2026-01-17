import { Group, Portal, RadioGroup, Root, Sub, Trigger } from '@radix-ui/react-context-menu';

import { ContextMenuCheckboxItem } from './ContextMenuCheckboxItem';
import { ContextMenuContent } from './ContextMenuContent';
import { ContextMenuItem } from './ContextMenuItem';
import { ContextMenuLabel } from './ContextMenuLabel';
import { ContextMenuRadioItem } from './ContextMenuRadioItem';
import { ContextMenuSeparator } from './ContextMenuSeparator';
import { ContextMenuShortcut } from './ContextMenuShortcut';
import { ContextMenuSubContent } from './ContextMenuSubContent';
import { ContextMenuSubTrigger } from './ContextMenuSubTrigger';

export const ContextMenu = Object.assign(Root.bind(null), {
  CheckboxItem: ContextMenuCheckboxItem,
  Content: ContextMenuContent,
  Group,
  Item: ContextMenuItem,
  Label: ContextMenuLabel,
  Portal,
  RadioGroup,
  RadioItem: ContextMenuRadioItem,
  Separator: ContextMenuSeparator,
  Shortcut: ContextMenuShortcut,
  Sub,
  SubContent: ContextMenuSubContent,
  SubTrigger: ContextMenuSubTrigger,
  Trigger
});
