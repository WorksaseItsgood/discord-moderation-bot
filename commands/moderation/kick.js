const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { defaultConfig } = require('../../config');
const { kickEmbed, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for kick')
        .setRequired(false))
    .addBooleanOption(option =>
      option.setName('dm')
        .setDescription('DM the user about the kick')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.KickMembers],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const dm = interaction.options.getBoolean('dm') ?? true;
    
    const member = interaction.guild.members.cache.get(user.id);
    const guildConfig = defaultConfig;
    const dmOnAction = guildConfig.moderation?.dmOnAction ?? true;
    
    // Check if user is kickable
    if (member) {
      if (!member.kickable) {
        const errEmbed = errorEmbed('Cannot Kick', 'I cannot kick this user! They may have higher permissions than me.');
        return interaction.reply({ embeds: [errEmbed], ephemeral: true });
      }
    }
    
    // Try to DM user
    let dmSent = false;
    if (dm && dmOnAction) {
      const { EmbedBuilder } = require('discord.js');
      const dmEmbed = new EmbedBuilder()
        .setColor(COLOR.MOD)
        .setTitle('👢 You have been kicked')
        .setDescription(`You were kicked from **${interaction.guild.name}**`)
        .addFields(
          { name: 'Reason', value: reason }
        )
        .setFooter({ text: 'Niotic Moderation' })
        .setTimestamp();
      
      try {
        await user.send({ embeds: [dmEmbed] });
        dmSent = true;
      } catch (err) {
        console.log(`[Kick] Could not DM user ${user.tag}: ${err.message}`);
      }
    }
    
    // Kick the user
    try {
      await member.kick(reason);
    } catch (error) {
      const errEmbed = errorEmbed('Kick Failed', error.message);
      return interaction.reply({ embeds: [errEmbed], ephemeral: true });
    }
    
    console.log(`[Kick] ${user.tag} (${user.id}) kicked from ${interaction.guild.name}. Reason: ${reason}`);
    
    const kickSuccessEmbed = kickEmbed('User Kicked', user, interaction.user, reason);
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`kick_warn_${user.id}`)
          .setLabel('Warn')
          .setStyle(ButtonStyle.Warning)
          .setEmoji('⚠️'),
        new ButtonBuilder()
          .setCustomId(`kick_ban_${user.id}`)
          .setLabel('Ban')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('🔨')
      );
    
    await interaction.reply({ embeds: [kickSuccessEmbed], components: [row] });
    
    // Log to mod log channel
    const logChannel = interaction.guild.channels.cache.find(ch => 
      ch.name === 'mod-logs' || ch.name === 'moderation-logs'
    );
    
    if (logChannel) {
      await logChannel.send({ embeds: [kickSuccessEmbed] });
    }
  }
};