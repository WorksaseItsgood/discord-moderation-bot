import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('vote')
    .setNameLocalizations({ fr: 'vote', 'en-US': 'vote' })
    .setDescription('Créer un vote oui/non')
    .setDescriptionLocalizations({ fr: 'Créer un vote oui/non', 'en-US': 'Create a yes/no vote' })
    .addStringOption(option =>
      option.setName('question')
        .setNameLocalizations({ fr: 'question', 'en-US': 'question' })
        .setDescription('La question du vote')
        .setDescriptionLocalizations({ fr: 'La question du vote', 'en-US': 'The vote question' })
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
  name: 'vote',
  permissions: { user: [PermissionFlagsBits.ManageMessages], bot: [] },
  async execute(interaction, client) {
    try {
      const question = interaction.options.getString('question');

      const embed = new EmbedBuilder()
        .setTitle(`🗳️ ${question}`)
        .setDescription('Réagissez avec ✅ pour oui et ❌ pour non.')
        .setColor(0xf39c12)
        .setFooter({ text: `Vote créé par ${interaction.user.username}` })
        .setTimestamp();

      const message = await interaction.reply({ embeds: [embed], fetchReply: true });

      await message.react('✅');
      await message.react('❌');

    } catch (error) {
      console.error('Erreur lors de la création du vote:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de la création du vote.', ephemeral: true });
    }
  },
};
