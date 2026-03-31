const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Crime command - commit crime for money (risk of losing)
module.exports = {
  data: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('Commit a crime for money (high risk!)')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Crime type')
        .setRequired(false)
        .addChoices(
          { name: 'Petty Theft', value: 'petty' },
          { name: 'Fraud', value: 'fraud' },
          { name: 'Heist', value: 'heist' }
        )),
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const crimeType = interaction.options.getString('type') || 'petty';
    
    // Initialize economy if needed
    if (!client.economy) client.economy = new Map();
    const userData = client.economy.get(userId) || {
      wallet: 500,
      bank: 0,
      lastDaily: 0,
      lastWeekly: 0,
      lastWork: 0,
      streak: 0,
      inventory: [],
      crimes: 0
    };
    
    // Check cooldown (30 minutes)
    const now = Date.now();
    const cooldown = 1800000; // 30 min
    
    if (now - (userData.lastCrime || 0) < cooldown) {
      const timeLeft = Math.ceil((cooldown - (now - userData.lastCrime)) / 60000);
      return interaction.reply({ 
        content: `⏳ You need to wait ${timeLeft} minutes before committing another crime!`,
        ephemeral: true 
      });
    }
    
    // Crime configs
    const crimeConfigs = {
      petty: { minWin: 50, maxWin: 150, minLose: 100, maxLose: 500, winChance: 0.7 },
      fraud: { minWin: 200, maxWin: 500, minLose: 200, maxLose: 1000, winChance: 0.5 },
      heist: { minWin: 500, maxWin: 2000, minLose: 500, maxLose: 3000, winChance: 0.3 }
    };
    
    const config = crimeConfigs[crimeType];
    const success = Math.random() < config.winChance;
    
    if (success) {
      // Success - get money
      const amount = Math.floor(Math.random() * (config.maxWin - config.minWin + 1)) + config.minWin;
      userData.wallet += amount;
      userData.lastCrime = now;
      userData.crimes = (userData.crimes || 0) + 1;
      
      const embed = new EmbedBuilder()
        .setTitle('🎉 Crime Successful!')
        .setColor(0x00ff00)
        .addFields(
          { name: 'Crime', value: crimeType.charAt(0).toUpperCase() + crimeType.slice(1), inline: true },
          { name: 'Result', value: `💰 +${amount}`, inline: true },
          { name: 'New Balance', value: `💰 ${userData.wallet}`, inline: true }
        )
        .setFooter({ text: 'Crime again in 30 minutes!' });
      
      await interaction.reply({ embeds: [embed] });
    } else {
      // Fail - lose money or get caught
      const loseAmount = Math.floor(Math.random() * (config.maxLose - config.minLose + 1)) + config.minLose;
      userData.wallet = Math.max(0, userData.wallet - loseAmount);
      userData.lastCrime = now;
      
      const embed = new EmbedBuilder()
        .setTitle('🚨 Busted!')
        .setColor(0xff0000)
        .addFields(
          { name: 'Crime', value: crimeType.charAt(0).toUpperCase() + crimeType.slice(1), inline: true },
          { name: 'Result', value: `💰 -${loseAmount} fine!`, inline: true },
          { name: 'New Balance', value: `💰 ${userData.wallet}`, inline: true }
        )
        .setFooter({ text: 'Crime again in 30 minutes!' });
      
      await interaction.reply({ embeds: [embed] });
    }
    
    client.economy.set(userId, userData);
  }
};