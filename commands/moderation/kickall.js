const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kickall')
    .setDescription('Kick all members from the server (with optional filter)')
    .addStringOption(option =>
      option.setName('filter')
        .setDescription('Filter: joined before, joined after, or no filter')
        .addString Choice('before', 'before')
        .addStringChoice('after', 'after')
        .addStringChoice('no-filter', 'no-filter'))
    .addStringOption(option =>
      option.setName('date')
        .setDescription('Date for filter (YYYY-MM-DD)'))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Kick members who joined more than X days ago')),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ content: '❌ You need Kick Members permission!', ephemeral: true });
    }

    const filter = interaction.options.getString('filter') || 'no-filter';
    const date = interaction.options.getString('date');
    const days = interaction.options.getInteger('days');
    const guild = interaction.guild;
    const members = await guild.members.fetch();

    let toKick = [];
    const now = new Date();

    for (const [id, member] of members) {
      if (member.kickable && !member.user.bot) {
        if (filter === 'before' && date) {
          const filterDate = new Date(date);
          if (member.joinedAt && member.joinedAt < filterDate) toKick.push(member);
        } else if (filter === 'after' && date) {
          const filterDate = new Date(date);
          if (member.joinedAt && member.joinedAt > filterDate) toKick.push(member);
        } else if (filter === 'no-filter' || !filter) {
          if (days) {
            const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            if (member.joinedAt && member.joinedAt < cutoff) toKick.push(member);
          } else {
            toKick.push(member);
          }
        }
      }
    }

    if (toKick.length === 0) {
      return interaction.reply({ content: 'No members found to kick!', ephemeral: true });
    }

    await interaction.reply({ content: `🤔 Kicking ${toKick.length} members... This may take a while.`, ephemeral: true });

    let kicked = 0;
    for (const member of toKick) {
      try {
        await member.kick('Mass kick by ' + interaction.user.tag);
        kicked++;
      } catch (e) {
        console.log(e);
      }
    }

    await interaction.followUp({ content: `✅ Successfully kicked ${kicked} members!`, ephemeral: true });
  },
};