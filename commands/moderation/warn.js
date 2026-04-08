const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'warn',
  description: '⚠️ Avertir un membre',
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Donner un avertissement à un membre')
    .addUserOption(opt => opt.setName('user').setDescription('Membre à avertir').setRequired(true)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has('ModerateMembers')) {
      return interaction.reply({ content: '❌ Vous n\'avez pas la permission d\'avertir.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: '❌ Membre non trouvé sur ce serveur.', ephemeral: true });
    }

    if (!client.warnings) client.warnings = new Map();
    const warns = client.warnings.get(user.id) || [];

    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Avertissement - ${user.tag}`)
      .setColor(16776960)
      .setDescription(`Warn de **${user.tag}**`)
      .addFields(
        { name: 'Avertissements actuels', value: `${warns.length}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic - AntiRaid Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId(`warn_add_${user.id}`).setLabel('⚠️ Donner warn').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`warn_list_${user.id}`).setLabel('📋 Voir warns').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`warn_cancel_${user.id}`).setLabel('❌ Annuler').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
