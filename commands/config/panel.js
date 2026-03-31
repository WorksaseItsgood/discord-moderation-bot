/**
 * Panel Command - Create reaction role panel
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Create a reaction role panel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send panel')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('title')
        .setDescription('Panel title')
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Panel description')
        .setRequired(false)
    ),
  permissions: ['ManageRoles'],
  
  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title') || 'Role Picker';
    const description = interaction.options.getString('description') || 'Click a button to get a role!';
    
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(0x0099ff);
    
    // Create a sample button (users can add more with /reaction-role)
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('role-sample')
          .setLabel('Sample Role')
          .setStyle(ButtonStyle.Primary)
      );
    
    await channel.send({ embeds: [embed], components: [row] });
    
    await interaction.reply({ content: `✅ Panel created in ${channel}!`, ephemeral: true });
  }
};