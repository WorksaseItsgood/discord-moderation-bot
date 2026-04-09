import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('unquakeserver').setNameLocalizations({ fr: 'unquakeserver', 'en-US': 'unquakeserver' }).setDescription('Remove all lockdowns').setDescriptionLocalizations({ fr: 'Retirer tous les lockdowms', 'en-US': 'Remove all lockdowns' }),
  name: 'unquakeserver', permissions: { user: [PermissionFlagsBits.Administrator], bot: [PermissionFlagsBits.ManageChannels] },
  async execute(interaction, client) {
    const channels = interaction.guild.channels.cache.filter(c => c.type === 0 || c.type === 2);
    let count = 0;
    for (const channel of channels.values()) {
      try {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null, Connect: null }, 'Unlock server');
        count++;
      } catch {}
    }
    await interaction.reply({ content: `🟢 Serveur déverrouillé! ${count} salons restaurés.`, ephemeral: true });
  },
};
