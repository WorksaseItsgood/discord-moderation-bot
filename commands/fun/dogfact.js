/**
 * Dog Fact Command
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dogfact')
    .setDescription('Get a random dog fact'),
  
  async execute(interaction, client) {
    const facts = [
      'Dogs have wet noses to help absorb scent chemicals.',
      'Dogs can be trained to detect cancer.',
      'A dog\'s smell is 10,000 times stronger than humans.',
      'Greyhounds are the fastest dogs, up to 45 mph.',
      'Dogs dream just like humans.',
      'Puppies have 28 teeth, adults have 42.'
    ];
    
    const fact = facts[Math.floor(Math.random() * facts.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('🐕 Dog Fact')
      .setDescription(fact)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};