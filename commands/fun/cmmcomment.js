const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Cmmcomment command - Fake comment section
module.exports = {
  data: new SlashCommandBuilder()
    .setName('cmmcomment')
    .setDescription('Create fake comment section')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Comment text')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to mention')
        .setRequired(false)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const text = interaction.options.getString('text');
    
    const comments = [
      { user: user.username, text: text, likes: Math.floor(Math.random() * 500) + 1 },
      { user: 'User' + Math.floor(Math.random() * 1000), text: 'Great post!', likes: Math.floor(Math.random() * 100) },
      { user: 'Fan' + Math.floor(Math.random() * 500), text: 'This is amazing!', likes: Math.floor(Math.random() * 50) }
    ];
    
    let description = '';
    for (const c of comments) {
      description += '**' + c.user + '**\n' + c.text + '\n👍 ' + c.likes + '\n\n';
    }
    
    const embed = new EmbedBuilder()
      .setTitle('Comments')
      .setColor(0x00ff00)
      .setDescription(description)
      .setFooter({ text: 'View all 3 comments' });
    
    await interaction.reply({ embeds: [embed] });
  }
};