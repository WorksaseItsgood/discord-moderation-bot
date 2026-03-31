const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Rep command - Reputation system
module.exports = {
  data: new SlashCommandBuilder()
    .setName('rep')
    .setDescription('Give reputation to a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to give rep')
        .setRequired(true)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    if (user.id === interaction.user.id) {
      return interaction.reply({ content: "You can't give rep to yourself!", ephemeral: true });
    }
    
    if (!client.reputation) client.reputation = new Map();
    
    const userRep = client.reputation.get(user.id) || 0;
    client.reputation.set(user.id, userRep + 1);
    
    const embed = new EmbedBuilder()
      .setTitle('⭐ Reputation Given')
      .setColor(0xffd700)
      .setDescription('You gave ⭐ to ' + user.toString() + '!')
      .addFields([
        { name: 'Total Rep', value: String(userRep + 1), inline: true }
      ]);
    
    await interaction.reply({ embeds: [embed] });
  }
};