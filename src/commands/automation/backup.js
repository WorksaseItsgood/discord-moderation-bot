import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { addBackup } from '../../database/db.js';
export default {
  data: new SlashCommandBuilder().setName('backup').setNameLocalizations({ fr: 'backup', 'en-US': 'backup' }).setDescription('Create server backup').setDescriptionLocalizations({ fr: 'Créer une sauvegarde du serveur', 'en-US': 'Create server backup' }),
  name: 'backup', permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    const guild = interaction.guild;
    const backup = {
      name: guild.name,
      region: guild.preferredLocale,
      roles: guild.roles.cache.map(r => ({ name: r.name, color: r.color, permissions: r.permissions.bitfield })),
      channels: guild.channels.cache.map(c => ({ name: c.name, type: c.type, parent: c.parentId })),
      timestamp: Date.now(),
    };
    const { addBackup: saveBackup } = await import('../../database/db.js');
    const id = await saveBackup(interaction.guild.id, backup);
    await interaction.reply({ content: `✅ Sauvegarde créée!\nID: \`${id}\``, ephemeral: true });
  },
};
