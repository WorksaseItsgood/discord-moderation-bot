const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'purge',
  description: '🗑️ Purger des messages',
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Supprimer des messages dans le salon')
    .addIntegerOption(opt => opt.setName('amount').setDescription('Nombre de messages (1-100)').setRequired(true)),

  async execute(interaction, client) {
    const amount = interaction.options.getInteger('amount');

    if (!interaction.member.permissions.has('ManageMessages')) {
      return interaction.reply({ content: '❌ Vous n\'avez pas la permission de gérer les messages.', ephemeral: true });
    }

    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '❌ Nombre invalide (1-100).', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Confirmation - Purge')
      .setColor(8421504)
      .setDescription(`Voulez-vous supprimer **${amount}** message(s) ?`)
      .setTimestamp()
      .setFooter({ text: 'Niotic - AntiRaid Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('purge_10').setLabel('🗑️ 10').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('purge_50').setLabel('🗑️ 50').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('purge_100').setLabel('🗑️ 100').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('purge_cancel').setLabel('❌ Annuler').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
