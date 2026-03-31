const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Puns command - Random pun
module.exports = {
  data: new SlashCommandBuilder()
    .setName('puns')
    .setDescription('Get a random pun'),
  async execute(interaction, client) {
    const puns = [
      "I used to be a banker, but I lost interest.",
      "I'm reading a book about anti-gravity. It's impossible to put down!",
      "Did you hear about the mathematician who feared negative numbers? He'll stop at nothing to avoid them!",
      "I used to hate facial hair, but then it grew on me.",
      "A sheep with no legs is a cloud.",
      "I used to be a tailor, but I wasn't suited for the job.",
      "The rotation of Earth really makes my day.",
      "When I went to the doctor, I said 'Doctor!' He said 'Don't be afraid, it's just a small incision.' I said 'Don't be ridiculous, I'm not cut out for this!'",
      "I'm afraid for the calendar. Its days are numbered.",
      "My wife told me to stop impersonating a flamingo. I had to put my foot down.",
      "I used to play piano by ear. Now I use my hands and fingers.",
      "What do you call a bear with no teeth? A gummy bear!",
      "Why don't scientists trust atoms? Because they make up everything!",
      "I used to be a baker, but I couldn't make enough dough.",
      "The scarecrow won an award. That's out standing!",
      "What do you call a pig that does karate? A pork chop!",
      "I'm on a seafood diet. I see food and I eat it!",
      "Why did the gymnasium close down? It just didn't work out!",
      "I'm reading a book about teleportation. It's bound to get me somewhere!",
      "Time flies like an arrow. Fruit flies like a banana!"
    ];
    
    const pun = puns[Math.floor(Math.random() * puns.length)];
    
    const embed = new EmbedBuilder()
      .setTitle('🎭 Random Pun')
      .setColor(0xffd700)
      .setDescription(pun);
    
    await interaction.reply({ embeds: [embed] });
  }
};