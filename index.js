require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

// Funkcja do parsowania czasu typu "10m", "1h", "30s"
function parseDuration(duration) {
  const regex = /^(\d+)(s|m|h|d)$/;
  const match = duration.toLowerCase().match(regex);
  if (!match) return null;
  const amount = parseInt(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's': return amount * 1000;
    case 'm': return amount * 60 * 1000;
    case 'h': return amount * 60 * 60 * 1000;
    case 'd': return amount * 24 * 60 * 60 * 1000;
    default: return null;
  }
}

client.once('ready', () => {
  console.log(`Zalogowano jako ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    await interaction.reply('Pong!');
  }
  else if (commandName === 'userinfo') {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const embed = new EmbedBuilder()
      .setTitle(`Informacje o użytkowniku: ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'ID', value: user.id, inline: true },
        { name: 'Nazwa', value: user.username, inline: true },
        { name: 'Dołączył', value: member ? member.joinedAt.toDateString() : 'Brak danych', inline: true },
        { name: 'Utworzone konto', value: user.createdAt.toDateString(), inline: true },
        { name: 'Status', value: member ? member.presence?.status || 'offline' : 'offline', inline: true },
        { name: 'Role', value: member ? member.roles.cache.map(r => r.name).join(', ') : 'Brak ról' }
      )
      .setColor('Blue');

    await interaction.reply({ embeds: [embed] });
  }
  else if (commandName === 'serverinfo') {
    const { guild } = interaction;
    const embed = new EmbedBuilder()
      .setTitle(`Informacje o serwerze: ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'ID', value: guild.id, inline: true },
        { name: 'Właściciel', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Liczba członków', value: guild.memberCount.toString(), inline: true },
        { name: 'Liczba kanałów', value: guild.channels.cache.size.toString(), inline: true },
        { name: 'Liczba ról', value: guild.roles.cache.size.toString(), inline: true },
        { name: 'Boost level', value: guild.premiumTier ? `Tier ${guild.premiumTier}` : 'Brak', inline: true },
        { name: 'Boosts', value: guild.premiumSubscriptionCount?.toString() || '0', inline: true },
      )
      .setColor('Green');

    await interaction.reply({ embeds: [embed] });
  }
  else if (commandName === 'say') {
    const text = interaction.options.getString('tekst');
    await interaction.reply(text);
  }
  else if (commandName === 'avatar') {
    const user = interaction.options.getUser('user') || interaction.user;
    await interaction.reply(user.displayAvatarURL({ dynamic: true, size: 512 }));
  }
  else if (commandName === 'help') {
    await interaction.reply(
      `Dostępne komendy:\n` +
      `/ping - odpowiada Pong!\n` +
      `/userinfo [user] - pokazuje info o użytkowniku\n` +
      `/serverinfo - pokazuje info o serwerze\n` +
      `/say [tekst] - bot powtarza tekst\n` +
      `/avatar [user] - pokazuje avatar użytkownika\n` +
      `/help - pokazuje tę wiadomość\n` +
      `/ban [user] [reason] - banuje użytkownika\n` +
      `/kick [user] [reason] - wyrzuca użytkownika\n` +
      `/mute [user] [czas] - wycisza użytkownika\n` +
      `/unmute [user] - cofa wyciszenie\n` +
      `/poll [question] [options] - tworzy ankietę\n` +
      `/serverstats - statystyki serwera\n` +
      `/remindme [time] [message] - przypomnienie\n`
    );
  }

  else if (commandName === 'ban') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: 'Nie masz uprawnień do bana!', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Brak powodu';
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) return interaction.reply({ content: 'Nie znaleziono użytkownika na serwerze.', ephemeral: true });

    try {
      await member.ban({ reason });
      await interaction.reply(`Użytkownik ${user.tag} został zbanowany. Powód: ${reason}`);
    } catch {
      await interaction.reply({ content: 'Nie udało się zbanować użytkownika.', ephemeral: true });
    }
  }
  else if (commandName === 'kick') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: 'Nie masz uprawnień do wyrzucania!', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Brak powodu';
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) return interaction.reply({ content: 'Nie znaleziono użytkownika na serwerze.', ephemeral: true });

    try {
      await member.kick(reason);
      await interaction.reply(`Użytkownik ${user.tag} został wyrzucony. Powód: ${reason}`);
    } catch {
      await interaction.reply({ content: 'Nie udało się wyrzucić użytkownika.', ephemeral: true });
    }
  }
  else if (commandName === 'mute') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: 'Nie masz uprawnień do wyciszania!', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const time = interaction.options.getString('time');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) return interaction.reply({ content: 'Nie znaleziono użytkownika na serwerze.', ephemeral: true });

    const durationMs = parseDuration(time);
    if (!durationMs) return interaction.reply({ content: 'Niepoprawny format czasu. Użyj np. 10m, 1h.', ephemeral: true });

    try {
      await member.timeout(durationMs, `Mute na ${time}`);
      await interaction.reply(`Użytkownik ${user.tag} został wyciszony na ${time}.`);
    } catch {
      await interaction.reply({ content: 'Nie udało się wyciszyć użytkownika.', ephemeral: true });
    }
  }
  else if (commandName === 'unmute') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: 'Nie masz uprawnień do cofania wyciszenia!', ephemeral: true });
    }

    const user = interaction.options.getUser('user');
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) return interaction.reply({ content: 'Nie znaleziono użytkownika na serwerze.', ephemeral: true });

    try {
      await member.timeout(null);
      await interaction.reply(`Wyciszenie użytkownika ${user.tag} zostało cofnięte.`);
    } catch {
      await interaction.reply({ content: 'Nie udało się cofnąć wyciszenia.', ephemeral: true });
    }
  }
  else if (commandName === 'poll') {
    const question = interaction.options.getString('question');
    const optionsRaw = interaction.options.getString('options');
    const options = optionsRaw.split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);

    if (options.length < 2 || options.length > 10) {
      return interaction.reply({ content: 'Musisz podać od 2 do 10 opcji.', ephemeral: true });
    }

    let pollText = `**${question}**\n\n`;
    const emojis = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'];
    options.forEach((opt, i) => {
      pollText += `${emojis[i]} ${opt}\n`;
    });

    const pollMessage = await interaction.reply({ content: pollText, fetchReply: true });

    for (let i = 0; i < options.length; i++) {
      await pollMessage.react(emojis[i]);
    }
  }
  else if (commandName === 'serverstats') {
    const guild = interaction.guild;

    const embed = new EmbedBuilder()
      .setTitle(`Statystyki serwera: ${guild.name}`)
      .setColor('Purple')
      .addFields(
        { name: 'Liczba członków', value: guild.memberCount.toString(), inline: true },
        { name: 'Liczba kanałów', value: guild.channels.cache.size.toString(), inline: true },
        { name: 'Liczba ról', value: guild.roles.cache.size.toString(), inline: true },
        { name: 'Boost level', value: guild.premiumTier ? `Tier ${guild.premiumTier}` : 'Brak', inline: true },
        { name: 'Boosts', value: guild.premiumSubscriptionCount?.toString() || '0', inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  }
  else if (commandName === 'remindme') {
    const time = interaction.options.getString('time');
    const message = interaction.options.getString('message');

    const durationMs = parseDuration(time);
    if (!durationMs) return interaction.reply({ content: 'Niepoprawny format czasu. Użyj np. 10m, 1h.', ephemeral: true });

    await interaction.reply(`Przypomnienie ustawione na ${time}.`);

    setTimeout(() => {
      interaction.user.send(`⏰ Przypomnienie: ${message}`).catch(() => {
        // Nie da się wysłać DM
      });
    }, durationMs);
  }
});

client.login(process.env.DISCORD_TOKEN);
