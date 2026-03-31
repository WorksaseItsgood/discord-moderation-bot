const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicemove')
    .setDescription('Move user to another voice channel')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to move')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Voice channel to move to')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
      return interaction.reply({ content: '❌ You need Move Members permission!', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const channel = interaction.options.getChannel('channel');
    const member = await interaction.guild.members.fetch(user.id);
    
    if (!member) {
      return interaction.reply({ content: '❌ User not found!', ephemeral: true });
    }

    if (!channel.isVoiceBased()) {
      return interaction.reply({ content: '❌ Please select a voice channel!', ephemeral: true });
    }

    await member.voice.setChannel(channel);

    const embed = {
      title: '🎤 Voice Move',
      description: `Moved ${user} to ${channel}!`,
      color: 0x5865F2,
    };

    await interaction.reply({ embeds: [embed] });
  },
};