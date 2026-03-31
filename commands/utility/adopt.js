const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Adopt command - Adopt a user
module.exports = {
  data: new SlashCommandBuilder()
    .setName('adopt')
    .setDescription('Adopt a user as your child')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to adopt')
        .setRequired(true)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    
    if (user.id === interaction.user.id) {
      return interaction.reply({ content: "You can't adopt yourself!", ephemeral: true });
    }
    
    if (!client.families) client.families = new Map();
    
    // Check if user is already adopted
    const userFamily = client.families.get(user.id);
    if (userFamily && userFamily.parent) {
      return interaction.reply({ content: "That user is already someone's child!", ephemeral: true });
    }
    
    const myFamily = client.families.get(interaction.user.id);
    if (myFamily && myFamily.children && myFamily.children.length >= 3) {
      return interaction.reply({ content: "You can only adopt up to 3 children!", ephemeral: true });
    }
    
    // Set parent
    if (!client.families.has(interaction.user.id)) {
      client.families.set(interaction.user.id, { children: [] });
    }
    
    const familyData = client.families.get(interaction.user.id);
    if (!familyData.children) familyData.children = [];
    familyData.children.push(user.id);
    client.families.set(interaction.user.id, familyData);
    
    client.families.set(user.id, { parent: interaction.user.id });
    
    const embed = new EmbedBuilder()
      .setTitle('Family')
      .setColor(0x3498db)
      .setDescription(interaction.user.toString() + ' adopted ' + user.toString() + ' as their child!');
    
    await interaction.reply({ embeds: [embed] });
  }
};