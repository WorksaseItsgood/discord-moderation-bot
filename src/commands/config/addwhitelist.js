import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { addToWhitelist } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('addwhitelist')
    .setNameLocalizations({ fr: 'addwhitelist', 'en-US': 'addwhitelist' })
    .setDescription('Ajouter à la liste blanche')
    .setDescriptionLocalizations({ fr: 'Ajouter à la liste blanche', 'en-US': 'Add to whitelist' })
    .addStringOption(option =>
      option.setName('type')
        .setNameLocalizations({ fr: 'type', 'en-US': 'type' })
        .setDescription('Type d\'élément')
        .setDescriptionLocalizations({ fr: 'Type d\'élément', 'en-US': 'Item type' })
        .setRequired(true)
        .addChoices(
          { name: 'Utilisateur', value: 'user' },
          { name: 'Rôle', value: 'role' },
          { name: 'Salon', value: 'channel' }
        ))
    .addStringOption(option =>
      option.setName('id')
        .setNameLocalizations({ fr: 'id', 'en-US': 'id' })
        .setDescription('L\'ID de l\'élément')
        .setDescriptionLocalizations({ fr: 'L\'ID de l\'élément', 'en-US': 'The item ID' })
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  name: 'addwhitelist',
  permissions: { user: [PermissionFlagsBits.Administrator], bot: [] },
  async execute(interaction, client) {
    try {
      const type = interaction.options.getString('type');
      const id = interaction.options.getString('id');
      const guildId = interaction.guild.id;

      let targetName = id;
      if (type === 'user') {
        const user = await client.users.fetch(id).catch(() => null);
        targetName = user ? user.tag : id;
      } else if (type === 'role') {
        const role = interaction.guild.roles.cache.get(id);
        targetName = role ? role.name : id;
      } else if (type === 'channel') {
        const channel = interaction.guild.channels.cache.get(id);
        targetName = channel ? channel.name : id;
      }

      await addToWhitelist(guildId, type, id);

      const typeLabel = type === 'user' ? 'utilisateur' : type === 'role' ? 'rôle' : 'salon';

      const embed = new EmbedBuilder()
        .setTitle('✓ Ajouté à la liste blanche')
        .setDescription(`${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} \`${targetName}\` a été ajouté à la liste blanche.`)
        .setColor(0x00ff00)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Erreur lors de l\'ajout à la liste blanche:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de l\'ajout à la liste blanche.', ephemeral: true });
    }
  },
};
