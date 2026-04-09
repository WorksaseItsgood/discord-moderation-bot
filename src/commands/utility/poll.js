import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setNameLocalizations({ fr: 'poll', 'en-US': 'poll' })
    .setDescription('Créer un sondage')
    .setDescriptionLocalizations({ fr: 'Créer un sondage', 'en-US': 'Create a poll' })
    .addStringOption(option =>
      option.setName('question')
        .setNameLocalizations({ fr: 'question', 'en-US': 'question' })
        .setDescription('La question du sondage')
        .setDescriptionLocalizations({ fr: 'La question du sondage', 'en-US': 'The poll question' })
        .setRequired(true))
    .addStringOption(option =>
      option.setName('option1')
        .setNameLocalizations({ fr: 'option1', 'en-US': 'option1' })
        .setDescription('Option 1')
        .setDescriptionLocalizations({ fr: 'Option 1', 'en-US': 'Option 1' })
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option2')
        .setNameLocalizations({ fr: 'option2', 'en-US': 'option2' })
        .setDescription('Option 2')
        .setDescriptionLocalizations({ fr: 'Option 2', 'en-US': 'Option 2' })
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option3')
        .setNameLocalizations({ fr: 'option3', 'en-US': 'option3' })
        .setDescription('Option 3')
        .setDescriptionLocalizations({ fr: 'Option 3', 'en-US': 'Option 3' })
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option4')
        .setNameLocalizations({ fr: 'option4', 'en-US': 'option4' })
        .setDescription('Option 4')
        .setDescriptionLocalizations({ fr: 'Option 4', 'en-US': 'Option 4' })
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option5')
        .setNameLocalizations({ fr: 'option5', 'en-US': 'option5' })
        .setDescription('Option 5')
        .setDescriptionLocalizations({ fr: 'Option 5', 'en-US': 'Option 5' })
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option6')
        .setNameLocalizations({ fr: 'option6', 'en-US': 'option6' })
        .setDescription('Option 6')
        .setDescriptionLocalizations({ fr: 'Option 6', 'en-US': 'Option 6' })
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option7')
        .setNameLocalizations({ fr: 'option7', 'en-US': 'option7' })
        .setDescription('Option 7')
        .setDescriptionLocalizations({ fr: 'Option 7', 'en-US': 'Option 7' })
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option8')
        .setNameLocalizations({ fr: 'option8', 'en-US': 'option8' })
        .setDescription('Option 8')
        .setDescriptionLocalizations({ fr: 'Option 8', 'en-US': 'Option 8' })
        .setRequired(false))
    .addStringOption(option =>
      option.setName('option9')
        .setNameLocalizations({ fr: 'option9', 'en-US': 'option9' })
        .setDescription('Option 9')
        .setDescriptionLocalizations({ fr: 'Option 9', 'en-US': 'Option 9' })
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false),
  name: 'poll',
  permissions: { user: [PermissionFlagsBits.ManageMessages], bot: [] },
  async execute(interaction, client) {
    try {
      const question = interaction.options.getString('question');
      const options = [];

      for (let i = 1; i <= 9; i++) {
        const opt = interaction.options.getString(`option${i}`);
        if (opt) options.push(opt);
      }

      if (options.length < 2) {
        return await interaction.reply({ content: 'Veuillez fournir au moins 2 options pour le sondage.', ephemeral: true });
      }

      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

      const description = options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n');

      const embed = new EmbedBuilder()
        .setTitle(`📊 ${question}`)
        .setDescription(description)
        .setColor(0x3498db)
        .setFooter({ text: `Sondage créé par ${interaction.user.username}` })
        .setTimestamp();

      const message = await interaction.reply({ embeds: [embed], fetchReply: true });

      for (let i = 0; i < options.length; i++) {
        await message.react(emojis[i]);
      }

      const collector = message.createMessageComponentCollector({
        filter: (i) => true,
        time: 86400000
      });

      collector.on('collect', async () => {});

      collector.on('end', async () => {});

    } catch (error) {
      console.error('Erreur lors de la création du sondage:', error);
      await interaction.reply({ content: 'Une erreur est survenue lors de la création du sondage.', ephemeral: true });
    }
  },
};
