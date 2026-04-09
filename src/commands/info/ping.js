import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setNameLocalizations({ fr: 'ping', 'en-US': 'ping' })
    .setDescription('Afficher la latence du bot')
    .setDescriptionLocalizations({ fr: 'Afficher la latence du bot', 'en-US': 'Show bot latency' })
    .setDMPermission(false),
  name: 'ping',
  permissions: { user: [], bot: [] },
  async execute(interaction, client) {
    try {
      const wsLatency = client.ws.ping;
      const replyTimestamp = Date.now() - interaction.createdTimestamp;

      const embed = new EmbedBuilder()
        .setTitle('🏓 Pong !')
        .addFields(
          { name: '▸ Latence WebSocket', value: `${wsLatency}ms`, inline: true },
          { name: '▸ Latence de réponse', value: `${replyTimestamp}ms`, inline: true }
        )
        .setColor(wsLatency < 100 ? 0x00ff00 : wsLatency < 300 ? 0xf39c12 : 0xff0000)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Erreur lors de l\'exécution de la commande ping:', error);
      await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
    }
  },
};
