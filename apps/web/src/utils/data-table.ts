/**
 * Keeps a libui `DataTable` body at least five rows tall, so a table holding one or two rows does not
 * collapse to a sliver. A row holding a button is 41px: a 24px control, 16px of padding, a 1px rule.
 * libui exposes no prop for this, so the class reaches its body through the `data-testid` it renders.
 */
export const MIN_TABLE_BODY_HEIGHT = '[&_[data-testid=data-table-body]]:min-h-[205px]';
