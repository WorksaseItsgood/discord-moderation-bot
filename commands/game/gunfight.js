const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Gunfight command - Western gunfight game
module.exports = {
  data: new SlashCommandBuilder()
    .setName('gunfight')
    .setDescription('Challenge a user to a western gunfight')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Opponent')
        .setRequired(true)),
  async execute(interaction, client) {
    const opponent = interaction.options.getUser('user');
    
    if (opponent.id === interaction.user.id) {
      return interaction.reply({ content: "You can't gunfight yourself!", ephemeral: true });
    }
    
    const embed = new EmbedBuilder()
      .setTitle('🤠 Western Gunfight!')
      .setColor(0x8b4513)
      .setDescription('🎯 Quick! Type **DRAW** to win!\n\n' + interaction.user.toString() + ' vs ' + opponent.toString());
    
    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    await message.react('🔫');
    
    // Both players react
    const filter = (reaction, user) => reaction.emoji.name === '🔫' && [interaction.user.id, opponent.id].includes(user.id);
    const collector = message.createReactionCollector({ filter, time: 10000, max: 2 });
    
    const reactors = [];
    collector.on('collect', (reaction, user) => {
      if (!reactors.includes(user.id)) {
        reactors.push(user.id);
      }
    });
    
    collector.on('end', () => {
      let winner = null;
      if (reactors.length === 2) {
        // Both shot - random winner
        winner = reactors[Math.floor(Math.random() * 2)];
      } else if (reactors.length === 1) {
        winner = reactors[0];
      }
      
      const winnerUser = winner ? (winner === interaction.user.id ? interaction.user : opponent) : null;
      
      const resultEmbed = new EmbedBuilder()
        .setTitle('🔫 Gunfight Result')
        .setColor(winner ? 0xff0000 : 0x808080)
        .setDescription(winnerUser ? winnerUser.toString() + ' wins the shootout!' : 'No winner!');
      
      message.edit({ embeds: [resultEmbed] });
    });
  }
};