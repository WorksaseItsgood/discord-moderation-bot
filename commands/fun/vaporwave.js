const { SlashCommandBuilder } = require('discord.js');

const variants = ['lowercase', 'fullwidth', 'bubble', 'small', 'gothic', 'cursive'];
const charmaps = {
  lowercase: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ',
  fullwidth: 'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ',
  bubble: 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ',
  small: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ',
  gothic: '𝒜𝐵𝒞𝒟𝐸𝒢𝒣𝒤𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝑸𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵',
  cursive: '𝒶𝒷𝒸𝒹𝒺𝒻𝒼𝒽𝒾𝒿�𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏'
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('vaporwave')
    .setDescription('Convert text to vaporwave style')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Text to convert')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('style')
        .setDescription('Vaporwave style')
        .addStringChoice('lowercase', 'lowercase')
        .addStringChoice('fullwidth', 'fullwidth')
        .addStringChoice('bubble', 'bubble')
        .addStringChoice('small', 'small')
        .addStringChoice('gothic', 'gothic')
        .addStringChoice('cursive', 'cursive')),
  async execute(interaction) {
    const text = interaction.options.getString('text');
    const style = interaction.options.getString('style') || 'fullwidth';

    let converted = '';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    
    for (const char of text.toLowerCase()) {
      const idx = lower.indexOf(char);
      if (idx >= 0 && charmaps[style]) {
        converted += charmaps[style][idx];
      } else {
        converted += char;
      }
    }

    const embed = {
      title: '🌊 Vaporwave',
      description: `**${style}**\n\n${converted}`,
      color: 0xFF71CE,
      timestamp: new Date().toISOString(),
    };

    await interaction.reply({ embeds: [embed] });
  },
};