require('dotenv').config();
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  // Poprzednie komendy
  new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Pokazuje info o użytkowniku')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Użytkownik do sprawdzenia')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Pokazuje info o serwerze'),

  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Bot powtarza podany tekst')
    .addStringOption(option =>
      option.setName('tekst')
        .setDescription('Tekst do powtórzenia')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Pokaż avatar użytkownika')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Użytkownik do pokazania avatara')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Pokazuje listę dostępnych komend'),

  // Nowe komendy:
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Banuje użytkownika')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Użytkownik do zbanowania')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Powód bana')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Wyrzuca użytkownika z serwera')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Użytkownik do wyrzucenia')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Powód wyrzucenia')
        .setRequired(false)),

  new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Wycisza użytkownika na określony czas')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Użytkownik do wyciszenia')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Czas mute, np. 10m, 1h')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Cofa wyciszenie użytkownika')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Użytkownik do odciszenia')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Tworzy ankietę')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('Pytanie ankiety')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('options')
        .setDescription('Opcje, oddzielone przecinkiem')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('serverstats')
    .setDescription('Pokazuje rozbudowane statystyki serwera'),

  new SlashCommandBuilder()
    .setName('remindme')
    .setDescription('Przypomina o czymś po określonym czasie')
    .addStringOption(option =>
      option.setName('time')
        .setDescription('Czas, np. 10m, 1h')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Wiadomość do przypomnienia')
        .setRequired(true)),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Rejestracja komend...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands }
    );
    console.log('Komendy zarejestrowane!');
  } catch (error) {
    console.error(error);
  }
})();
