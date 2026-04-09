import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setNameLocalizations({ fr: 'uptime', 'en-US': 'uptime' })
    .setDescription('Afficher la durée de fonctionnement du bot')
    .setDescriptionLocalizations({ fr: 'Afficher la durée de fonctionnement du bot', 'en-US': 'Show bot uptime' })
    .setDMPermission(false),
  name: 'uptime',
  permissions: { user: [], bot: [] },
  async execute(interaction, client) {
    try {
      const uptime = client.uptime;
      const seconds = Math.floor(uptime / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      const uptimeStr = [];
      if (days > 0) uptimeStr.push(`${days} jour${days > 1 ? 's' : ''}`);
      if (hours % 24 > 0) uptimeStr.push(`${hours % 24} heure${hours % 24 > 1 ? 's' : ''}`);
      if (minutes % 60 > 0) uptimeStr.push(`${minutes % 60} minute${minutes % 60 > 1 ? 's' : ''}`);
      if (seconds % 60 > 0) uptimeStr.push(`${seconds % 60} seconde${seconds % 60 > 1 ? 's' : ''}`);

      const startedAt = Date.now() - uptime;
      const startedTimestamp = Math.floor(startedAt / 1000);

      const embed = new EmbedBuilder()
        .setTitle('⏱️ Uptime du bot')
        .setDescription(`**▸ En ligne depuis:** ${uptimeStr.join(', ')}\n**▸ Démarré le:** <t:${startedTimestamp}:F>`)
        .setColor(0x3498db)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Erreur lors de l\'exécution de la commande uptime:', error);
      await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
    }
  },
};
