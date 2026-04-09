import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('avlookup')
    .setNameLocalizations({ fr: 'avlookup', 'en-US': 'avlookup' })
    .setDescription('Voir l\'avatar d\'un utilisateur')
    .setDescriptionLocalizations({ fr: 'Voir l\'avatar d\'un utilisateur', 'en-US': 'View a user\'s avatar' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'user', 'en-US': 'user' })
        .setDescription('L\'utilisateur')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur', 'en-US': 'The user' })
        .setRequired(false))
    .setDMPermission(false),
  name: 'avlookup',
  permissions: { user: [], bot: [] },
  async execute(interaction, client) {
    try {
      const user = interaction.options.getUser('user') || interaction.user;
      const avatar = user.displayAvatarURL({ dynamic: true, size: 4096 });
      const isgif = user.avatar?.startsWith('a_') || user.avatarURL?.includes('.gif');

      const embed = new EmbedBuilder()
        .setTitle(`Avatar de ${user.username}`)
        .setImage(avatar)
        .setDescription(`[Télécharger l'avatar](${avatar}) ${isgif ? '• GIF animé' : ''}`)
        .setColor(0x3498db)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Erreur lors de la récupération de l\'avatar:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de la récupération de l\'avatar.', ephemeral: true });
    }
  },
};
