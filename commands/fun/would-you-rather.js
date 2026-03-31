/**
 * Would You Rather Command - Would you rather game
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const questions = [
  { a: "Have unlimited free food for life", b: "Have unlimited free travel for life" },
  { a: "Be able to fly", b: "Be invisible" },
  { a: "Know how you will die", b: "Know when you will die" },
  { a: "Be a famous actor", b: "Be a famous musician" },
  { a: "Live without music", b: "Live without movies" },
  { a: "Be the funniest person", b: "Be the smartest person" },
  { a: "Have unlimited money", b: "Have unlimited time" },
  { a: "Live forever", b: "Be able to talk to animals" },
  { a: "Be able to read minds", b: "Be able to see the future" },
  { a: "Have a rewind button in life", b: "Have a pause button in life" },
  { a: "Be famous right now", b: "Be famous 100 years from now" },
  { a: "Have super strength", b: "Have super speed" },
  { a: "Live in the city", b: "Live in the countryside" },
  { a: "Be able to speak all languages", b: "Be able to play all instruments" },
  { a: "Have a personal chef", b: "Have a personal driver" },
  { a: "Never use social media again", b: "Never watch TV again" },
  { a: "Explore space", b: "Explore the ocean" },
  { a: "Be able to teleport", b: "Be able to time travel" },
  { a: "Have no phone", b: "Have no computer" },
  { a: "Be able to talk to plants", b: "Be able to talk to dead people" }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('would-you-rather')
    .setDescription('Would you rather...'),
  
  async execute(interaction, client) {
    const q = questions[Math.floor(Math.random() * questions.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('🤔 Would You Rather...')
      .setDescription(`**A:** ${q.a}\n\n**B:** ${q.b}`)
      .addFields(
        { name: '💡 Vote', value: 'Click ✅ for A or ❌ for B' }
      )
      .setColor(0x0099ff);
    
    await interaction.reply({ embeds: [embed] });
  }
};