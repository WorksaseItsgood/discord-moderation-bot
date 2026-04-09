import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { getStats } from '../../database/db.js';
export default {
  data: new SlashCommandBuilder().setName('stats').setNameLocalizations({ fr: 'stats', 'en-US': 'stats' }).setDescription('Show moderation stats').setDescriptionLocalizations({ fr: 'Afficher les statistiques de modération', 'en-US': 'Show moderation stats' }),
  name: 'stats', permissions: { user: [PermissionFlagsBits.ManageMessages], bot: [] },
  async execute(interaction, client) {
    const stats = await getStats(interaction.guild.id);
    const embed = new EmbedBuilder()
      .setTitle('📊 Statistiques de Modération')
      .setColor(0x5865F2)
      .addFields(
        { name: 'Bans', value: String(stats.bans || 0), inline: true },
        { name: 'Kicks', value: String(stats.kicks || 0), inline: true },
        { name: 'Mutes', value: String(stats.mutes || 0), inline: true },
        { name: 'Warns', value: String(stats.warns || 0), inline: true },
        { name: 'Total Actions', value: String(stats.total || 0), inline: true }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
