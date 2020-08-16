const Rcon = require('rcon')
const Discord = require('discord.js')
const config = require('../config.json')

Array.prototype.flat = function() {
  const depth = isNaN(arguments[0]) ? 1 : Number(arguments[0])
  return depth ? Array.prototype.reduce.call(this, function (acc, cur) {
    if (Array.isArray(cur)) {
      acc.push.apply(acc, Array.prototype.flat.call(cur, depth - 1));
    } else {
      acc.push(cur);
    }
    return acc;
  }, []) : Array.prototype.slice.call(this)
}

module.exports = class Avorion {
  static async connect() {
    const instance = new Avorion()
    await instance.connect()
    return instance
  }

  constructor() {
    const { host, port, password } = config.avorion
    this.connection = new Rcon(host, port, password)
    this.connection.on('response', this.onResponse.bind(this))
    this.requests = []
    this.discord = new Discord.Client()
    this.channel = null
  }

  async connect() {
    await Promise.all([
      new Promise((resolve) => { this.connection.on('auth', resolve); this.connection.connect() }),
      new Promise((resolve) => { this.discord.once('ready', resolve); this.discord.login(config.discord.token) })
    ])
    this.channel = await this.discord.channels.fetch('744492463032631319')
  }

  getAllianceData() {
    return this.sendCommand(`/alliance ${config.avorion.allianceId}`)
  }

  sendCommand(command) {
    let resolve
    const promise = new Promise((r) => { resolve = r })
    this.connection.send(`${command} ${this.requests.length}`)
    this.requests.push(resolve)
    return promise
  }

  postEmbed(embed) {
    return this.channel.send(embed)
  }

  onResponse(response) {
    if (response === '') { return }
    const match = response.match(/\!\|([0-9]+)\|(.*)/)
    if (!match) { return }
    const index = parseInt(match[1], 10)
    const data = JSON.parse(match[2])
    const resolve = this.requests[index]
    resolve(data)
  }

  close() {
    this.connection.disconnect()
    this.discord.destroy()
  }
}
