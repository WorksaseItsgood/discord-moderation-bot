const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Divorce command - Divorce a user
module.exports = {
  data: new SlashCommandBuilder()
    .setName('divorce')
    .setDescription('Divorce your spouse'),
  async execute(interaction, client) {
    if (!client.marriages) client.marriages = new Map();
    
    const marriage = client.marriages.get(interaction.user.id);
    if (!marriage || !marriage.partner) {
      return interaction.reply({ content: '❌ You are not married!', ephemeral: true });
    }
    
    const partner = await interaction.client.users.fetch(marriage.partner).catch(() => null);
    
    // Remove marriage
    client.marriages.delete(interaction.user.id);
    if (marriage.partner) {
      client.marriages.delete(marriage.partner);
    }
    
    const embed = new EmbedBuilder()
      .setTitle('💔 Divorce Complete')
      .setColor(0x808080)
      .setDescription(`${interaction.user} is now divorced from ${partner || 'their ex-spouse'}.`);
    
    await interaction.reply({ embeds: [embed] });
  }
};