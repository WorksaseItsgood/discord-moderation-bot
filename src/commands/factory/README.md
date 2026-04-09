# Command Factory

This directory contains the factory system for auto-generating additional commands.

## Usage

Edit `templates/` to add new command templates, then run:

```bash
node generate.js
```

## Template Format

Each template file exports a `template` object:

```js
export const template = {
  name: 'commandname',
  category: 'moderation|config|utility|info|protection|automation|stats',
  description: { fr: '...', en: '...' },
  permissions: { user: [], bot: [] },
  options: [], // Slash command options
  execute: async (interaction, client) => { /* ... */ }
};
```
