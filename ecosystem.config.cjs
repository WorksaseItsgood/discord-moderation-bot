module.exports = {
  apps: [{
    name: 'discord-bot',
    script: 'src/bot.js',
    cwd: '/root/discord-moderation-bot',
    env_production: {
      NODE_ENV: 'production'
    },
    inlineScripts: {
      before_start: `while IFS= read -r line; do export "$line"; done < /root/discord-moderation-bot/.env`
    }
  }]
};
