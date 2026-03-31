/**
 * Emoji Info Command - Get info about an emoji
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('emoji-info')
    .setDescription('Get info about an emoji')
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('Emoji to get info about')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const emojiStr = interaction.options.getString('emoji');
    
    // Parse custom emoji
    const customEmojiMatch = emojiStr.match(/<a?:(.+):(\d+)>/);
    
    if (!customEmojiMatch) {
      await interaction.reply({ content: 'Please provide a custom emoji!', ephemeral: true });
      return;
    }
    
    const name = customEmojiMatch[1];
    const id = customEmojiMatch[2];
    const animated = emojiStr.startsWith('<a:');
    
    const embed = new EmbedBuilder()
      .setTitle('Emoji Info')
      .addFields(
        { name: 'Name', value: name },
        { name: 'ID', value: id },
        { name: 'Animated', value: animated ? 'Yes' : 'No' },
        { name: 'Link', value: `[Click here](https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}?size=256)` }
      )
      .setImage(`https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}?size=256`)
      .setColor(0x0099ff);
    
    await interaction.reply({ embeds: [embed] });
  }
};