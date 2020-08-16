const Avorion = require('./src/Avorion')
const Discord = require('discord.js')
const { interval } = require('./config.json')

async function main() {
  const avorion = await Avorion.connect()
  setInterval(async () => {
    console.info('~> generating report')
    const data = await avorion.getAllianceData()
    const embed = new Discord.MessageEmbed()
      .setColor('#7388DA')
      .setTitle('Alliance Report')
      .setDescription('Latest overview of our Alliance commodities:')
      .addFields([
        { name: 'Credits', value: data.money, inline: true },
        { name: 'Ships', value: data.ships, inline: true },
        { name: 'Stations', value: data.stations, inline: true },
        { name: '\u200B', value: '\u200B' },
        ...(data.iron > 0) ? [{ name: 'Iron', value: data.iron, inline: true }] : [],
        ...(data.titanium > 0) ? [{ name: 'Titanium', value: data.titanium, inline: true }] : [],
        ...(data.naonite > 0) ? [{ name: 'Naonite', value: data.naonite, inline: true }] : [],
        ...(data.trinium > 0) ? [{ name: 'Trinium', value: data.trinium, inline: true }] : [],
        ...(data.xanion > 0) ? [{ name: 'Xanion', value: data.xanion, inline: true }] : [],
        ...(data.ogonite > 0) ? [{ name: 'Ogonite', value: data.ogonite, inline: true }] : [],
        ...(data.avorion > 0) ? [{ name: 'Avorion', value: data.avorion, inline: true }] : []
      ])
      .setFooter(data.name)
      .setTimestamp()
    await avorion.postEmbed(embed)
  }, interval)
}

main()
