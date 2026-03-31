const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { modAction, success, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deafen')
    .setDescription('Deafen a user in voice chat')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to deafen')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for deafen')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.DeafenMembers],
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
      await member.voice.setDeaf(true, reason);
      
      console.log(`[Deafen] ${user.tag} deafened in ${interaction.guild.name}`);
      
      const embed = new EmbedBuilder()
        .setColor(COLOR.INFO)
        .setTitle('🔇 User Deafened')
        .setDescription(`${user.tag} has been deafened in voice`)
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
            .setCustomId(`deafen_undeafen_${user.id}`)
            .setLabel('Undeafen')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔊')
        );
      
      await interaction.reply({ embeds: [embed], components: [row] });
      
      // Log to mod log channel
      const logChannel = interaction.guild.members.cache.find(ch => 
        ch.name === 'mod-logs' || ch.name === 'moderation-logs'
      );
      
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      }
    } catch (err) {
      const errEmbedResponse = errorEmbed('Deafen Failed', err.message);
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
  }
};