const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Insult command - Insult generator
module.exports = {
  data: new SlashCommandBuilder()
    .setName('insult')
    .setDescription('Generate a creative insult')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to insult')
        .setRequired(false)),
  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('user');
    const insults = [
      "You're the reason the gene pool needs a life guard.",
      "If you were any more inbred, you'd be a sandwich.",
      "You bring everyone so much joy... when you leave.",
      "I'm not saying I hate you, but I would unplug your life support to charge my phone.",
      "You have the face of a potato and the brain to match.",
      "You're the human equivalent of a typo.",
      "I'd explain it to you, but I left my crayons at home.",
      "You're not stupid; you just have bad luck thinking.",
      "Your family tree is a cactus because everybody on it is a prick.",
      "You bring so much happiness to my heart... and then everyone else's.",
      "If you were any more obsolete, they'd list you in the dictionary.",
      "You're the reason aliens won't visit Earth.",
      "I'm not a psychiatrist, but I can definitely analyze what's wrong with you.",
      "You have the personality of a damp towel.",
      "Everytime you type, a village loses a smart person."
    ];
    
    const insult = insults[Math.floor(Math.random() * insults.length)];
    
    if (targetUser) {
      const embed = new EmbedBuilder()
        .setTitle('😏 Insult Generator')
        .setColor(0xff0000)
        .setDescription(`${targetUser} ${insult}`);
      
      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('😏 Insult Generator')
        .setColor(0xff0000)
        .setDescription(insult);
      
      await interaction.reply({ embeds: [embed] });
    }
  }
};