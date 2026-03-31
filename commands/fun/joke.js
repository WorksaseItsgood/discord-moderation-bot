/**
 * Joke Command - Random joke
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const jokes = [
  { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything." },
  { setup: "Why did the scarecrow win an award?", punchline: "Because he was outstanding in his field!" },
  { setup: "What do you call a fake noodle?", punchline: "An impasta!" },
  { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!" },
  { setup: "What did the ocean say to the beach?", punchline: "Nothing, it just waved." },
  { setup: "Why did the math book look so sad?", punchline: "Because it had too many problems." },
  { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!" },
  { setup: "Why did the bicycle fall over?", punchline: "Because it was two-tired!" },
  { setup: "What's the best thing about Switzerland?", punchline: "I don't know, but the flag is a big plus!" },
  { setup: "Why don't skeletons fight each other?", punchline: "They don't have the guts!" },
  { setup: "What do you call a dog that does magic?", punchline: "A Labracadabrador!" },
  { setup: "Why did the coffee file a complaint?", punchline: "It was getting mugged every day." },
  { setup: "What do you call a sleeping dinosaur?", punchline: "A dino-snore!" },
  { setup: "Why did the gym ban the jump rope?", punchline: "It was too hard to resist." },
  { setup: "What's a skeleton's least favorite body part?", punchline: "The rib-cage!" },
  { setup: "Why did the cookie go to the doctor?", punchline: "It was feeling crummy." },
  { setup: "What do you call a lazy kangaroo?", punchline: "A pouch potato!" },
  { setup: "Why don't we ever tell secrets on a farm?", punchline: "Because the potatoes have ears and the cornucks!" },
  { setup: "What do you call an unpredictable calendar?", punchline: "A running dog calendar!" },
  { setup: "Why did the music teacher need a ladder?", punchline: "To reach the high notes!" }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke'),
  
  async execute(interaction, client) {
    const joke = jokes[Math.floor(Math.random() * jokes.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('😂 Joke Time!')
      .addFields(
        { name: 'Setup', value: joke.setup },
        { name: 'Punchline', value: joke.punchline }
      )
      .setColor(0xffff00);
    
    await interaction.reply({ embeds: [embed] });
  }
};