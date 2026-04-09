import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { updateGuildConfig } from '../../database/db.js';
export default {
  data: new SlashCommandBuilder().setName('goodbye').setNameLocalizations({ fr: 'goodbye', 'en-US': 'goodbye' }).setDescription('Set goodbye message').setDescriptionLocalizations({ fr: 'Définir le message de départ', 'en-US': 'Set goodbye message' }).addChannelOption(o => o.setName('channel').setNameLocalizations({ fr: 'salon' }).setDescription('Goodbye channel')).addStringOption(o => o.setName('message').setNameLocalizations({ fr: 'message' }).setDescription('Goodbye message')),
  name: 'goodbye', permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message') || 'Au revoir {user}!';
    const updates = {};
    if (channel) updates.goodbyeChannel = channel.id;
    if (message) updates.goodbyeMessage = message;
    await updateGuildConfig(interaction.guild.id, updates);
    const config = client.guildConfigs.get(interaction.guild.id) || {};
    client.guildConfigs.set(interaction.guild.id, { ...config, ...updates });
    await interaction.reply({ content: `✅ Message de départ configuré!`, ephemeral: true });
  },
};
