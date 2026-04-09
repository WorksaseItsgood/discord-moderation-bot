import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('lockdown').setNameLocalizations({ fr: 'lockdown', 'en-US': 'lockdown' }).setDescription('Emergency lockdown all channels').setDescriptionLocalizations({ fr: 'Lockdown urgent de tous les salons', 'en-US': 'Emergency lockdown all channels' }),
  name: 'lockdown', permissions: { user: [PermissionFlagsBits.Administrator], bot: [PermissionFlagsBits.ManageChannels] },
  async execute(interaction, client) {
    const channels = interaction.guild.channels.cache.filter(c => c.type === 0 || c.type === 2);
    let count = 0;
    for (const channel of channels.values()) {
      try {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false, Connect: false }, 'Lockdown emergency');
        count++;
      } catch {}
    }
    await interaction.reply({ content: `🔒 Lockdown terminé! ${count}/${channels.size} salons verrouillés.`, ephemeral: true });
    client.logger?.info(`[Lockdown] ${count} channels locked in ${interaction.guild.name}`);
  },
};
