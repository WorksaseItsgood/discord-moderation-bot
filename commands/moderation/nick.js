const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { modAction, success, error: errorEmbed, COLOR } = require('../../utils/embedTemplates');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Change a user\'s nickname')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to change nickname')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('nickname')
        .setDescription('New nickname (leave empty to remove)')
        .setRequired(true)),
  permissions: [PermissionFlagsBits.ManageNicknames],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const nickname = interaction.options.getString('nickname');
    const member = interaction.guild.members.cache.get(user.id);
    
    if (!member) {
      const errEmbedResponse = errorEmbed('User Not Found', 'User not found in this server!');
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
    
    try {
      const oldNickname = member.nickname || user.username;
      if (nickname === 'remove' || nickname === 'none' || nickname === '') {
        await member.setNickname(null, `Nickname reset by ${interaction.user.tag}`);
      } else {
        await member.setNickname(nickname, `Nickname set by ${interaction.user.tag}`);
      }
      
      const embed = new EmbedBuilder()
        .setColor(COLOR.SUCCESS)
        .setTitle('✅ Nickname Changed')
        .setDescription(`${user.tag}'s nickname has been updated`)
        .addFields(
          { name: 'User', value: user.toString(), inline: true },
          { name: 'Old Nickname', value: oldNickname, inline: true },
          { name: 'New Nickname', value: nickname === 'remove' ? '*Removed*' : nickname, inline: true }
        )
        .setFooter({ text: 'Niotic Moderation • ' + new Date().toLocaleDateString() })
        .setTimestamp();
      
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`nick_reset_${user.id}`)
            .setLabel('Reset')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('↩️')
        );
      
      await interaction.reply({ embeds: [embed], components: [row] });
    } catch (err) {
      const errEmbedResponse = errorEmbed('Nickname Failed', err.message);
      return interaction.reply({ embeds: [errEmbedResponse], ephemeral: true });
    }
  }
};