const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Leave command - configure leave messages
module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Configure leave messages')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Set Message', value: 'message' },
          { name: 'Test', value: 'test' },
          { name: 'Disable', value: 'disable' }
        ))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Leave message (use {user}, {server}, {membercount})')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    const action = interaction.options.getString('action');
    const message = interaction.options.getString('message');
    const guildId = interaction.guild.id;
    const db = require('../database');
    
    const currentSettings = db.getWelcomeSettings(guildId) || {};
    
    switch (action) {
      case 'message':
        if (!message) {
          return interaction.reply({ content: '❌ Please provide a message!', ephemeral: true });
        }
        db.setWelcomeSettings(guildId, {
          ...currentSettings,
          leaveMessage: message
        });
        await interaction.reply(`✅ Leave message set to:\n\`\`\`${message}\`\`\``);
        break;
        
      case 'test':
        const welcomeChannel = currentSettings.channel_id ? interaction.guild.channels.cache.get(currentSettings.channel_id) : interaction.channel;
        if (!welcomeChannel) {
          return interaction.reply({ content: '❌ No welcome channel set!', ephemeral: true });
        }
        
        const testEmbed = new EmbedBuilder()
          .setTitle('👋 Goodbye!')
          .setDescription((currentSettings.leave_message || '{user} has left {server}. We miss you! 😢').replace('{user}', interaction.user.toString()).replace('{server}', interaction.guild.name))
          .setColor(currentSettings.leave_embed_color || 0xff0000);
        
        await welcomeChannel.send({ embeds: [testEmbed] });
        await interaction.reply({ content: '✅ Test leave message sent!', ephemeral: true });
        break;
        
      case 'disable':
        db.setWelcomeSettings(guildId, {
          ...currentSettings,
          enabled: 0
        });
        await interaction.reply('✅ Leave messages disabled!');
        break;
    }
  }
};