/**
 * Timed Message Command - Schedule a message
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timedmsg')
    .setDescription('Schedule a message')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('minutes')
        .setDescription('Minutes to wait')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const message = interaction.options.getString('message');
    const minutes = interaction.options.getInteger('minutes');
    
    if (minutes < 1 || minutes > 1440) {
      return interaction.reply({ content: 'Minutes must be between 1 and 1440!', ephemeral: true });
    }
    
    const channel = interaction.channel;
    const ms = minutes * 60 * 1000;
    
    await interaction.reply({ content: `⏰ Message scheduled in ${minutes} minutes!`, ephemeral: true });
    
    setTimeout(async () => {
      try {
        await channel.send(message);
      } catch (e) {
        console.error('[TimedMsg] Error:', e);
      }
    }, ms);
  }
};