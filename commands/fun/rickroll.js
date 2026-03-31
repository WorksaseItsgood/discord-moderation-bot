const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Rickroll command - Send a rickroll link
module.exports = {
  data: new SlashCommandBuilder()
    .setName('rickroll')
    .setDescription('发送rickroll链接')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Mention user to rickroll')
        .setRequired(false)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const rickrollLink = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    
    if (user) {
      const embed = new EmbedBuilder()
        .setTitle('🎵 Rickroll!')
        .setColor(0xff0000)
        .setDescription(`${user} 你被rickroll了!\n🔗 [点击这里](${rickrollLink})`)
        .setImage('https://i.imgflip.com/2z85z.jpg');
      
      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('🎵 Never Gonna Give You Up!')
        .setColor(0xff0000)
        .setDescription(`🔗 [点击这里](${rickrollLink})`)
        .setImage('https://i.imgflip.com/2z85z.jpg');
      
      await interaction.reply({ embeds: [embed] });
    }
  }
};