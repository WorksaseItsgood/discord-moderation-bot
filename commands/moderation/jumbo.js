/**
 * Jumbo Command - Jumbofy an emoji
 */

const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jumbo')
    .setDescription('Make an emoji huge')
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('Emoji to jumbo')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const emojiStr = interaction.options.getString('emoji');
    
    // Parse custom emoji
    const customEmojiMatch = emojiStr.match(/<a?:\w+:(\d+)>/);
    let emojiUrl = null;
    
    if (customEmojiMatch) {
      const emojiId = customEmojiMatch[1];
      const animated = emojiStr.startsWith('<a:');
      emojiUrl = `https://cdn.discordapp.com/emojis/${emojiId}.${animated ? 'gif' : 'png'}?size=512`;
    } else if (emojiStr.includes('🫧') || emojiStr.match(/\p{Emoji}/u)) {
      // Regular emoji - just respond with it larger in text
      await interaction.reply(`💠 ${emojiStr} 💠`);
      return;
    }
    
    if (!emojiUrl) {
      await interaction.reply({ content: 'Please provide a custom emoji!', ephemeral: true });
      return;
    }
    
    await interaction.reply(emojiUrl);
  }
};