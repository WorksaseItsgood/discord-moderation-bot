const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Chucknorris command - Chuck Norris fact
module.exports = {
  data: new SlashCommandBuilder()
    .setName('chucknorris')
    .setDescription('Get a random Chuck Norris fact')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to make a Chuck Norris joke about')
        .setRequired(false)),
  async execute(interaction, client) {
    const user = interaction.options.getUser('user');
    const facts = [
      "Chuck Norris doesn't use toilet paper. He uses sandpaper. Don't worry, he's not that rough.",
      "Chuck Norris once kicked a horse so hard it became a unicorn and flew away.",
      "There is no theory of evolution, just a list of creatures Chuck Norris allows to live.",
      "Chuck Norris can divide by zero.",
      "When Chuck Norris enters a room, he doesn't turn the lights on. He turns the lights off.",
      "Chuck Norris's tears cure cancer. Too bad he's never cried.",
      "Chuck Norris can hear sign language.",
      "The only thing that can stop Chuck Norris is a speeding bullet... if it can catch up.",
      "Chuck Norris doesn't flush the toilet. He scares the poop out of it.",
      "Chuck Norris once played hide and seek. He's still hiding.",
      "Chuck Norris can sneeze with his eyes open.",
      "Chuck Norris doesn't charge \$500 an hour. He charges \$500 a second.",
      "Chuck Norris counted to infinity. Twice.",
      "Chuck Norris did not survive. The other person did not survive either.",
      "When Chuck Norris looks in a mirror, the reflection looks back and apologizes.",
      "Chuck Norris knows the last digit of pi.",
      "Chuck Norris can make a slinky go down stairs.",
      "Chuck Norris never retreats. He takes the stairs.",
      "Chuck Norris plays Pokemon Go to catch 'em all... literally.",
      "Chuck Norris can set fire to water. No, really."
    ];
    
    const fact = facts[Math.floor(Math.random() * facts.length)];
    
    if (user) {
      const embed = new EmbedBuilder()
        .setTitle('🥋 Chuck Norris')
        .setColor(0xff0000)
        .setDescription(`${user}, ${fact.toLowerCase()}`);
      
      await interaction.reply({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('🥋 Chuck Norris Fact')
        .setColor(0xff0000)
        .setDescription(fact);
      
      await interaction.reply({ embeds: [embed] });
    }
  }
};