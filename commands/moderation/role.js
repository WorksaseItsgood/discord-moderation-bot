const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

// Role command - add or remove a role from a user
module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Add or remove a role from a user')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to modify')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Role to add or remove')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Action to perform')
        .setRequired(false)
        .addChoices(
          { name: 'Add', value: 'add' },
          { name: 'Remove', value: 'remove' }
        ))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for modifying role')
        .setRequired(false)),
  permissions: [PermissionFlagsBits.ManageRoles],
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const action = interaction.options.getString('action') || 'add';
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({
        content: '❌ User not found in this server!',
        ephemeral: true
      });
    }
    
    // Check if bot can manage the role
    const botMember = interaction.guild.members.cache.get(client.user.id);
    if (role.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content: '❌ I cannot manage this role! It is higher than my highest role.',
        ephemeral: true
      });
    }
    
    let success = false;
    try {
      if (action === 'add') {
        await member.roles.add(role, reason);
        success = true;
      } else {
        await member.roles.remove(role, reason);
        success = true;
      }
    } catch (error) {
      return interaction.reply({
        content: `❌ Error modifying role: ${error.message}`,
        ephemeral: true
      });
    }
    
    const actionText = action === 'add' ? 'Added' : 'Removed';
    console.log(`[Role] ${actionText} role ${role.name} from ${user.tag} in ${interaction.guild.name}`);
    
    const embed = new EmbedBuilder()
      .setTitle(`${actionText === 'Added' ? '➕' : '➖'} Role Modified`)
      .setColor(action === 'add' ? 0x00ff00 : 0xff0000)
      .addFields(
        { name: 'User', value: `${user} (${user.id})`, inline: true },
        { name: 'Role', value: role.toString(), inline: true },
        { name: 'Action', value: actionText, inline: true },
        { name: 'Reason', value: reason, inline: false }
      );
    
    await interaction.reply({ embeds: [embed] });
    
    // Log to mod log channel
    const logChannel = interaction.guild.channels.cache.find(ch => 
      ch.name === 'mod-logs' || ch.name === 'moderation-logs'
    );
    
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  }
};