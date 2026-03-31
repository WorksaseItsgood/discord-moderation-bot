const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// BMI command - BMI calculator
module.exports = {
  data: new SlashCommandBuilder()
    .setName('bmi')
    .setDescription('Calculate your BMI')
    .addNumberOption(option =>
      option.setName('weight')
        .setDescription('Weight in kg')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('height')
        .setDescription('Height in cm')
        .setRequired(true)),
  async execute(interaction, client) {
    const weight = interaction.options.getNumber('weight');
    const height = interaction.options.getNumber('height');
    
    if (weight <= 0 || height <= 0) {
      return interaction.reply({ content: '❌ Invalid weight or height!', ephemeral: true });
    }
    
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    const bmiRounded = bmi.toFixed(1);
    
    let category, color;
    if (bmi < 18.5) {
      category = 'Underweight';
      color = 0x3498db;
    } else if (bmi < 25) {
      category = 'Normal weight';
      color = 0x2ecc71;
    } else if (bmi < 30) {
      category = 'Overweight';
      color = 0xf39c12;
    } else {
      category = 'Obese';
      color = 0xe74c3c;
    }
    
    const embed = new EmbedBuilder()
      .setTitle('⚖️ BMI Calculator')
      .setColor(color)
      .addFields(
        { name: 'Weight', value: `${weight} kg`, inline: true },
        { name: 'Height', value: `${height} cm`, inline: true },
        { name: 'Your BMI', value: bmiRounded, inline: true },
        { name: 'Category', value: category, inline: true }
      )
      .setFooter({ text: 'Note: BMI is not accurate for athletes or pregnant women.' });
    
    await interaction.reply({ embeds: [embed] });
  }
};