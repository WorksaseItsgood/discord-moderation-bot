export default {
  name: 'messageCreate',
  once: false,

  async execute(message, client) {
    if (message.author.bot) return;
    if (!message.guild) return;

    // Anti-spam check
    if (client.antiSpam?.has(message.guild.id)) {
      const { checkSpam } = await import('../handlers/antiSpamHandler.js').catch(() => ({ checkSpam: null }));
      if (checkSpam) {
        try { await checkSpam(message, client); } catch {}
      }
    }
  },
};
