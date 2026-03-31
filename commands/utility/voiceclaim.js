const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voiceclaim')
    .setDescription('Claim a user from AFK channel')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to claim')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
      return interaction.reply({ content: '❌ You need Move Members permission!', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id);
    
    if (!member) {
      return interaction.reply({ content: '❌ User not found!', ephemeral: true });
    }

    const afkChannel = interaction.guild.afkChannel;
    if (!afkChannel || member.voice.channelId !== afkChannel.id) {
      return interaction.reply({ content: '❌ User is not in AFK channel!', ephemeral: true });
    }

    // Move to the user's last channel or a default
    await member.voice.disconnect();

    const embed = {
      title: '🎤 Voice Claim',
      description: `Claimed ${user} from AFK!`,
      color: 0x5865F2,
    };

    await interaction.reply({ embeds: [embed] });
  },
};