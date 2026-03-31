const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Unblock command - Unblock user
module.exports = {
  data: new SlashCommandBuilder()
    .setName('unblock')
    .setDescription('Unblock a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to unblock')
        .setRequired(true)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    if (!client.blocked) client.blocked = new Map();
    
    const blockedList = client.blocked.get(interaction.user.id) || [];
    if (!blockedList.includes(user.id)) {
      return interaction.reply({ content: 'User is not blocked!', ephemeral: true });
    }
    
    const newList = blockedList.filter(id => id !== user.id);
    client.blocked.set(interaction.user.id, newList);
    
    const embed = new EmbedBuilder()
      .setTitle('✅ User Unblocked')
      .setColor(0x2ecc71)
      .setDescription(user.toString() + ' has been unblocked.');
    
    await interaction.reply({ embeds: [embed] });
  }
};