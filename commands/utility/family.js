const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Family command - Family tree
module.exports = {
  data: new SlashCommandBuilder()
    .setName('family')
    .setDescription('View your family tree')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to view family of')
        .setRequired(false)),
  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    
    if (!client.families) client.families = new Map();
    
    const familyData = client.families.get(targetUser.id);
    
    if (!familyData || (!familyData.parent && !familyData.children && !familyData.spouse)) {
      return interaction.reply({ 
        content: targetUser.id === interaction.user.id 
          ? "You don't have a family set up yet!" 
          : targetUser.toString() + " doesn't have a family set up!",
        ephemeral: true 
      });
    }
    
    const embed = new EmbedBuilder()
      .setTitle('Family Tree: ' + targetUser.username)
      .setColor(0x3498db);
    
    if (familyData.parent) {
      const parent = await interaction.client.users.fetch(familyData.parent).catch(() => null);
      embed.addFields({ name: 'Parent', value: parent ? parent.toString() : 'Unknown', inline: true });
    }
    
    if (familyData.spouse) {
      const spouse = await interaction.client.users.fetch(familyData.spouse).catch(() => null);
      embed.addFields({ name: 'Spouse', value: spouse ? spouse.toString() : 'Unknown', inline: true });
    }
    
    if (familyData.children && familyData.children.length > 0) {
      const childMentions = await Promise.all(
        familyData.children.slice(0, 5).map(async (childId) => {
          const child = await interaction.client.users.fetch(childId).catch(() => null);
          return child ? child.toString() : 'Unknown';
        })
      );
      embed.addFields({ name: 'Children', value: childMentions.join(', '), inline: true });
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};