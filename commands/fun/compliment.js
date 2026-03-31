/**
 * Compliment Command - Give a user a compliment
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const compliments = [
  "You're absolutely amazing! 🌟",
  "You light up every room you enter! ✨",
  "Your smile is contagious! 😊",
  "You're stronger than you know! 💪",
  "You make the world a better place! 🌍",
  "Your creativity inspires me! 🎨",
  "You're a genuinely wonderful person! ❤️",
  "You have an incredible sense of humor! 😂",
  "Your determination is admirable! 🔥",
  "You can achieve anything you set your mind to! 🌈",
  "You're one of a kind! 💎",
  "Your kindness makes a difference! 🤗",
  "You have the best ideas! 💡",
  "Your energy is absolutely infectious! ⚡",
  "You're doing an amazing job! 🙌",
  "Your voice matters! 🗣️",
  "You inspire others every day! 🌟",
  "You're incredibly talented! 🎯",
  "Your hard work is paying off! 💰",
  "You're someone people look up to! 👑"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('compliment')
    .setDescription('Give a user a compliment')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to compliment')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const compliment = compliments[Math.floor(Math.random() * compliments.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('💖 Compliment Time!')
      .setDescription(`**${user.username}** - ${compliment}`)
      .setColor(0xff69b4);
    
    await interaction.reply({ embeds: [embed] });
  }
};