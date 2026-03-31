const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { defaultConfig } = require('../../config');
const { modAction, success, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to unmute')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unmute')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ModerateMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      const errEmbedResponse = errorEmbed('User Not Found', 'User not found in this server!');
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
    
    // Try to remove timeout first
    try {
      if (member.isCommunicationDisabled()) {
        await member.timeout(null, reason);
      }
    } catch (error) {
      console.log(`[Unmute] Could not remove timeout: ${error.message}`);
    }
    
    // Also try role-based unmute
    const muteRoleId = defaultConfig.moderation?.muteRole;
    if (muteRoleId) {
      const muteRole = interaction.guild.roles.cache.get(muteRoleId);
      if (muteRole && member.roles.cache.has(muteRoleId)) {
        try {
          await member.roles.remove(muteRole, reason);
        } catch (error) {
          console.log(`[Unmute] Could not remove mute role: ${error.message}`);
        }
      }
    }
    
    console.log(`[Unmute] ${user.tag} unmuted in ${interaction.guild.name}`);
    
    const embed = new EmbedBuilder()
      .setColor(COLOR.INFO)
      .setTitle('🔊 User Unmuted')
      .setDescription(`${user.tag} has been unmuted`)
      .addFields(
        { name: 'User', value: user.toString(), inline: true },
        { name: 'Moderator', value: interaction.user.toString(), inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setFooter({ text: 'Niotic Moderation • ' + new Date().toLocaleDateString() })
      .setTimestamp();
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`unmute_redo_${user.id}`)
          .setLabel('Mute Again')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔇')
      );
    
    await interaction.reply({ embeds: [embed], components: [row] });
    
    // Log to mod log channel
    const logChannel = interaction.guild.channels.cache.find(ch => 
      ch.name === 'mod-logs' || ch.name === 'moderation-logs'
    );
    
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  }
};