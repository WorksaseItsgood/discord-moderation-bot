import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('say')
    .setNameLocalizations({ fr: 'say', 'en-US': 'say' })
    .setDescription('Faire répéter le bot')
    .setDescriptionLocalizations({ fr: 'Faire répéter le bot', 'en-US': 'Make the bot repeat' })
    .addStringOption(option =>
      option.setName('text')
        .setNameLocalizations({ fr: 'text', 'en-US': 'text' })
        .setDescription('Le texte à répéter')
        .setDescriptionLocalizations({ fr: 'Le texte à répéter', 'en-US': 'The text to repeat' })
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
  name: 'say',
  permissions: { user: [PermissionFlagsBits.ManageMessages], bot: [] },
  async execute(interaction, client) {
    try {
      const text = interaction.options.getString('text');

      await interaction.reply({ content: '✅ Message envoyé !', ephemeral: true });
      await interaction.channel.send(text);

    } catch (error) {
      console.error('Erreur lors de l\'exécution de la commande say:', error);
      await interaction.reply({ content: 'Une erreur est survenue.', ephemeral: true });
    }
  },
};
