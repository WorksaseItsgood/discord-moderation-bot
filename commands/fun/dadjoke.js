const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Dadjoke command - Dad joke generator
module.exports = {
  data: new SlashCommandBuilder()
    .setName('dadjoke')
    .setDescription('Get a random dad joke'),
  async execute(interaction, client) {
    const dadJokes = [
      "I'm afraid for the calendar. Its days are numbered.",
      "Singing in the shower is fun until you get soap in your mouth. Then it's a soap opera.",
      "What do you call a fake noodle? An impasta!",
      "Why did the scarecrow win an award? Because he was outstanding in his field!",
      "I'm reading a book about anti-gravity. It's impossible to put down!",
      "Did you hear about the mathematician who feared negative numbers? He'll stop at nothing to avoid them!",
      "Why don't eggs tell jokes? They'd crack each other up!",
      "I used to hate facial hair, but then it grew on me.",
      "What do you call a bear with no teeth? A gummy bear!",
      "Why did the bicycle fall over? Because it was two tired!",
      "How does a penguin build his house? Igloos it together!",
      "What do you call a dog that does magic? A Labracadabrador!",
      "Why did the coffee call the police? Because it got mugged!",
      "I'm on a seafood diet. I see food and I eat it!",
      "What do you call a lazy kangaroo? A pouch potato!",
      "Why did the teddy bear say no to dessert? Because she was already stuffed!",
      "What do you call a sleeping dinosaur? A dino-snore!",
      "I used to be a banker, but I lost interest.",
      "Why don't skeletons fight each other? They don't have the guts!",
      "What do you call a fish without eyes? A fsh!"
    ];
    
    const joke = dadJokes[Math.floor(Math.random() * dadJokes.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('👨 Dad Joke')
      .setColor(0xffd700)
      .setDescription(joke);
    
    await interaction.reply({ embeds: [embed] });
  }
};