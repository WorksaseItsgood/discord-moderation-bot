const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banall')
    .setDescription('Ban all members from the server (with optional filter)')
    .addStringOption(option =>
      option.setName('filter')
        .setDescription('Filter type')
        .setChoices(
          { name: 'joined-before', value: 'before' },
          { name: 'joined-after', value: 'after' },
          { name: 'no-filter', value: 'no-filter' }
        ))
    .addStringOption(option =>
      option.setName('date')
        .setDescription('Date for filter (YYYY-MM-DD)'))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Ban members who joined more than X days ago')),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: '❌ You need Ban Members permission!', ephemeral: true });
    }

    const filter = interaction.options.getString('filter') || 'no-filter';
    const date = interaction.options.getString('date');
    const days = interaction.options.getInteger('days');
    const guild = interaction.guild;
    const members = await guild.members.fetch();

    let toBan = [];
    const now = new Date();

    for (const [id, member] of members) {
      if (member.bannable && !member.user.bot) {
        if (filter === 'before' && date) {
          const filterDate = new Date(date);
          if (member.joinedAt && member.joinedAt < filterDate) toBan.push(member);
        } else if (filter === 'after' && date) {
          const filterDate = new Date(date);
          if (member.joinedAt && member.joinedAt > filterDate) toBan.push(member);
        } else if (filter === 'no-filter' || !filter) {
          if (days) {
            const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            if (member.joinedAt && member.joinedAt < cutoff) toBan.push(member);
          } else {
            toBan.push(member);
          }
        }
      }
    }

    if (toBan.length === 0) {
      return interaction.reply({ content: 'No members found to ban!', ephemeral: true });
    }

    await interaction.reply({ content: `🤔 Banning ${toBan.length} members... This may take a while.`, ephemeral: true });

    let banned = 0;
    for (const member of toBan) {
      try {
        await member.ban({ reason: 'Mass ban by ' + interaction.user.tag });
        banned++;
      } catch (e) {
        console.log(e);
      }
    }

    await interaction.followUp({ content: `✅ Successfully banned ${banned} members!`, ephemeral: true });
  },
};