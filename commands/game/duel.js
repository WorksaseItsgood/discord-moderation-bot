const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Duel command - Challenge user to duel
module.exports = {
  data: new SlashCommandBuilder()
    .setName('duel')
    .setDescription('Challenge a user to a duel')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to challenge')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Bet amount (optional)')
        .setRequired(false)
        .setMinValue(10)),
  async execute(interaction, client) {
    const target = interaction.options.getUser('user');
    const bet = interaction.options.getInteger('bet') || 0;
    
    if (target.id === interaction.user.id) {
      return interaction.reply({ content: "You can't duel yourself!", ephemeral: true });
    }
    
    if (!client.economy) client.economy = new Map();
    
    if (bet > 0) {
      const balance = client.economy.get(interaction.user.id) || 0;
      if (balance < bet) {
        return interaction.reply({ content: "You don't have enough coins!", ephemeral: true });
      }
      client.economy.set(interaction.user.id, balance - bet);
    }
    
    const embed = new EmbedBuilder()
      .setTitle('Duel Challenge')
      .setColor(0xff0000)
      .setDescription(interaction.user.toString() + ' challenges ' + target.toString() + ' to a duel!')
      .addFields([
        { name: 'Bet', value: bet > 0 ? bet + ' coins' : 'No bet', inline: true }
      ]);
    
    if (bet > 0) {
      embed.setDescription(interaction.user.toString() + ' challenges ' + target.toString() + ' to a duel for ' + bet + ' coins!');
    }
    
    const message = await interaction.reply({ embeds: [embed], fetchReply: true });
    await message.react('⚔️');
    
    const filter = (reaction, user) => reaction.emoji.name === '⚔️' && user.id === target.id;
    const collector = message.createReactionCollector({ filter, time: 30000 });
    
    collector.on('collect', async () => {
      // Both roll dice
      const p1Roll = Math.floor(Math.random() * 100) + 1;
      const p2Roll = Math.floor(Math.random() * 100) + 1;
      
      let result;
      let winner = interaction.user.id;
      if (p1Roll > p2Roll) {
        result = interaction.user.username + ' wins ' + p1Roll + '-' + p2Roll + '!';
        if (bet > 0) {
          const winnerBal = (client.economy.get(interaction.user.id) || 0) + bet * 2;
          client.economy.set(interaction.user.id, winnerBal);
        }
      } else if (p2Roll > p1Roll) {
        result = target.username + ' wins ' + p2Roll + '-' + p1Roll + '!';
        winner = target.id;
        if (bet > 0) {
          const targetBal = (client.economy.get(target.id) || 0) + bet * 2;
          client.economy.set(target.id, targetBal);
        }
      } else {
        result = "It's a tie! " + p1Roll + '-' + p2Roll;
      }
      
      const resultEmbed = new EmbedBuilder()
        .setTitle('Duel Result')
        .setColor(0xff0000)
        .setDescription(result)
        .addFields([
          { name: interaction.user.username, value: String(p1Roll), inline: true },
          { name: target.username, value: String(p2Roll), inline: true }
        ]);
      
      await message.edit({ embeds: [resultEmbed] });
      collector.stop();
    });
  }
};