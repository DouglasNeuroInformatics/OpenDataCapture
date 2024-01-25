import { JSONFilePreset } from 'lowdb/node';

const db = await JSONFilePreset('db.json', { posts: [] });

await db.update(({ posts }) => posts.push('hello world'));
