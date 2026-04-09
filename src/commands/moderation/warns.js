/**
 * /warns - Liste les avertissements d'un utilisateur
 */

import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('warns')
    .setNameLocalizations({ fr: 'warns', 'en-US': 'warns' })
    .setDescription('Liste les avertissements d\'un utilisateur')
    .setDescriptionLocalizations({ fr: 'Liste les avertissements d\'un utilisateur', 'en-US': 'List warnings for a user' })
    .addUserOption(option =>
      option.setName('user')
        .setNameLocalizations({ fr: 'utilisateur', 'en-US': 'user' })
        .setDescription('L\'utilisateur dont vous voulez voir les avertissements')
        .setDescriptionLocalizations({ fr: 'L\'utilisateur dont vous voulez voir les avertissements', 'en-US': 'The user whose warnings you want to see' })
        .setRequired(false)),
  name: 'warns',
  permissions: { user: [PermissionFlagsBits.ManageMessages], bot: [PermissionFlagsBits.ManageMessages] },

  async execute(interaction, client) {
    const target = interaction.options.getUser('user') || interaction.user;

    try {
      const { getWarnings } = await import('../../../database/db.js');
      const warnings = await getWarnings(interaction.guild.id, target.id);

      if (!warnings || warnings.length === 0) {
        return interaction.reply({
          embeds: [new EmbedBuilder()
            .setColor(0x00cc00)
            .setTitle('📋 Aucun avertissement')
            .setDescription(`${target.tag} n'a aucun avertissement.`)
            .setTimestamp()],
          ephemeral: true,
        });
      }

      const warnList = warnings.map((w, i) => {
        const date = new Date(w.timestamp).toLocaleString('fr-FR');
        return `**${i + 1}.** ${w.reason}\n   Par: ${w.moderatorTag || 'Inconnu'} | Date: ${date}`;
      }).join('\n\n');

      const embed = new EmbedBuilder()
        .setColor(0xffaa00)
        .setTitle(`⚠️ Avertissements de ${target.tag}`)
        .setDescription(`**Total: ${warnings.length} avertissement(s)**\n\n${warnList}`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (err) {
      await interaction.reply({
        embeds: [new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('❌ Erreur')
          .setDescription(`Impossible de récupérer les avertissements: ${err.message}`)
          .setTimestamp()],
        ephemeral: true,
      });
    }
  },
};
