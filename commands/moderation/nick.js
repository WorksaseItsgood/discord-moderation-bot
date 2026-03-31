const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nick')
    .setDescription('Mass rename users')
    .addStringOption(option =>
      option.setName('pattern')
        .setDescription('Nickname pattern (use {user} for username)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('filter')
        .setDescription('Filter members')
        .addStringChoice('all', 'all')
        .addStringChoice('no-nick', 'no-nick')
        .addStringChoice('has-nick', 'has-nick')),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return interaction.reply({ content: '❌ You need Manage Nicknames permission!', ephemeral: true });
    }

    const pattern = interaction.options.getString('pattern');
    const filter = interaction.options.getString('filter') || 'all';
    const guild = interaction.guild;
    const members = await guild.members.fetch();

    let changed = 0;
    const botMember = await guild.members.fetchMe();

    for (const [id, member] of members) {
      if (member.user.bot) continue;
      if (!member.manageable) continue;

      const hasNick = member.nickname !== null;

      if (filter === 'no-nick' && hasNick) continue;
      if (filter === 'has-nick' && !hasNick) continue;

      try {
        const newNick = pattern.replace('{user}', member.user.username);
        await member.setNickname(newNick.substring(0, 32));
        changed++;
      } catch (e) {
        console.log(e);
      }
    }

    await interaction.reply({ content: `✅ Changed nicknames for ${changed} members!`, ephemeral: true });
  },
};