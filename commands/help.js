const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Affiche l\'aide du bot',
  
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 Menu Principal')
      .setColor(0x5865F2)
      .setDescription('Choisis une catégorie pour voir les commandes')
      .setFooter({ text: 'Niotic Bot • Premium Moderation' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId('help_moderation').setLabel('🛡️ Modération').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('help_antiraid').setLabel('🛡️ Anti-Raid').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('help_config').setLabel('⚙️ Config').setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId('help_utils').setLabel('🛠️ Utils').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};