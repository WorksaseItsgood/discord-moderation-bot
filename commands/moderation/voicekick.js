const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voicekick')
    .setDescription('Kick everyone from voice channels'),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.MoveMembers)) {
      return interaction.reply({ content: '❌ You need Move Members permission!', ephemeral: true });
    }

    const guild = interaction.guild;
    const members = await guild.members.fetch();
    let kicked = 0;

    for (const [id, member] of members) {
      if (member.voice.channel && member.voice.channel.isVoiceBased()) {
        try {
          await member.voice.disconnect();
          kicked++;
        } catch (e) {
          console.log(e);
        }
      }
    }

    await interaction.reply({ content: `✅ Kicked ${kicked} members from voice channels!`, ephemeral: true });
  },
};