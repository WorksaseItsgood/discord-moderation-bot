import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { updateGuildConfig } from '../../database/db.js';
export default {
  data: new SlashCommandBuilder().setName('welcome').setNameLocalizations({ fr: 'welcome', 'en-US': 'welcome' }).setDescription('Set welcome message').setDescriptionLocalizations({ fr: 'Définir le message de bienvenue', 'en-US': 'Set welcome message' }).addChannelOption(o => o.setName('channel').setNameLocalizations({ fr: 'salon' }).setDescription('Welcome channel').setDescriptionLocalizations({ fr: 'Salon de bienvenue' })).addStringOption(o => o.setName('message').setNameLocalizations({ fr: 'message' }).setDescription('Welcome message').setDescriptionLocalizations({ fr: 'Message de bienvenue' }).setRequired(false)),
  name: 'welcome', permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message') || 'Bienvenue {user} sur {server}!';
    const updates = {};
    if (channel) updates.welcomeChannel = channel.id;
    if (message) updates.welcomeMessage = message;
    await updateGuildConfig(interaction.guild.id, updates);
    const config = client.guildConfigs.get(interaction.guild.id) || {};
    client.guildConfigs.set(interaction.guild.id, { ...config, ...updates });
    await interaction.reply({ content: `✅ Message de bienvenue configuré!\nSalon: ${channel?.name || 'Non défini'}\nMessage: ${message}`, ephemeral: true });
  },
};
