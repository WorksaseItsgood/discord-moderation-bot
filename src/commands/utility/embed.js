import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setNameLocalizations({ fr: 'embed', 'en-US': 'embed' })
    .setDescription('Créer un embed')
    .setDescriptionLocalizations({ fr: 'Créer un embed', 'en-US': 'Create an embed' })
    .addStringOption(option =>
      option.setName('title')
        .setNameLocalizations({ fr: 'title', 'en-US': 'title' })
        .setDescription('Le titre de l\'embed')
        .setDescriptionLocalizations({ fr: 'Le titre de l\'embed', 'en-US': 'The embed title' })
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setNameLocalizations({ fr: 'description', 'en-US': 'description' })
        .setDescription('La description de l\'embed')
        .setDescriptionLocalizations({ fr: 'La description de l\'embed', 'en-US': 'The embed description' })
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
  name: 'embed',
  permissions: { user: [PermissionFlagsBits.ManageMessages], bot: [] },
  async execute(interaction, client) {
    try {
      const title = interaction.options.getString('title');
      const description = interaction.options.getString('description');

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(0x3498db)
        .setFooter({ text: `Embed créé par ${interaction.user.username}` })
        .setTimestamp();

      await interaction.channel.send({ embeds: [embed] });
      await interaction.reply({ content: '✅ Embed envoyé !', ephemeral: true });

    } catch (error) {
      console.error('Erreur lors de la création de l\'embed:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de la création de l\'embed.', ephemeral: true });
    }
  },
};
