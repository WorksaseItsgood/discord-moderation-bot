const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Welcome command - configure welcome messages
module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Configure welcome messages')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Set Channel', value: 'channel' },
          { name: 'Set Message', value: 'message' },
          { name: 'Test', value: 'test' },
          { name: 'Disable', value: 'disable' }
        ))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Welcome channel')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Welcome message (use {user}, {server}, {membercount})')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    const action = interaction.options.getString('action');
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');
    const guildId = interaction.guild.id;
    const db = require('../database');
    
    const currentSettings = db.getWelcomeSettings(guildId) || {};
    
    switch (action) {
      case 'channel':
        if (!channel) {
          return interaction.reply({ content: '❌ Please provide a channel!', ephemeral: true });
        }
        db.setWelcomeSettings(guildId, {
          ...currentSettings,
          channelId: channel.id
        });
        await interaction.reply(`✅ Welcome channel set to ${channel}!`);
        break;
        
      case 'message':
        if (!message) {
          return interaction.reply({ content: '❌ Please provide a message!', ephemeral: true });
        }
        db.setWelcomeSettings(guildId, {
          ...currentSettings,
          welcomeMessage: message
        });
        await interaction.reply(`✅ Welcome message set to:\n\`\`\`${message}\`\`\``);
        break;
        
      case 'test':
        const welcomeChannel = currentSettings.channel_id ? interaction.guild.channels.cache.get(currentSettings.channel_id) : interaction.channel;
        if (!welcomeChannel) {
          return interaction.reply({ content: '❌ No welcome channel set!', ephemeral: true });
        }
        
        const testEmbed = new EmbedBuilder()
          .setTitle('👋 Welcome!')
          .setDescription((currentSettings.welcome_message || 'Welcome {user} to {server}! 🎉').replace('{user}', interaction.user.toString()).replace('{server}', interaction.guild.name))
          .setColor(currentSettings.embed_color || 0x00ff00);
        
        if (currentSettings.embed_image) {
          testEmbed.setImage(currentSettings.embed_image);
        }
        
        await welcomeChannel.send({ embeds: [testEmbed] });
        await interaction.reply({ content: '✅ Test welcome message sent!', ephemeral: true });
        break;
        
      case 'disable':
        db.setWelcomeSettings(guildId, {
          ...currentSettings,
          enabled: 0
        });
        await interaction.reply('✅ Welcome messages disabled!');
        break;
    }
  }
};