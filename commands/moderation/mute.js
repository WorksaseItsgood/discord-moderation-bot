const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  name: 'mute',
  description: '🔇 Mute un membre',
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute un membre temporairement')
    .addUserOption(opt => opt.setName('user').setDescription('Membre à mute').setRequired(true)),

  async execute(interaction, client) {
    const user = interaction.options.getUser('user');

    if (!interaction.member.permissions.has('ModerateMembers')) {
      return interaction.reply({ content: '❌ Vous n\'avez pas la permission de mute.', ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: '❌ Membre non trouvé sur ce serveur.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🔇 Confirmation - Mute')
      .setColor(16753920)
      .setDescription(`Voulez-vous mute **${user.tag}** ?`)
      .addFields(
        { name: 'Utilisateur', value: `${user}`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Niotic - AntiRaid Bot' });

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder().setCustomId(`mute_confirm_${user.id}`).setLabel('🔇 Mute 24h').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId(`mute_1h_${user.id}`).setLabel('🔇 Mute 1h').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId(`mute_cancel_${user.id}`).setLabel('❌ Annuler').setStyle(ButtonStyle.Secondary)
      );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
