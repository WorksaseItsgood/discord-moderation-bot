const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Bet command - Bet on something
module.exports = {
  data: new SlashCommandBuilder()
    .setName('bet')
    .setDescription('Bet on an outcome')
    .addStringOption(option =>
      option.setName('prediction')
        .setDescription('Your prediction')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Bet amount')
        .setRequired(true)
        .setMinValue(10)),
  async execute(interaction, client) {
    const prediction = interaction.options.getString('prediction');
    const amount = interaction.options.getInteger('amount');
    const userId = interaction.user.id;
    
    if (!client.economy) client.economy = new Map();
    const balance = client.economy.get(userId) || 0;
    
    if (balance < amount) {
      return interaction.reply({ content: 'Insufficient balance!', ephemeral: true });
    }
    
    // Random outcome
    const won = Math.random() > 0.5;
    const multiplier = 2;
    let newBalance;
    
    if (won) {
      newBalance = balance - amount + (amount * multiplier);
    } else {
      newBalance = balance - amount;
    }
    
    client.economy.set(userId, newBalance);
    
    const embed = new EmbedBuilder()
      .setTitle('🎲 Bet Result')
      .setColor(won ? 0x2ecc71 : 0xe74c3c)
      .setDescription('Prediction: ' + prediction)
      .addFields([
        { name: 'Result', value: won ? 'WON +' + amount + '!' : 'LOST ' + amount + '!', inline: true },
        { name: 'New Balance', value: String(newBalance), inline: true }
      ]);
    
    await interaction.reply({ embeds: [embed] });
  }
};