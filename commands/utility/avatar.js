const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'avatar',
  description: '🖼️ Avatar d'un utilisateur',
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Avatar d'un utilisateur'),
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🖼️ AVATAR')
      .setColor(5793266)
      .setDescription('Commande: Avatar d'un utilisateur')
      .addFields(
        { name: 'Demandeur', value: interaction.user.tag, inline: true },
        { name: 'Commande', value: 'avatar', inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('avatar_run').setLabel('▶️ Exécuter').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('avatar_info').setLabel('ℹ️ Info').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('avatar_help').setLabel('❓ Aide').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};