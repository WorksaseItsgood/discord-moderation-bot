/**
 * Reaction Role Command - Add reaction role
 */

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reaction-role')
    .setDescription('Add a reaction role')
    .addMentionableOption(option =>
      option.setName('role')
        .setDescription('Role to give')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('Emoji for the button')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('label')
        .setDescription('Button label')
        .setRequired(false)
    ),
  permissions: ['ManageRoles'],
  
  async execute(interaction, client) {
    const role = interaction.options.getMentionable('role');
    const emoji = interaction.options.getString('emoji');
    const label = interaction.options.getString('label') || role.name;
    
    if (!interaction.guild.roles.cache.has(role.id)) {
      return interaction.reply({ content: 'Role not found in this server!', ephemeral: true });
    }
    
    // Initialize reaction roles storage
    if (!client.reactionRoles) client.reactionRoles = new Map();
    
    const guildId = interaction.guildId;
    if (!client.reactionRoles.has(guildId)) {
      client.reactionRoles.set(guildId, new Map());
    }
    
    client.reactionRoles.get(guildId).set(role.id, { role, emoji, label });
    
    const embed = new EmbedBuilder()
      .setTitle('✅ Reaction Role Added')
      .setDescription(`Role: ${role}\nEmoji: ${emoji}\nLabel: ${label}`)
      .setColor(0x00ff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};