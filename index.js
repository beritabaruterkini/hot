// Import library Discord.js
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField, Events, SlashCommandBuilder, REST, Routes } = require('discord.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Token dan Client ID dari aplikasi bot
const { BOT_TOKEN, CLIENT_ID, GUILD_ID, BUYER_ROLE_ID, SELLER_ROLE_ID, CATEGORY_ID } = process.env;

// Inisialisasi bot
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('ready', () => {
  console.log(`Bot berhasil login sebagai ${client.user.tag}`);
});

// Daftar slash command
const commands = [
  new SlashCommandBuilder()
    .setName('setup-ticket-panel')
    .setDescription('Buat panel tiket untuk pengguna.'),

  new SlashCommandBuilder()
    .setName('rating')
    .setDescription('Berikan rating dan feedback untuk penjual.')
    .addStringOption(option =>
      option.setName('penjual')
        .setDescription('Nama atau tag penjual')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('pembeli')
        .setDescription('Nama atau tag pembeli')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('produk')
        .setDescription('Nama produk yang dibeli')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('harga')
        .setDescription('Harga produk')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('rating')
        .setDescription('Berikan rating dari 1 hingga 5')
        .setRequired(true)
        .addChoices(
          { name: '⭐', value: 1 },
          { name: '⭐⭐', value: 2 },
          { name: '⭐⭐⭐', value: 3 },
          { name: '⭐⭐⭐⭐', value: 4 },
          { name: '⭐⭐⭐⭐⭐', value: 5 }
        ))
    .addStringOption(option =>
      option.setName('komentar')
        .setDescription('Masukkan komentar atau feedback')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('testimoni')
    .setDescription('Buat testimoni dengan lampiran gambar.')
    .addStringOption(option =>
      option.setName('penjual')
        .setDescription('Nama atau tag penjual')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('pembeli')
        .setDescription('Nama atau tag pembeli')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('produk')
        .setDescription('Nama produk yang dibeli')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('harga')
        .setDescription('Harga produk')
        .setRequired(true))
    .addAttachmentOption(option =>
      option.setName('gambar')
        .setDescription('Lampirkan gambar bukti transaksi')
        .setRequired(true)),

  new SlashCommandBuilder()
    .setName('addbuyer')
    .setDescription('Menambahkan role "Buyer" kepada pengguna')
    .addUserOption(option =>
      option.setName('pengguna')
        .setDescription('Pengguna yang ingin ditambahkan role Buyer')
        .setRequired(true))
];

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);
(async () => {
  try {
    console.log('Memulai registrasi slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('Slash commands berhasil terdaftar.');
  } catch (error) {
    console.error('Gagal mendaftarkan slash commands:', error);
  }
})();

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const { commandName, options, member } = interaction;

    if (commandName === 'setup-ticket-panel') {
      const embed = new EmbedBuilder()
        .setTitle('Panel Tiket')
        .setDescription('Klik tombol di bawah untuk membuka tiket. Kami akan membantu Anda sesegera mungkin.')
        .setColor('Blue');

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('open-ticket')
          .setLabel('Buka Tiket')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ content: 'Panel tiket telah dibuat.', ephemeral: true });
      await interaction.channel.send({ embeds: [embed], components: [row] });
    } else if (commandName === 'rating') {
      if (!member.roles.cache.has(BUYER_ROLE_ID)) {
        return interaction.reply({ content: 'Anda harus memiliki role "Buyer" untuk menggunakan perintah ini.', ephemeral: true });
      }

      const penjual = options.getString('penjual');
      const pembeli = options.getString('pembeli');
      const produk = options.getString('produk');
      const harga = options.getInteger('harga');
      const rating = options.getInteger('rating');
      const komentar = options.getString('komentar');

      const embed = new EmbedBuilder()
        .setTitle('Rating Seller Fazmuir Store | Community')
        .setColor('Green')
        .addFields(
          { name: 'Penjual', value: penjual, inline: true },
          { name: 'Pembeli', value: pembeli, inline: true },
          { name: 'Produk', value: produk, inline: true },
          { name: 'Harga', value: `${harga} IDR`, inline: true },
          { name: 'Rating', value: '⭐'.repeat(rating), inline: true },
          { name: 'Komentar', value: komentar, inline: false }
        )
        .setFooter({ text: 'Fazmuir Store' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'testimoni') {
      if (!member.roles.cache.has(SELLER_ROLE_ID)) {
        return interaction.reply({ content: 'Anda harus memiliki role "Seller" untuk menggunakan perintah ini.', ephemeral: true });
      }

      const penjual = options.getString('penjual');
      const pembeli = options.getString('pembeli');
      const produk = options.getString('produk');
      const harga = options.getInteger('harga');
      const gambar = options.getAttachment('gambar');

      const embed = new EmbedBuilder()
        .setTitle('Testimoni Fazmuir Store | Community')
        .setColor('Blue')
        .addFields(
          { name: 'Penjual', value: penjual, inline: true },
          { name: 'Pembeli', value: pembeli, inline: true },
          { name: 'Produk', value: produk, inline: true },
          { name: 'Harga', value: `${harga} IDR`, inline: true }
        )
        .setImage(gambar.url)
        .setFooter({ text: 'Fazmuir Store' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } else if (commandName === 'addbuyer') {
      if (!member.roles.cache.has(SELLER_ROLE_ID)) {
        return interaction.reply({ content: 'Anda harus memiliki role "Seller" untuk menggunakan perintah ini.', ephemeral: true });
      }

      const pengguna = options.getUser('pengguna');

      if (!pengguna) {
        return interaction.reply({ content: 'Pengguna tidak ditemukan.', ephemeral: true });
      }

      const memberTarget = await interaction.guild.members.fetch(pengguna.id);

      if (memberTarget.roles.cache.has(BUYER_ROLE_ID)) {
        return interaction.reply({ content: `${pengguna.tag} sudah memiliki role Buyer.`, ephemeral: true });
      }

      try {
        await memberTarget.roles.add(BUYER_ROLE_ID);

        const embed = new EmbedBuilder()
          .setTitle('Add Buyer')
          .setColor('Blue')
          .setDescription(`Role **Buyer** berhasil ditambahkan kepada **${pengguna.tag}**.`)
          .setFooter({ text: 'Fazmuir Store' })
          .setTimestamp();

        interaction.reply({ embeds: [embed] });
      } catch (error) {
        console.error(error);
        interaction.reply({ content: 'Gagal menambahkan role Buyer.', ephemeral: true });
      }
    }
  } else if (interaction.isButton()) {
    if (interaction.customId === 'open-ticket') {
      const guild = interaction.guild;
      const user = interaction.user;

      const existingChannel = guild.channels.cache.find(
        (channel) => channel.name === `ticket-${user.username}`
      );

      if (existingChannel) {
        await interaction.reply({ content: 'Anda sudah memiliki tiket yang terbuka!', ephemeral: true });
        return;
      }

      // Menentukan kategori tempat tiket dibuat
      const category = guild.channels.cache.get(CATEGORY_ID);
      if (!category) {
        await interaction.reply({ content: 'Kategori tiket tidak ditemukan!', ephemeral: true });
        return;
      }

      const ticketChannel = await guild.channels.create({
        name: `ticket-${user.username}`,
        type: ChannelType.GuildText,
        parent: category.id,  // Menetapkan kategori
        permissionOverwrites: [
          {
            id: guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: SELLER_ROLE_ID,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
          {
            id: client.user.id,
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
          },
        ],
      });

      const embed = new EmbedBuilder()
        .setTitle('Tiket Dukungan')
        .setDescription('Tim dukungan kami akan segera membantu Anda. Klik tombol di bawah untuk menutup tiket.')
        .setColor('Green');

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close-ticket')
          .setLabel('Tutup Tiket')
          .setStyle(ButtonStyle.Danger)
      );

      await ticketChannel.send({ content: `<@${user.id}>`, embeds: [embed], components: [row] });
      await interaction.reply({ content: `Tiket Anda telah dibuka: <#${ticketChannel.id}>`, ephemeral: true });
    } else if (interaction.customId === 'close-ticket') {
      const channel = interaction.channel;

      if (channel.name.startsWith('ticket-')) {
        await interaction.reply('Channel ini akan dihapus dalam 5 detik.');
        setTimeout(() => channel.delete(), 5000);
      } else {
        await interaction.reply({ content: 'Perintah ini hanya dapat digunakan di channel tiket.', ephemeral: true });
      }
    }
  }
});

client.login(BOT_TOKEN);
