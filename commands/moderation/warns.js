const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database');

module.exports = {
  name: 'warns',
  description: '📋 Voir les avertissements d\'un membre',
  data: new SlashCommandBuilder()
    .setName('warns')
    .setDescription('Voir les avertissements d\'un membre')
    .addUserOption(opt => opt.setName('user').setDescription('Membre à vérifier').setRequired(false)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    if (!member && user.id !== interaction.user.id) {
      return interaction.reply({ content: '❌ Membre non trouvé.', ephemeral: true });
    }

    if (!interaction.member.permissions.has('ManageMessages') && user.id !== interaction.user.id) {
      return interaction.reply({ content: '❌ Vous n\'avez pas la permission de voir les avertissements des autres.', ephemeral: true });
    }

    const warnings = db.getWarnings(user.id, interaction.guild.id);

    const embed = new EmbedBuilder()
      .setTitle(`📋 Avertissements - ${user.tag}`)
      .setColor(16753920)
      .setTimestamp()
      .setFooter({ text: 'Niotic - AntiRaid Bot' });

    if (warnings.length === 0) {
      embed.setDescription('✅ Ce membre n\'a aucun avertissement.');
      return interaction.reply({ embeds: [embed] });
    }

    embed.setDescription(`**Total:** ${warnings.length} avertissement(s)`);

    const warningList = warnings.map((w, i) => {
      const date = new Date(w.created_at * 1000).toLocaleDateString('fr-FR');
      const moderator = client?.users?.cache?.get(w.moderator_id)?.tag || w.moderator_id;
      return `**#${i + 1}** - ${date}\n   Raison: ${w.reason}\n   Par: ${moderator}`;
    }).join('\n\n');

    embed.addFields({ name: 'Liste des avertissements', value: warningList.substring(0, 1024) });

    await interaction.reply({ embeds: [embed] });
  }
};
