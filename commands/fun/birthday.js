const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Birthday command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('birthday')
    .setDescription('Set or view your birthday')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Set', value: 'set' },
          { name: 'View', value: 'view' }
        ))
    .addStringOption(option =>
      option.setName('date')
        .setDescription('Your birthday (MM-DD)')
        .setRequired(false)),
  permissions: [],
  async execute(interaction, client) {
    const action = interaction.options.getString('action');
    const date = interaction.options.getString('date');
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const db = require('../database');
    
    switch (action) {
      case 'set':
        if (!date) {
          return interaction.reply({ content: '❌ Please provide your birthday (MM-DD)!', ephemeral: true });
        }
        
        // Validate date format
        const match = date.match(/^(\d{1,2})-(\d{1,2})$/);
        if (!match) {
          return interaction.reply({ content: '❌ Invalid format! Use MM-DD (e.g., 01-15 for January 15)', ephemeral: true });
        }
        
        const month = parseInt(match[1]);
        const day = parseInt(match[2]);
        
        if (month < 1 || month > 12 || day < 1 || day > 31) {
          return interaction.reply({ content: '❌ Invalid date!', ephemeral: true });
        }
        
        db.setBirthday(userId, guildId, date);
        
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
        await interaction.reply({
          content: `🎂 Your birthday has been set to ${months[month - 1]} ${day}!`,
          ephemeral: true
        });
        break;
        
      case 'view':
        const user = interaction.options.getUser('user');
        const targetId = user?.id || userId;
        const userData = db.getUser(targetId, guildId);
        
        if (!userData?.birthday) {
          return interaction.reply({
            content: user ? `${user} hasn't set their birthday yet!` : "You haven't set your birthday yet!",
            ephemeral: true
          });
        }
        
        const [m, d] = userData.birthday.split('-');
        const monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][parseInt(m) - 1];
        
        await interaction.reply({
          content: `🎂 ${user?.username || interaction.user.username}'s birthday: ${monthName} ${d}`,
          ephemeral: true
        });
        break;
    }
  }
};