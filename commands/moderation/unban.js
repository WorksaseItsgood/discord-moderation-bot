const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { modAction, success, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server')
    .addStringOption(option =>
      option.setName('user')
        .setDescription('User ID or username to unban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unban')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.BanMembers],
  async execute(interaction, client) {
    const userInput = interaction.options.getString('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    let userId = userInput;
    let userTag = userInput;
    
    // Check if input is a user mention or ID
    const userMatch = userInput.match(/^<@!?(\d+)>$/);
    if (userMatch) {
      userId = userMatch[1];
    }
    
    // Try to fetch the user to get their tag
    try {
      const user = await client.users.fetch(userId);
      if (user) {
        userTag = user.tag;
      }
    } catch (error) {
      // User not found, use input as tag
    }
    
    // Try to unban
    try {
      await interaction.guild.bans.remove(userId, reason);
    } catch (error) {
      const errEmbedResponse = errorEmbed('Unban Failed', error.message);
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
    
    console.log(`[Unban] ${userTag} (${userId}) unbanned in ${interaction.guild.name}`);
    
    const embed = new EmbedBuilder()
      .setColor(COLOR.SUCCESS)
      .setTitle('✅ User Unbanned')
      .setDescription(`${userTag} has been unbanned from the server`)
      .addFields(
        { name: 'User', value: `${userTag} (${userId})`, inline: true },
        { name: 'Moderator', value: interaction.user.toString(), inline: true },
        { name: 'Reason', value: reason, inline: false }
      )
      .setFooter({ text: 'Niotic Moderation • ' + new Date().toLocaleDateString() })
      .setTimestamp();
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`unban_redo_${userId}`)
          .setLabel('Re-ban')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔨')
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