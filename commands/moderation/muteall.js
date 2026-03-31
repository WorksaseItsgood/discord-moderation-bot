const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('muteall')
    .setDescription('Mute everyone in voice channels'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.MuteMembers)) {
      return interaction.reply({ content: '❌ You need Mute Members permission!', ephemeral: true });
    }

    const guild = interaction.guild;
    const members = await guild.members.fetch();
    let muted = 0;

    for (const [id, member] of members) {
      if (member.voice.channel && member.voice.channel.isVoiceBased()) {
        try {
          await member.voice.setMute(true, 'Muted by ' + interaction.user.tag);
          muted++;
        } catch (e) {
          console.log(e);
        }
      }
    }

    await interaction.reply({ content: `✅ Muted ${muted} members in voice!`, ephemeral: true });
  },
};