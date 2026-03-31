/**
 * Fact Command - Random fun fact
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const facts = [
  "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible.",
  "Octopuses have three hearts and blue blood.",
  "Bananas are berries, but strawberries aren't.",
  "A day on Venus is longer than a year on Venus.",
  "The shortest war in history lasted 38-45 minutes between Britain and Zanzibar in 1896.",
  "Cleopatra lived closer in time to the moon landing than to the building of the Great Pyramid.",
  "A group of flamingos is called a 'flamboyance'.",
  "Wombat poop is cube-shaped to prevent it from rolling away.",
  "The unicorn is the national animal of Scotland.",
  "There are more possible chess games than atoms in the observable universe.",
  "Crows can recognize human faces and hold grudges.",
  "The world's oldest known living tree is over 5,000 years old.",
  "Your stomach gets a new lining every 3-4 days to prevent it from digesting itself.",
  "Sea otters hold hands when they sleep to keep from drifting apart.",
  "A jiffy is an actual unit of time: 1/100th of a second.",
  "The world's first webcam was created at Cambridge to monitor a coffee pot.",
  "Dolphins sleep with one eye open.",
  "Sloths can hold their breath longer than seals can.",
  "The lightning bolt symbol ⚡ is actually the Greek letter delta.",
  "Hot water freezes faster than cold water in some conditions ( Mpemba effect)."
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fact')
    .setDescription('Get a random fun fact'),
  
  async execute(interaction, client) {
    const fact = facts[Math.floor(Math.random() * facts.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('💡 Did You Know?')
      .setDescription(fact)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};