/**
 * Beg Command - Beg for coins
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('beg')
    .setDescription('Beg for some coins'),
  
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const guildId = interaction.guildId;
    
    // Check cooldown (2 minutes)
    const cooldownMs = 2 * 60 * 1000;
    const remaining = client.dbManager.getCooldown(userId, guildId, 'beg');
    
    if (remaining > 0) {
      const minutes = Math.floor(remaining / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      const embed = new EmbedBuilder()
        .setTitle('⏳ Beg Cooldown')
        .setDescription(`Someone already gave you coins! Try again in **${minutes}m ${seconds}s**`)
        .setColor(0xffaa00);
      
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    
    // Random response messages
    const responses = [
      { text: 'A generous stranger gave you some coins!', min: 10, max: 50 },
      { text: 'Someone在线赏给你一些硬币！', min: 20, max: 100 },
      { text: 'You found some coins on the ground!', min: 5, max: 30 },
      { text: 'A kind soul pitied you...', min: 15, max: 75 },
      { text: 'Your mom sent you some money!', min: 50, max: 200 },
      { text: 'A wealthy merchant gave you a tip!', min: 25, max: 125 },
      { text: 'You begged successfully!', min: 10, max: 60 },
      { text: 'Someone felt sorry for you!', min: 5, max: 40 },
      { text: 'A random act of kindness!', min: 30, max: 150 },
      { text: 'You got some spare change!', min: 1, max: 25 }
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    const amount = Math.floor(Math.random() * (response.max - response.min + 1)) + response.min;
    
    // Update balance
    client.dbManager.updateBalance(userId, guildId, amount);
    client.dbManager.updateXP(userId, guildId, 10);
    
    // Set cooldown
    client.dbManager.setCooldown(userId, guildId, 'beg', cooldownMs);
    
    const embed = new EmbedBuilder()
      .setTitle('�丐beg')
      .setDescription(response.text)
      .addFields(
        { name: '💰 You received', value: `${amount} coins` },
        { name: '⭐ XP Earned', value: '+10' }
      )
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};