const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { modAction, success, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('Lock a channel (prevent users from sending messages)')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to lock (defaults to current channel)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for locking')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    // Store original permissions
    if (!client.lockedChannels) {
      client.lockedChannels = new Map();
    }
    
    const originalPerms = channel.permissionOverwrites.cache.get(interaction.guild.roles.everyone.id)?.allow.has('SendMessages') ?? true;
    client.lockedChannels.set(channel.id, originalPerms);
    
    // Lock the channel
    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false,
        AddReactions: false
      }, reason);
      
      console.log(`[Lock] ${channel.name} locked in ${interaction.guild.name}. Reason: ${reason}`);
      
      const embed = new EmbedBuilder()
        .setColor(COLOR.WARNING)
        .setTitle('🔒 Channel Locked')
        .setDescription(`${channel} has been locked`)
        .addFields(
          { name: 'Channel', value: channel.toString(), inline: true },
          { name: 'Moderator', value: interaction.user.toString(), inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setFooter({ text: 'Niotic Moderation • ' + new Date().toLocaleDateString() })
        .setTimestamp();
      
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`lock_view_${channel.id}`)
            .setLabel('View Settings')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⚙️'),
          new ButtonBuilder()
            .setCustomId(`lock_unlock_${channel.id}`)
            .setLabel('Unlock')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔓')
        );
      
      await interaction.reply({ embeds: [embed], components: [row] });
      
      // Log to mod log channel
      const logChannel = interaction.guild.channels.cache.find(ch => 
        ch.name === 'mod-logs' || ch.name === 'moderation-logs'
      );
      
      if (logChannel && logChannel.id !== channel.id) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (err) {
      const errEmbedResponse = errorEmbed('Lock Failed', err.message);
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
  }
};