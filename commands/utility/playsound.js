const { SlashCommandBuilder } = require('discord.js');

const sounds = {
  'airhorn': '🔊 Airhorn',
  'cricket': '🦗 Cricket',
  'danger': '⚠️ Danger',
  'yeet': '🎯 Yeet',
  'wow': '😲 Wow',
  'sad': '😢 Sad',
  'vine-boom': '💥 Vine Boom',
  'rimshot': '🥁 Rimshot',
  'wrong': '❌ Wrong',
  'taco': '🌮 Taco',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('playsound')
    .setDescription('Play a sound effect')
    .addStringOption(option =>
      option.setName('sound')
        .setDescription('Sound to play')
        .setRequired(true)),
  async execute(interaction) {
    const sound = interaction.options.getString('sound');
    
    const embed = {
      title: '🔊 Playing Sound',
      description: `**${sounds[sound] || sound}**\n\n*Join a voice channel to hear the sound*`,
      color: 0x5865F2,
    };

    await interaction.reply({ embeds: [embed] });
  },
};