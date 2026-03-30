const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Remind command - set a reminder
module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Time until reminder (e.g., 1h, 30m, 7d)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('What to remind you about')
        .setRequired(true)),
  permissions: [],
  async execute(interaction, client) {
    const time = interaction.options.getString('time');
    const message = interaction.options.getString('message');
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;
    const db = require('../database');
    
    const durationMs = parseDuration(time);
    const remindAt = Math.floor((Date.now() + durationMs) / 1000);
    
    const reminderId = db.createReminder(userId, guildId, message, remindAt);
    
    await interaction.reply({
      content: `✅ I'll remind you about "${message}" in ${time}!`,
      ephemeral: true
    });
    
    // Schedule reminder
    setTimeout(async () => {
      try {
        const user = await client.users.fetch(userId);
        if (user) {
          const dmEmbed = new EmbedBuilder()
            .setTitle('⏰ Reminder!')
            .setColor(0x00ff00)
            .setDescription(message);
          
          await user.send({ embeds: [dmEmbed] });
        }
        
        db.deleteReminder(reminderId);
      } catch (error) {
        console.error('[Remind] Error:', error.message);
      }
    }, durationMs);
  }
};

function parseDuration(duration) {
  const match = duration.match(/^(\d+)([dhms])$/i);
  if (!match) return 60 * 60 * 1000; // default 1h
  
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = { d: 86400000, h: 3600000, m: 60000, s: 1000 };
  
  return value * multipliers[unit];
}