const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Friends command - Friends list
module.exports = {
  data: new SlashCommandBuilder()
    .setName('friends')
    .setDescription('View your friends list'),
  async execute(interaction, client) {
    const userId = interaction.user.id;
    
    if (!client.friends) client.friends = new Map();
    const friendsList = client.friends.get(userId) || [];
    
    if (friendsList.length === 0) {
      return interaction.reply({ content: "You don't have any friends yet! Use /addfriend to add friends.", ephemeral: true });
    }
    
    let description = '';
    for (const friendId of friendsList.slice(0, 10)) {
      const friend = await interaction.client.users.fetch(friendId).catch(() => null);
      if (friend) {
        description += friend.toString() + '\n';
      }
    }
    
    const embed = new EmbedBuilder()
      .setTitle('👥 Friends List')
      .setColor(0x3498db)
      .setDescription(description)
      .setFooter({ text: friendsList.length + ' friends' });
    
    await interaction.reply({ embeds: [embed] });
  }
};