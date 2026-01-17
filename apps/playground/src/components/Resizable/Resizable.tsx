import * as React from 'react';

import { Panel } from 'react-resizable-panels';
import type { PanelProps } from 'react-resizable-panels';

import { ResizableHandle } from './ResizableHandle';
import { ResizablePanelGroup } from './ResizablePanelGroup';

import type { ResizableHandleProps } from './ResizableHandle';
import type { ResizablePanelGroupProps } from './ResizablePanelGroup';

type ResizableRootType = React.FC<{ children: React.ReactNode }>;
type ResizableType = ResizableRootType & {
  Handle: React.FC<ResizableHandleProps>;
  Panel: React.FC<PanelProps>;
  PanelGroup: React.FC<ResizablePanelGroupProps>;
};

// This is only for storybook and is unnecessary for real-world use
const ResizableRoot: ResizableRootType = ({ children }) => <>{children}</>;

export const Resizable: ResizableType = Object.assign(ResizableRoot, {
  Handle: ResizableHandle,
  Panel,
  PanelGroup: ResizablePanelGroup
});
