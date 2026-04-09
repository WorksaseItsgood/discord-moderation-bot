import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
export default {
  data: new SlashCommandBuilder().setName('leaderboard').setNameLocalizations({ fr: 'leaderboard', 'en-US': 'leaderboard' }).setDescription('Show mod leaderboard').setDescriptionLocalizations({ fr: 'Afficher le classement des modérateurs', 'en-US': 'Show mod leaderboard' }),
  name: 'leaderboard', permissions: { user: [PermissionFlagsBits.ManageMessages], bot: [] },
  async execute(interaction, client) {
    await interaction.reply({ content: '📊 Classement des modérateurs:\n\n1. - 0 actions\n\nAucun historique disponible.', ephemeral: true });
  },
};
