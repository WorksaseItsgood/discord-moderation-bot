const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const crypto = require('crypto');

// Verification setup command
module.exports = {
  data: new SlashCommandBuilder()
    .setName('verification')
    .setDescription('Configure server verification')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(true)
        .addChoices(
          { name: 'Setup', value: 'setup' },
          { name: 'Disable', value: 'disable' },
          { name: 'Panel', value: 'panel' }
        ))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Verification channel')
        .setRequired(false))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to assign after verification')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.Administrator],
  async execute(interaction, client) {
    const action = interaction.options.getString('action');
    const channel = interaction.options.getChannel('channel');
    const role = interaction.options.getRole('role');
    const guildId = interaction.guild.id;
    const db = require('../database');
    
    switch (action) {
      case 'setup':
        if (!channel || !role) {
          return interaction.reply({ content: '❌ Please provide both channel and role!', ephemeral: true });
        }
        
        const captchaCode = crypto.randomBytes(4).toString('hex');
        
        db.setVerificationSettings(guildId, {
          channelId: channel.id,
          roleId: role.id,
          verifiedRoleId: role.id,
          captchaCode: captchaCode,
          enabled: 1
        });
        
        await interaction.reply(`✅ Verification setup complete!\n- Channel: ${channel}\n- Role: ${role}\n- Captcha Code: \`${captchaCode}\``);
        break;
        
      case 'disable':
        db.setVerificationSettings(guildId, {
          channelId: '',
          roleId: '',
          verifiedRoleId: '',
          captchaCode: '',
          enabled: 0
        });
        await interaction.reply('✅ Verification disabled!');
        break;
        
      case 'panel':
        const settings = db.getVerificationSettings(guildId);
        if (!settings || !settings.enabled) {
          return interaction.reply({ content: '❌ Verification is not set up! Run `/verification setup` first.', ephemeral: true });
        }
        
        const verifyChannel = interaction.guild.channels.cache.get(settings.channel_id) || interaction.channel;
        
        const embed = new EmbedBuilder()
          .setTitle('🔐 Verification Required')
          .setDescription('Complete the captcha below to verify you\'re human and gain access to the server!')
          .setColor(0x00ff00);
        
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('verify-button')
              .setLabel('Start Verification')
              .setStyle(ButtonStyle.Success)
              .setEmoji('✅')
          );
        
        await verifyChannel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: `✅ Verification panel sent to ${verifyChannel}!`, ephemeral: true });
        break;
    }
  }
};