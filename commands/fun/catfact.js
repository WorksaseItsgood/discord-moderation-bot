/**
 * Cat Fact Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('catfact')
    .setDescription('Get a random cat fact'),
  
  async execute(interaction, client) {
    const facts = [
      'Cats spend 70% of their lives sleeping.',
      'A cat\'s purr vibrates at 25-150 Hz.',
      'Cats have over 20 vocalizations.',
      'The oldest cat was 38 years old.',
      'Cats can jump 6x their length.',
      'A group of cats is called a clowder.'
    ];
    
    const fact = facts[Math.floor(Math.random() * facts.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('🐱 Cat Fact')
      .setDescription(fact)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};