const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// 📊 DATA (FIXED + NO DUPLICATE)
const executors = {
  // FULL SUPPORT
  "volt": { status: "🟢 FULL SUPPORT", stability: "100%" },
  "arceus X": { status: "🟢 FULL SUPPORT", stability: "100%" },
  "delta": { status: "🟢 FULL SUPPORT", stability: "96%" },
  "potassium": { status: "🟢 FULL SUPPORT", stability: "93%" },
  "cosmic": { status: "🟢 FULL SUPPORT", stability: "95%" },
  "synapse z": { status: "🟢 FULL SUPPORT", stability: "99%" },

  // LIMITED
  "wave": { status: "🟡 LIMITED", stability: "75%" },
  "isaeva": { status: "🟡 LIMITED", stability: "70%" },
  "velocity": { status: "🟡 LIMITED", stability: "72%" },
  "codex": { status: "🟡 LIMITED", stability: "68%" },

  // NOT RECOMMENDED
  "xeno": { status: "🔴 NOT RECOMMENDED", stability: "40%" },
  "solara": { status: "🔴 NOT RECOMMENDED", stability: "35%" },
  "seliware": { status: "🔴 NOT RECOMMENDED", stability: "30%" },

  // UNKNOWN
  "sirhurt": { status: "⚪ UNKNOWN", stability: "??" },
  "bunni.fun": { status: "⚪ UNKNOWN", stability: "??" },
  "volcano": { status: "⚪ UNKNOWN", stability: "??" },
  "vega x": { status: "⚪ UNKNOWN", stability: "??" }
};

// 🧠 FUZZY SEARCH (CLEAN VERSION)
function findClosestExecutor(input) {
  input = input.toLowerCase();

  let bestMatch = null;
  let bestScore = 0;

  for (const name in executors) {
    let score = 0;

    for (let char of input) {
      if (name.includes(char)) score++;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = name;
    }
  }

  return bestScore > 2 ? bestMatch : null;
}

// ✅ READY
client.once('ready', () => {
  console.log(`✅ Online: ${client.user.tag}`);
});

// 🎮 INTERACTIONS
client.on(Events.InteractionCreate, async interaction => {

  // 🔘 BUTTON
  if (interaction.isButton()) {

    // 🔍 CHECK BUTTON
    if (interaction.customId === "check") {
      const modal = new ModalBuilder()
        .setCustomId("modal_check")
        .setTitle("🔍 Check Executor");

      const input = new TextInputBuilder()
        .setCustomId("name")
        .setLabel("Enter executor name")
        .setStyle(TextInputStyle.Short);

      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);

      await interaction.showModal(modal);
    }

    // 🎮 MENU BUTTON
    if (interaction.customId === "menu") {
      const select = new StringSelectMenuBuilder()
        .setCustomId("select_executor")
        .setPlaceholder("🎮 Choose executor...")
        .addOptions(
          Object.keys(executors).map(name => ({
            label: name,
            description: executors[name].status,
            value: name
          }))
        );

      await interaction.reply({
        content: "🎮 Select executor:",
        components: [new ActionRowBuilder().addComponents(select)],
        ephemeral: true
      });
    }
  }

  // 🎮 DROPDOWN
  if (interaction.isStringSelectMenu()) {
    const name = interaction.values[0];
    const data = executors[name];

    await interaction.reply({
      content: `\`\`\`
Executor : ${name}
Status   : ${data.status}
Stability: ${data.stability}
\`\`\``,
      ephemeral: true
    });
  }

  // 🔍 MODAL SUBMIT
  if (interaction.isModalSubmit()) {
    const input = interaction.fields.getTextInputValue("name").toLowerCase();

    let data = executors[input];

    // ❌ NOT FOUND → FUZZY
    if (!data) {
      const closest = findClosestExecutor(input);

      if (closest) {
        const suggest = executors[closest];
        return interaction.reply({
          content: `⚠️ Not exact match\n👉 Did you mean: **${closest}**?\n\nStatus: ${suggest.status}\nStability: ${suggest.stability}`,
          ephemeral: true
        });
      }

      return interaction.reply({
        content: "❌ Executor not found",
        ephemeral: true
      });
    }

    // ✅ FOUND
    await interaction.reply({
      content: `\`\`\`
Executor : ${input}
Status   : ${data.status}
Stability: ${data.stability}
\`\`\``,
      ephemeral: true
    });
  }
});

// 🚀 SEND PANEL (AUTO)
client.once('ready', async () => {
  const channel = await client.channels.fetch("1488456249900142645");

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("check")
      .setLabel("🔍 Check Executor")
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId("menu")
      .setLabel("🎮 Open Menu")
      .setStyle(ButtonStyle.Secondary)
  );

  await channel.send({
    content: "⚙️ **EXECUTOR CONTROL PANEL**",
    components: [buttons]
  });
});

// 🔐 LOGIN
client.login(process.env.TOKEN);

// 💀 ANTI CRASH
process.on('unhandledRejection', console.error);
