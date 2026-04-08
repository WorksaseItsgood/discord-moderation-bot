const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'utility',
  description: '📋 Liste des commandes utilitaires',
  data: new SlashCommandBuilder()
    .setName('utility')
    .setDescription('Liste des commandes utilitaires'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📋 COMMANDES UTILITAIRES')
      .setColor(5793266)
      .setDescription('Voici la liste des commandes utilitaires disponibles:')
      .addFields(
        { name: '🏓 ping', value: 'Latence du bot', inline: false },
        { name: '👤 userinfo', value: 'Info sur un utilisateur', inline: false },
        { name: '📊 serverinfo', value: 'Info du serveur', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('util_ping').setLabel('🏓 Ping').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('util_userinfo').setLabel('👤 Userinfo').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('util_serverinfo').setLabel('📊 Serverinfo').setStyle(ButtonStyle.Primary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
