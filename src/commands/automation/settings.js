import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import { getGuildConfig } from '../../database/db.js';
export default {
  data: new SlashCommandBuilder().setName('settings').setNameLocalizations({ fr: 'settings', 'en-US': 'settings' }).setDescription('Show bot settings').setDescriptionLocalizations({ fr: 'Afficher les paramètres du bot', 'en-US': 'Show bot settings' }),
  name: 'settings', permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    const config = await getGuildConfig(interaction.guild.id);
    const embed = new EmbedBuilder()
      .setTitle('⚙️ Paramètres du Bot')
      .setColor(0x5865F2)
      .addFields(
        { name: 'Prefix', value: config.prefix || '!', inline: true },
        { name: 'Log Channel', value: config.logChannel ? `<#${config.logChannel}>` : 'Non défini', inline: true },
        { name: 'Muted Role', value: config.mutedRole ? `<@&${config.mutedRole}>` : 'Non défini', inline: true },
        { name: 'Shield', value: config.shieldEnabled !== false ? '✅' : '❌', inline: true },
        { name: 'Anti-Spam', value: config.antiSpamEnabled !== false ? '✅' : '❌', inline: true },
        { name: 'Anti-Raid', value: config.antiRaidEnabled !== false ? '✅' : '❌', inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
