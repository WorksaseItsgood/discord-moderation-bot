const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('language')
    .setDescription('Change the bot language / Changez la langue du bot')
    .addStringOption(option =>
      option.setName('lang')
        .setDescription('Select a language / Sélectionnez une langue')
        .setRequired(true)
        .addChoices(
          { name: '🇬🇧 English', value: 'en' },
          { name: '🇫🇷 Français', value: 'fr' },
          { name: '🇪🇸 Español', value: 'es' },
          { name: '🇩🇪 Deutsch', value: 'de' },
          { name: '🇮🇹 Italiano', value: 'it' },
          { name: '🇵🇹 Português', value: 'pt' }
        )),
  async execute(interaction) {
    const lang = interaction.options.getString('lang');
    
    // Save language preference
    if (!client.languageConfig) client.languageConfig = new Map();
    client.languageConfig.set(interaction.guild.id, lang);
    
    const langNames = {
      'en': 'English',
      'fr': 'Français',
      'es': 'Español',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português'
    };
    
    const embed = new EmbedBuilder()
      .setColor(0x2F3136)
      .setTitle('✅ Language Updated!')
      .setDescription(`Language set to **${langNames[lang]}**`)
      .setFooter({ text: 'Niotic Moderation • Language' })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};
