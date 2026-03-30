/**
 * Meme Command - Get random meme
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme'),
  
  async execute(interaction, client) {
    // Using hardcoded memes as fallback
    const memes = [
      {
        title: 'When the bot finally works',
        url: 'https://i.imgur.com/3s2y0.gif',
        description: 'Bot coding be like...'
      },
      {
        title: 'No bugs, only features',
        url: 'https://i.imgur.com/YyZMssV.gif',
        description: 'When you delete the code that was causing issues'
      },
      {
        title: 'Debugging in production',
        url: 'https://i.imgur.com/e5RT9.gif',
        description: 'Me at 3am wondering why it works on local but not in prod'
      }
    ];
    
    const meme = memes[Math.floor(Math.random() * memes.length)];
    
    const embed = new EmbedBuilder()
      .setTitle(meme.title)
      .setColor(0x0099ff)
      .setDescription(meme.description)
      .setImage(meme.url);
    
    await interaction.reply({ embeds: [embed] });
  }
};