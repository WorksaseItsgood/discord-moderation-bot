const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Wrestle command - Wrestling game
module.exports = {
  data: new SlashCommandBuilder()
    .setName('wrestle')
    .setDescription('Challenge a user to a wrestling match')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Opponent')
        .setRequired(true)),
  async execute(interaction, client) {
    const opponent = interaction.options.getUser('user');
    
    if (opponent.id === interaction.user.id) {
      return interaction.reply({ content: "You can't wrestle yourself!", ephemeral: true });
    }
    
    const p1Moves = ['Suplex', 'Body Slam', 'Chokeslam', 'Powerbomb', 'DDT'];
    const p2Moves = ['Suplex', 'Body Slam', 'Chokeslam', 'Powerbomb', 'DDT'];
    
    const p1Move = p1Moves[Math.floor(Math.random() * p1Moves.length)];
    const p2Move = p2Moves[Math.floor(Math.random() * p2Moves.length)];
    
    const p1Damage = Math.floor(Math.random() * 30) + 10;
    const p2Damage = Math.floor(Math.random() * 30) + 10;
    
    let totalDamage = 100;
    let winner;
    
    // Simulate match
    while (totalDamage > 0) {
      if (Math.random() > 0.5) {
        totalDamage -= p1Damage;
        winner = interaction.user;
      } else {
        totalDamage -= p2Damage;
        winner = opponent;
      }
    }
    
    const embed = new EmbedBuilder()
      .setTitle('Wrestling Match')
      .setColor(0xff0000)
      .setDescription('🏋️ ' + interaction.user.username + ' uses ' + p1Move + '!\n🏋️ ' + opponent.username + ' uses ' + p2Move + '!')
      .addFields([
        { name: 'Winner', value: winner.username, inline: true }
      ]);
    
    await interaction.reply({ embeds: [embed] });
  }
};