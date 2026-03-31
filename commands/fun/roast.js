/**
 * Roast Command - Roast a user
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const roasts = [
  "You're the reason the gene pool needs a lifeguard.",
  "I'd agree with you, but then we'd both be wrong.",
  "You're as useless as the 'close window' button on the download page.",
  "If you were any more inbred, you'd be a telephone.",
  "You're not stupid; you just have bad luck thinking.",
  "I'd explain it to you, but I left my crayons at home.",
  "You're proof that evolution can go in reverse.",
  "I don't hate you, but I'd be very happy if you got hit by a truck.",
  "You're about as useful as a screen door on a submarine.",
  "If laughter is the best medicine, your face must be curing cancer.",
  "You bring everyone so much joy... when you leave.",
  "You're the human equivalent of a typo.",
  "My imaginary friend says you need to stop being a jerk.",
  "You're the reason I don't give candy to strangers.",
  "You have something on your face... oh wait, it's your personality.",
  "Are you always this stupid, or do you just like being average?",
  "I'd call you a snowflake, but you'd melt.",
  "You have the personality of a damp paper towel.",
  "If you were any more boring, I'd fall asleep.",
  "You're about as useful as a phone without service."
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roast')
    .setDescription('Roast a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to roast')
        .setRequired(true)
    ),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const roast = roasts[Math.floor(Math.random() * roasts.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('🔥 Roasting Time!')
      .setDescription(`${user}, ${roast}`)
      .setColor(0xff0000);
    
    await interaction.reply({ embeds: [embed] });
  }
};