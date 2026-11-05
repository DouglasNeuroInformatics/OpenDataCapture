import type { ComponentProps } from 'react';

import { Card } from '@douglasneuroinformatics/libui/components';
import { cn } from '@douglasneuroinformatics/libui/utils';

import { INSTANCE_CARD_SURFACE } from '@/utils/card-color';

const InstanceCardRoot = ({ className, ...props }: ComponentProps<typeof Card>) => (
  <Card className={cn(INSTANCE_CARD_SURFACE, className)} data-instance-card="" {...props} />
);

/** A card in the color chosen for the whole instance in the application settings. */
export const InstanceCard = Object.assign(InstanceCardRoot, {
  Content: Card.Content,
  Description: Card.Description,
  Footer: Card.Footer,
  Header: Card.Header,
  Title: Card.Title
});
