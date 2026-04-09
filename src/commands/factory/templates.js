// Command Templates for Factory Generation
// Add new templates here to auto-generate commands

export const templates = [
  {
    name: 'kick',
    category: 'moderation',
    description: { fr: 'Expulser un utilisateur', en: 'Kick a user from the server' },
    permissions: { user: ['BanMembers'], bot: ['KickMembers'] },
    options: [
      { name: 'user', type: 'User', required: true, description: { fr: 'Utilisateur', en: 'User' } },
      { name: 'reason', type: 'String', required: false, description: { fr: 'Raison', en: 'Reason' } }
    ],
    action: 'kick',
    emoji: '🦶'
  },
  {
    name: 'mute',
    category: 'moderation',
    description: { fr: 'Rendre muet un utilisateur', en: 'Mute a user' },
    permissions: { user: ['MuteMembers'], bot: ['MuteMembers'] },
    options: [
      { name: 'user', type: 'User', required: true, description: { fr: 'Utilisateur', en: 'User' } },
      { name: 'duration', type: 'String', required: true, description: { fr: 'Durée', en: 'Duration' }, choices: ['1h', '24h', '7d'] },
      { name: 'reason', type: 'String', required: false, description: { fr: 'Raison', en: 'Reason' } }
    ],
    action: 'mute',
    emoji: '🔇'
  },
  {
    name: 'warn',
    category: 'moderation',
    description: { fr: 'Avertir un utilisateur', en: 'Warn a user' },
    permissions: { user: ['ManageMessages'], bot: [] },
    options: [
      { name: 'user', type: 'User', required: true, description: { fr: 'Utilisateur', en: 'User' } },
      { name: 'reason', type: 'String', required: true, description: { fr: 'Raison', en: 'Reason' } }
    ],
    action: 'warn',
    emoji: '⚠️'
  },
  {
    name: 'tempban',
    category: 'moderation',
    description: { fr: 'Bannir temporairement', en: 'Temporarily ban a user' },
    permissions: { user: ['BanMembers'], bot: ['BanMembers'] },
    options: [
      { name: 'user', type: 'User', required: true, description: { fr: 'Utilisateur', en: 'User' } },
      { name: 'duration', type: 'String', required: true, description: { fr: 'Durée', en: 'Duration' }, choices: ['30m', '1h', '24h', '7d', '30d'] },
      { name: 'reason', type: 'String', required: false, description: { fr: 'Raison', en: 'Reason' } }
    ],
    action: 'tempban',
    emoji: '⏱️'
  },
  {
    name: 'clear',
    category: 'moderation',
    description: { fr: 'Supprimer des messages', en: 'Delete messages' },
    permissions: { user: ['ManageMessages'], bot: ['ManageMessages'] },
    options: [
      { name: 'amount', type: 'Integer', required: true, description: { fr: 'Nombre', en: 'Amount' }, min: 1, max: 100 },
      { name: 'user', type: 'User', required: false, description: { fr: 'Utilisateur (optionnel)', en: 'User (optional)' } }
    ],
    action: 'clear',
    emoji: '🗑️'
  },
  {
    name: 'lock',
    category: 'moderation',
    description: { fr: 'Verrouiller un salon', en: 'Lock a channel' },
    permissions: { user: ['ManageChannels'], bot: ['ManageChannels'] },
    options: [
      { name: 'channel', type: 'Channel', required: false, description: { fr: 'Salon', en: 'Channel' } }
    ],
    action: 'lock',
    emoji: '🔒'
  },
  {
    name: 'slowmode',
    category: 'moderation',
    description: { fr: 'Mode lent', en: 'Set slowmode' },
    permissions: { user: ['ManageChannels'], bot: ['ManageChannels'] },
    options: [
      { name: 'duration', type: 'String', required: true, description: { fr: 'Durée', en: 'Duration' }, choices: ['off', '5s', '10s', '30s', '1m', '5m', '15m'] }
    ],
    action: 'slowmode',
    emoji: '🐌'
  },
  {
    name: 'giverole',
    category: 'moderation',
    description: { fr: 'Donner un rôle', en: 'Give a role to user' },
    permissions: { user: ['ManageRoles'], bot: ['ManageRoles'] },
    options: [
      { name: 'user', type: 'User', required: true, description: { fr: 'Utilisateur', en: 'User' } },
      { name: 'role', type: 'Role', required: true, description: { fr: 'Rôle', en: 'Role' } }
    ],
    action: 'giverole',
    emoji: '🎭'
  },
  {
    name: 'poll',
    category: 'utility',
    description: { fr: 'Créer un sondage', en: 'Create a poll' },
    permissions: { user: [], bot: [] },
    options: [
      { name: 'question', type: 'String', required: true, description: { fr: 'Question', en: 'Question' } },
      { name: 'option1', type: 'String', required: false, description: { fr: 'Option 1', en: 'Option 1' } },
      { name: 'option2', type: 'String', required: false, description: { fr: 'Option 2', en: 'Option 2' } }
    ],
    action: 'poll',
    emoji: '📊'
  },
  {
    name: 'embed',
    category: 'utility',
    description: { fr: 'Créer un embed', en: 'Create an embed' },
    permissions: { user: ['ManageMessages'], bot: [] },
    options: [
      { name: 'title', type: 'String', required: true, description: { fr: 'Titre', en: 'Title' } },
      { name: 'description', type: 'String', required: true, description: { fr: 'Description', en: 'Description' } }
    ],
    action: 'embed',
    emoji: '📝'
  },
  {
    name: 'userinfo',
    category: 'info',
    description: { fr: 'Info utilisateur', en: 'User information' },
    permissions: { user: [], bot: [] },
    options: [
      { name: 'user', type: 'User', required: false, description: { fr: 'Utilisateur', en: 'User' } }
    ],
    action: 'userinfo',
    emoji: '👤'
  },
  {
    name: 'serverinfo',
    category: 'info',
    description: { fr: 'Info serveur', en: 'Server information' },
    permissions: { user: [], bot: [] },
    options: [],
    action: 'serverinfo',
    emoji: '🏠'
  },
  {
    name: 'avlookup',
    category: 'info',
    description: { fr: 'Avatar d\'un utilisateur', en: 'User avatar' },
    permissions: { user: [], bot: [] },
    options: [
      { name: 'user', type: 'User', required: false, description: { fr: 'Utilisateur', en: 'User' } }
    ],
    action: 'avlookup',
    emoji: '🖼️'
  },
  {
    name: 'ping',
    category: 'info',
    description: { fr: 'Latence du bot', en: 'Bot latency' },
    permissions: { user: [], bot: [] },
    options: [],
    action: 'ping',
    emoji: '🏓'
  },
  {
    name: 'uptime',
    category: 'info',
    description: { fr: 'Temps de fonctionnement', en: 'Bot uptime' },
    permissions: { user: [], bot: [] },
    options: [],
    action: 'uptime',
    emoji: '⏰'
  }
];
