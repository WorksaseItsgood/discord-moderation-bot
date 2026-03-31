const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { modAction, success, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('Unlock a channel (allow users to send messages)')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to unlock (defaults to current channel)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unlocking')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    // Get stored permissions or default to true
    const originalPerms = client.lockedChannels?.get(channel.id) ?? true;
    
    // Unlock the channel
    try {
      await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: originalPerms,
        AddReactions: originalPerms
      }, reason);
      
      // Remove from locked channels
      if (client.lockedChannels) {
        client.lockedChannels.delete(channel.id);
      }
      
      console.log(`[Unlock] ${channel.name} unlocked in ${interaction.guild.name}`);
      
      const embed = new EmbedBuilder()
        .setColor(COLOR.SUCCESS)
        .setTitle('🔓 Channel Unlocked')
        .setDescription(`${channel} has been unlocked`)
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
            .setCustomId(`unlock_relock_${channel.id}`)
            .setLabel('Re-lock')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒')
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
      const errEmbedResponse = errorEmbed('Unlock Failed', err.message);
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
  }
};