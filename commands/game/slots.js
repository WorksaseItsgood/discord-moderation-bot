const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Slotmachine command - Enhanced slot machine
module.exports = {
  data: new SlashCommandBuilder()
    .setName('slotmachine')
    .setDescription('Play the slot machine')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Amount to bet')
        .setRequired(false)
        .setMinValue(10)
        .setMaxValue(1000)),
  async execute(interaction, client) {
    const bet = interaction.options.getInteger('bet') || 50;
    const userId = interaction.user.id;
    
    if (!client.economy) client.economy = new Map();
    const balance = client.economy.get(userId) || 0;
    
    if (balance < bet) {
      return interaction.reply({ content: `❌ You need at least ${bet} coins to play!`, ephemeral: true });
    }
    
    // Deduct bet
    client.economy.set(userId, balance - bet);
    
    const emojis = ['🍒', '🍋', '🍊', '🍇', '💎', '🤑'];
    const results = [];
    for (let i = 0; i < 3; i++) {
      results.push(emojis[Math.floor(Math.random() * emojis.length)]);
    }
    
    let winnings = 0;
    let message = '';
    
    // Check for wins
    if (results[0] === results[1] && results[1] === results[2]) {
      // All three match
      if (results[0] === '🤑') winnings = bet * 10;
      else if (results[0] === '💎') winnings = bet * 5;
      else if (results[0] === '🍇') winnings = bet * 3;
      else winnings = bet * 2;
      message = '🎉 JACKPOT!';
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
      // Two match
      winnings = Math.floor(bet * 0.5);
      message = '🎯 Small win!';
    }
    
    const newBalance = balance - bet + winnings;
    client.economy.set(userId, newBalance);
    
    const embed = new EmbedBuilder()
      .setTitle('🎰 Slot Machine')
      .setColor(0xffd700)
      .setDescription(`🎰 ${results.join(' | ')} 🎰\n\n${message}\n💰 Bet: ${bet} | Won: ${winnings}\n💵 Balance: ${newBalance}`);
    
    await interaction.reply({ embeds: [embed] });
  }
};