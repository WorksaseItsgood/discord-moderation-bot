const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Heist command - Rob a bank minigame
module.exports = {
  data: new SlashCommandBuilder()
    .setName('heist')
    .setDescription('Plan and execute a bank heist!')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Amount to bet')
        .setRequired(false)
        .setMinValue(100)
        .setMaxValue(5000)),
  async execute(interaction, client) {
    const bet = interaction.options.getInteger('bet') || 500;
    const userId = interaction.user.id;
    
    if (!client.economy) client.economy = new Map();
    const balance = client.economy.get(userId) || 0;
    
    if (balance < bet) {
      return interaction.reply({ content: "You need at least " + bet + " coins to attempt a heist!", ephemeral: true });
    }
    
    // Deduct bet
    client.economy.set(userId, balance - bet);
    
    // Heist plan - random success
    const plans = [
      { name: 'Stealth', success: 0.3, reward: 5, risk: 'low' },
      { name: 'Brute Force', success: 0.5, reward: 8, risk: 'medium' },
      { name: 'Infiltration', success: 0.4, reward: 6, risk: 'medium' },
      { name: 'Explosives', success: 0.6, reward: 10, risk: 'high' }
    ];
    
    const plan = plans[Math.floor(Math.random() * plans.length)];
    const success = Math.random() < plan.success;
    
    let winnings = 0;
    if (success) {
      winnings = bet * plan.reward;
      client.economy.set(userId, balance - bet + winnings);
    }
    
    const newBalance = client.economy.get(userId);
    const embed = new EmbedBuilder()
      .setTitle('Bank Heist')
      .setColor(success ? 0x2ecc71 : 0xe74c3c)
      .setDescription('Plan: ' + plan.name + '\nRisk: ' + plan.risk)
      .addFields([
        { name: 'Bet', value: String(bet), inline: true },
        { name: 'Result', value: success ? 'SUCCESS! Got ' + winnings + ' coins!' : 'FAILED! You lost ' + bet + ' coins.', inline: true },
        { name: 'New Balance', value: String(newBalance), inline: true }
      ]);
    
    await interaction.reply({ embeds: [embed] });
  }
};