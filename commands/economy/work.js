const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Work command - earn money
module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work to earn money')
    .addStringOption(option =>
      option.setName('job')
        .setDescription('Job type')
        .setRequired(false)
        .addChoices(
          { name: 'Developer', value: 'developer' },
          { name: 'Chef', value: 'chef' },
          { name: 'Artist', value: 'artist' },
          { name: 'Writer', value: 'writer' }
        )),
  async execute(interaction, client) {
    const userId = interaction.user.id;
    const job = interaction.options.getString('job') || 'default';
    
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
      job: 'unemployed'
    };
    
    // Check cooldown (1 hour)
    const now = Date.now();
    const cooldown = 3600000; // 1 hour
    
    if (now - userData.lastWork < cooldown) {
      const timeLeft = Math.ceil((cooldown - (now - userData.lastWork)) / 60000);
      return interaction.reply({ 
        content: `⏳ You need to wait ${timeLeft} minutes before working again!`,
        ephemeral: true 
      });
    }
    
    // Calculate earnings based on job
    const jobEarnings = {
      developer: { min: 100, max: 300 },
      chef: { min: 80, max: 200 },
      artist: { min: 50, max: 150 },
      writer: { min: 40, max: 120 },
      default: { min: 50, max: 150 }
    };
    
    const earnings = jobEarnings[job];
    const amount = Math.floor(Math.random() * (earnings.max - earnings.min + 1)) + earnings.min;
    
    // Update user data
    userData.wallet += amount;
    userData.lastWork = now;
    userData.job = job;
    userData.streak = (userData.streak || 0) + 1;
    
    client.economy.set(userId, userData);
    
    const jobs = { developer: '💻 Developer', chef: '🧑‍🍳 Chef', artist: '🎨 Artist', writer: '✍️ Writer' };
    
    const embed = new EmbedBuilder()
      .setTitle('💼 Work Complete!')
      .setColor(0x00ff00)
      .addFields(
        { name: 'Job', value: jobs[job] || 'Worker', inline: true },
        { name: 'Earned', value: `💰 ${amount}`, inline: true },
        { name: 'New Balance', value: `💰 ${userData.wallet}`, inline: true },
        { name: 'Streak', value: `${userData.streak} days`, inline: true }
      )
      .setFooter({ text: 'Work again in 1 hour!' });
    
    await interaction.reply({ embeds: [embed] });
  }
};