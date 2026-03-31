const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { modAction, success, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set slowmode with exempt roles')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Seconds between messages (0-21600)')
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600))
    .addRoleOption(option =>
      option.setName('exempt_role')
        .setDescription('Role exempt from slowmode')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ManageChannels],
  async execute(interaction, client) {
    const seconds = interaction.options.getInteger('seconds');
    const exemptRole = interaction.options.getRole('exempt_role');
    const channel = interaction.channel;
    
    await channel.setRateLimitPerUser(seconds);
    
    const embed = new EmbedBuilder()
      .setColor(COLOR.INFO)
      .setTitle('⏱️ Slowmode Set')
      .setDescription(`Slowmode set to **${seconds} second(s)** in ${channel}`)
      .addFields(
        { name: 'Duration', value: `${seconds}s`, inline: true },
        { name: 'Channel', value: channel.toString(), inline: true },
        { name: 'Exempt Role', value: exemptRole ? exemptRole.toString() : 'None', inline: true }
      )
      .setFooter({ text: 'Niotic Moderation • ' + new Date().toLocaleDateString() })
      .setTimestamp();
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`slowmode_reset_${channel.id}`)
          .setLabel('Reset')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('⏱️')
      );
    
    await interaction.reply({ embeds: [embed], components: [row] });
  }
};