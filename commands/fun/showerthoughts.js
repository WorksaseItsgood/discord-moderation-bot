const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Showerthoughts command - Random shower thought
module.exports = {
  data: new SlashCommandBuilder()
    .setName('showerthoughts')
    .setDescription('Get a random shower thought'),
  async execute(interaction, client) {
    const thoughts = [
      "If you cut a pizza into 4 pieces, it's actually quarters, but if you cut it into 3 pieces, you could call it a thirds.",
      "Most people don't realize that their WiFi password is literally designed to be shared with guests.",
      "The phrase 'it's the thought that counts' makes no sense because thoughts don't count for anything.",
      "Your hand is never really empty because you always have your skeleton inside you.",
      "Sleep is like a free version of death where you don't have to be dead.",
      "Everytime you buy a new rubber band, you're potentially saving someone's life.",
      "We call the front of a plane the nose, but we don't call the back the butt.",
      "The person who named the fireplace was a genius because it's literally a place of fire.",
      "Your brain does so much involuntary work for you that you could call it your 'auto-pilot'.",
      "Bread is just toast's younger self.",
      "The most useless feature on a calculator is the 'OFF' button because nobody ever uses it.",
      "There's no rule in biology that says you can't be friends with your imaginary pet.",
      "Socks are the only piece of clothing that we lose every time we walk out of a building.",
      "The word 'bed' looks like a bed but it's actually a piece of furniture, not somewhere to sleep.",
      "If you say 'I am rich' in the mirror, you're technically not lying.",
      "We pay money for coffee when there's free water available.",
      "We call it a 'cell phone' but we're not in prison unless we can't afford the bill.",
      "The person who invented the wheel was probably really bored before that.",
      "If you're reading this, you just proved your eyes still work.",
      "Your future self will definitely look back and wonder why you ever worried."
    ];
    
    const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('🚿 Random Shower Thought')
      .setColor(0x00bfff)
      .setDescription(`*"${thought}"*`);
    
    await interaction.reply({ embeds: [embed] });
  }
};