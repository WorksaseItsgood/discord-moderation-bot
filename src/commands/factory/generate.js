#!/usr/bin/env node
/**
 * Command Factory - Auto-generates commands from templates
 * Run: node generate.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_FILE = join(__dirname, 'templates.js');
const OUTPUT_BASE = join(__dirname, '..');

// Load templates
const templatesModule = await import(`./templates.js?update=${Date.now()}`);
const templates = templatesModule.templates;

const DURATION_MAP = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30m': 1800000, '30d': 2592000000 };
const SLOWMODE_MAP = { 'off': 0, '5s': 5, '10s': 10, '30s': 30, '1m': 60, '5m': 300, '15m': 900 };

function buildCommandCode(template) {
  const cat = template.category;
  const folder = cat === 'moderation' ? 'moderation' : cat === 'config' ? 'config' : cat === 'protection' ? 'protection' : cat === 'automation' ? 'automation' : cat === 'stats' ? 'stats' : 'utility';
  const dbPath = folder === 'moderation' ? '../../../database/db.js' : '../../database/db.js';
  const permImports = template.permissions.user.map(p => `PermissionFlagsBits.${p}`).join(', ');

  let optionsCode = '';
  let executeCode = '';

  for (const opt of template.options) {
    if (opt.type === 'User') {
      optionsCode += `.addUserOption(o => o.setName('${opt.name}').setDescription('${opt.description.en}').setRequired(${opt.required}))\n      `;
    } else if (opt.type === 'String') {
      let strOpt = `.addStringOption(o => o.setName('${opt.name}').setDescription('${opt.description.en}').setRequired(${opt.required}))`;
      if (opt.choices) {
        strOpt += `.addChoices(${opt.choices.map(c => ({ name: c, value: c })).map(c => `{ name: '${c.name}', value: '${c.value}' }`).join(', ')})`;
      }
      optionsCode += strOpt + '\n      ';
    } else if (opt.type === 'Integer') {
      optionsCode += `.addIntegerOption(o => o.setName('${opt.name}').setDescription('${opt.description.en}').setRequired(${opt.required}).setMinValue(${opt.min || 0}).setMaxValue(${opt.max || 100}))\n      `;
    } else if (opt.type === 'Role') {
      optionsCode += `.addRoleOption(o => o.setName('${opt.name}').setDescription('${opt.description.en}').setRequired(${opt.required}))\n      `;
    } else if (opt.type === 'Channel') {
      optionsCode += `.addChannelOption(o => o.setName('${opt.name}').setDescription('${opt.description.en}').setRequired(${opt.required}))\n      `;
    }
  }

  // Generate action-specific code
  switch (template.action) {
    case 'kick':
      executeCode = `
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason';
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Member not found.', ephemeral: true });
    await member.kick(\`\${reason} | By \${interaction.user.tag}\`);
    await interaction.reply({ content: '✅ User kicked.', ephemeral: true });
    const { addLog } = await import('${dbPath}');
    await addLog(interaction.guild.id, { action: 'kick', userId: target.id, moderatorId: interaction.user.id, reason, timestamp: Date.now() });`;
      break;
    case 'mute':
      executeCode = `
    const target = interaction.options.getUser('user');
    const duration = interaction.options.getString('duration') || '1h';
    const ms = DURATION_MAP[duration] || 3600000;
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Member not found.', ephemeral: true });
    await member.timeout(ms, \`Muted for \${duration}\`);
    await interaction.reply({ content: \`🔇 \${target.tag} muted for \${duration}.\`, ephemeral: true });
    const { addLog } = await import('${dbPath}');
    await addLog(interaction.guild.id, { action: 'mute', userId: target.id, moderatorId: interaction.user.id, reason: \`Duration: \${duration}\`, timestamp: Date.now() });`;
      break;
    case 'warn':
      executeCode = `
    const target = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason';
    const { addWarning } = await import('${dbPath}');
    await addWarning(interaction.guild.id, target.id, { reason, moderator: interaction.user.id, timestamp: Date.now() });
    await interaction.reply({ content: '⚠️ Warning added.', ephemeral: true });`;
      break;
    case 'tempban':
      executeCode = `
    const target = interaction.options.getUser('user');
    const duration = interaction.options.getString('duration') || '24h';
    const reason = interaction.options.getString('reason') || 'No reason';
    const ms = DURATION_MAP[duration] || 86400000;
    await interaction.guild.members.ban(target.id, { reason: \`\${reason} | Temp ban \${duration}\` });
    await interaction.reply({ content: \`⏱️ \${target.tag} banned for \${duration}.\`, ephemeral: true });
    setTimeout(async () => {
      try { await interaction.guild.members.unban(target.id); } catch {}
    }, ms);`;
      break;
    case 'clear':
      executeCode = `
    const amount = interaction.options.getInteger('amount') || 10;
    const filter = interaction.options.getUser('user');
    const fetched = await interaction.channel.messages.fetch({ limit: 100 });
    const toDelete = filter ? fetched.filter(m => m.author.id === filter.id) : fetched;
    await interaction.channel.bulkDelete(toDelete.first(amount)).catch(() => {});
    await interaction.reply({ content: \`🗑️ \${amount} messages deleted.\`, ephemeral: true });`;
      break;
    case 'lock':
      executeCode = `
    const channel = interaction.options.getChannel('channel') || interaction.channel;
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false }, 'Locked');
    await interaction.reply({ content: \`🔒 \${channel.name} locked.\`, ephemeral: true });`;
      break;
    case 'slowmode':
      executeCode = `
    const duration = interaction.options.getString('duration') || 'off';
    const seconds = SLOWMODE_MAP[duration] || 0;
    await interaction.channel.setRateLimitPerUser(seconds);
    await interaction.reply({ content: \`🐌 Slowmode: \${duration}.\`, ephemeral: true });`;
      break;
    case 'giverole':
      executeCode = `
    const target = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    if (!member) return interaction.reply({ content: '❌ Member not found.', ephemeral: true });
    await member.roles.add(role);
    await interaction.reply({ content: \`🎭 \${target.tag} got \${role.name}.\`, ephemeral: true });`;
      break;
    case 'poll':
      executeCode = `
    const question = interaction.options.getString('question');
    const opts = ['✅ Oui', '❌ Non'];
    for (let i = 1; i <= 9; i++) {
      const o = interaction.options.getString(\`option\${i}\`);
      if (o) opts.push(\`\${[\'1️⃣\',\'2️⃣\',\'3️⃣\',\'4️⃣\',\'5️⃣\',\'6️⃣\',\'7️⃣\',\'8️⃣\',\'9️⃣\'][i-1]}\`);
    }
    const pollMsg = await interaction.reply({ content: \`📊 **\${question}**\n\n\`\`\`\n\${opts.map((o, i) => \`  \${i + 1}. \${o}\`).join(\'\\n\')}\n\`\`\`\`, fetchReply: true });
    for (let i = 0; i < opts.length; i++) { await pollMsg.react([\'✅\',\'❌\',\'1️⃣\',\'2️⃣\',\'3️⃣\',\'4️⃣\',\'5️⃣\',\'6️⃣\',\'7️⃣\',\'8️⃣\',\'9️⃣\'][i]); }`;
      break;
    case 'embed':
      executeCode = `
    const title = interaction.options.getString('title');
    const desc = interaction.options.getString('description');
    const { EmbedBuilder } = await import('discord.js');
    const embed = new EmbedBuilder().setTitle(title).setDescription(desc).setColor(0x5865F2).setTimestamp();
    await interaction.reply({ embeds: [embed] });`;
      break;
    case 'userinfo':
      executeCode = `
    const user = interaction.options.getUser('user') || interaction.user;
    const mem = await interaction.guild.members.fetch(user.id).catch(() => null);
    const accAge = Math.floor((Date.now() - user.createdTimestamp) / 86400000);
    const joinAge = mem ? Math.floor((Date.now() - mem.joinedTimestamp) / 86400000) : 0;
    const { EmbedBuilder } = await import('discord.js');
    const e = new EmbedBuilder().setTitle(\`👤 \${user.tag}\`).setThumbnail(user.displayAvatarURL()).addFields(
      { name: 'Account Age', value: \`\${accAge} days\`, inline: true },
      { name: 'Server Join', value: mem ? \`\${joinAge} days ago\` : 'N/A', inline: true },
      { name: 'Roles', value: mem ? String(mem.roles.cache.size - 1) : '?', inline: true }
    );
    await interaction.reply({ embeds: [e], ephemeral: true });`;
      break;
    case 'serverinfo':
      executeCode = `
    const g = interaction.guild;
    const { EmbedBuilder } = await import('discord.js');
    const e = new EmbedBuilder().setTitle(\`🏠 \${g.name}\`).addFields(
      { name: 'Members', value: String(g.memberCount), inline: true },
      { name: 'Channels', value: String(g.channels.cache.size), inline: true },
      { name: 'Roles', value: String(g.roles.cache.size), inline: true },
      { name: 'Boost Level', value: String(g.premiumTier), inline: true }
    ).setThumbnail(g.iconURL());
    await interaction.reply({ embeds: [e], ephemeral: true });`;
      break;
    case 'avlookup':
      executeCode = `
    const user = interaction.options.getUser('user') || interaction.user;
    await interaction.reply({ content: \`🖼️ Avatar: \${user.displayAvatarURL({ size: 4096 })}\`, ephemeral: true });`;
      break;
    case 'ping':
      executeCode = `
    const ping = client.ws.ping;
    await interaction.reply({ content: \`🏓 Latency: \${ping}ms\`, ephemeral: true });`;
      break;
    case 'uptime':
      executeCode = `
    const uptime = process.uptime();
    const h = Math.floor(uptime / 3600), m = Math.floor((uptime % 3600) / 60), s = Math.floor(uptime % 60);
    await interaction.reply({ content: \`⏰ Uptime: \${h}h \${m}m \${s}s\`, ephemeral: true });`;
      break;
    default:
      executeCode = `\n    await interaction.reply({ content: '${template.emoji} Command executed.', ephemeral: true });`;
  }

  return `import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder${template.action === 'clear' || template.action === 'lock' ? ', ChannelpermissionsBits' : ''} } from 'discord.js';
${template.action === 'mute' || template.action === 'tempban' ? "const DURATION_MAP = { '1h': 3600000, '24h': 86400000, '7d': 604800000, '30m': 1800000, '30d': 2592000000 };" : ''}
${template.action === 'slowmode' ? "const SLOWMODE_MAP = { 'off': 0, '5s': 5, '10s': 10, '30s': 30, '1m': 60, '5m': 300, '15m': 900 };" : ''}

export default {
  data: new SlashCommandBuilder()
    .setName('${template.name}')
    .setDescription('${template.description.en}')
    ${optionsCode}
  name: '${template.name}',
  permissions: { user: [${permImports ? `PermissionFlagsBits.${template.permissions.user.join(', PermissionFlagsBits.')}` : ''}], bot: [${template.permissions.bot.map(p => `PermissionFlagsBits.${p}`).join(', ')}] },
  async execute(interaction, client) {
    try {
      ${executeCode}
    } catch (err) {
      await interaction.reply({ content: '❌ Error: ' + err.message, ephemeral: true });
    }
  },
};`;
}

async function generateCommands() {
  console.log('🏭 Generating commands from templates...');
  let generated = 0;

  for (const template of templates) {
    const folder = template.category === 'moderation' ? 'moderation' :
                   template.category === 'config' ? 'config' :
                   template.category === 'protection' ? 'protection' :
                   template.category === 'automation' ? 'automation' :
                   template.category === 'stats' ? 'stats' : 'utility';
    const outDir = join(OUTPUT_BASE, folder);
    mkdirSync(outDir, { recursive: true });

    const code = buildCommandCode(template);
    const outFile = join(outDir, `${template.name}.js`);

    // Only generate if doesn't exist
    try {
      require('fs').accessSync(outFile);
      console.log(`  ⏭️  ${template.name} already exists, skipping`);
    } catch {
      require('fs').writeFileSync(outFile, code);
      console.log(`  ✅ Generated: ${folder}/${template.name}.js`);
      generated++;
    }
  }

  console.log(`\n🎉 Generated ${generated} new commands!`);
  console.log('💡 To add more commands, edit src/commands/factory/templates.js');
}

generateCommands().catch(console.error);
