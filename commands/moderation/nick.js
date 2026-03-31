const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Nick command - change nickname
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
      return interaction.reply({ content: '❌ User not found in this server!', ephemeral: true });
    }
    
    try {
      if (nickname === 'remove' || nickname === 'none' || nickname === '') {
        await member.setNickname(null, `Nickname reset by ${interaction.user.tag}`);
      } else {
        await member.setNickname(nickname, `Nickname set by ${interaction.user.tag}`);
      }
      
      const embed = new EmbedBuilder()
        .setTitle('✅ Nickname Changed')
        .setColor(0x00ff00)
        .addFields(
          { name: 'User', value: `${user}`, inline: true },
          { name: 'New Nickname', value: nickname === 'remove' ? '*Removed*' : nickname, inline: true }
        );
      
      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      await interaction.reply({ content: `❌ Error changing nickname: ${error.message}`, ephemeral: true });
    }
  }
};