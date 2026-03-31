const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { modAction, success, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicemute')
    .setDescription('Mute a user in voice chat')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to voice mute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for voicemute')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.MuteMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      const errEmbedResponse = errorEmbed('User Not Found', 'User not found in this server!');
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
    
    const voiceState = member.voice;
    if (!voiceState.channelId) {
      const errEmbedResponse = errorEmbed('Not in Voice', 'User is not in a voice channel!');
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
    
    try {
      await member.voice.setMute(true, reason);
      
      const embed = new EmbedBuilder()
        .setColor(COLOR.INFO)
        .setTitle('🔇 User Voice Muted')
        .setDescription(`${user.tag} has been muted in voice`)
        .addFields(
          { name: 'User', value: user.toString(), inline: true },
          { name: 'Voice Channel', value: voiceState.channel?.toString() || 'Unknown', inline: true },
          { name: 'Moderator', value: interaction.user.toString(), inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setFooter({ text: 'Niotic Moderation • ' + new Date().toLocaleDateString() })
        .setTimestamp();
      
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`voicemute_unmute_${user.id}`)
            .setLabel('Unmute')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔊')
        );
      
      await interaction.reply({ embeds: [embed], components: [row] });
      
      const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'mod-logs' || ch.name === 'moderation-logs');
      if (logChannel) await logChannel.send({ embeds: [embed] });
    } catch (err) {
      const errEmbedResponse = errorEmbed('VoiceMute Failed', err.message);
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
  }
};