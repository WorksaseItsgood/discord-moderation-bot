const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Block command - Block user
module.exports = {
  data: new SlashCommandBuilder()
    .setName('block')
    .setDescription('Block a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to block')
        .setRequired(true)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    if (user.id === interaction.user.id) {
      return interaction.reply({ content: "You can't block yourself!", ephemeral: true });
    }
    
    if (!client.blocked) client.blocked = new Map();
    
    const blockedList = client.blocked.get(interaction.user.id) || [];
    if (blockedList.includes(user.id)) {
      return interaction.reply({ content: 'User is already blocked!', ephemeral: true });
    }
    
    blockedList.push(user.id);
    client.blocked.set(interaction.user.id, blockedList);
    
    const embed = new EmbedBuilder()
      .setTitle('🚫 User Blocked')
      .setColor(0xe74c3c)
      .setDescription(user.toString() + ' has been blocked.');
    
    await interaction.reply({ embeds: [embed] });
  }
};