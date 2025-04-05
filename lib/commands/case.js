/**
 * Copyright (C) 2025 LatestURL
 *
 * This code is licensed under the MIT License.
 * See the LICENSE file in the repository root for full license text.
 *
 * HIRAGII Bot Handler
 * Version: 1.0.0
 * Created by LatestURL
 * GitHub: https://github.com/latesturl/HIRAGII
 */

import "../settings/config.js"
import fs from "fs"
import util from "util"
import { exec } from "child_process"
import chalk from "chalk"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Function to get group admins
const getGroupAdmins = (participants) => {
  const admins = []
  for (const i of participants) {
    if (i.admin === "superadmin" || i.admin === "admin") admins.push(i.id)
  }
  return admins
}

// Create a formatted log table
const createLogTable = (data) => {
  // Find the longest key and value for proper spacing
  let maxKeyLength = 0
  let maxValueLength = 0

  for (const [key, value] of Object.entries(data)) {
    maxKeyLength = Math.max(maxKeyLength, key.length)
    maxValueLength = Math.max(maxValueLength, String(value).length)
  }

  // Add padding
  maxKeyLength += 2
  maxValueLength += 2

  // Calculate total width
  const totalWidth = maxKeyLength + maxValueLength + 3 // 3 for the separator and borders

  // Create top border
  let table = chalk.cyan("+" + "-".repeat(maxKeyLength) + "+" + "-".repeat(maxValueLength) + "+") + "\n"

  // Create header
  table +=
    chalk.cyan("|") +
    chalk.white(" KEY".padEnd(maxKeyLength)) +
    chalk.cyan("|") +
    chalk.white(" VALUE".padEnd(maxValueLength)) +
    chalk.cyan("|") +
    "\n"

  // Create separator
  table += chalk.cyan("+" + "-".repeat(maxKeyLength) + "+" + "-".repeat(maxValueLength) + "+") + "\n"

  // Create rows
  for (const [key, value] of Object.entries(data)) {
    table +=
      chalk.cyan("|") +
      chalk.white(` ${key}`.padEnd(maxKeyLength)) +
      chalk.cyan("|") +
      chalk.green(` ${value}`.padEnd(maxValueLength)) +
      chalk.cyan("|") +
      "\n"
  }

  // Create bottom border
  table += chalk.cyan("+" + "-".repeat(maxKeyLength) + "+" + "-".repeat(maxValueLength) + "+")

  return table
}

export default async (conn, m, chatUpdate, store) => {
  try {
    // Update the body parsing section to be more readable
    // Replace the existing body parser with this more organized version
    var body =
      (m.mtype === "conversation"
        ? m.message?.conversation
        : m.mtype === "imageMessage"
          ? m.message?.imageMessage?.caption
          : m.mtype === "videoMessage"
            ? m.message?.videoMessage?.caption
            : m.mtype === "extendedTextMessage"
              ? m.message?.extendedTextMessage?.text
              : m.mtype === "buttonsResponseMessage"
                ? m.message?.buttonsResponseMessage?.selectedButtonId
                : m.mtype === "listResponseMessage"
                  ? m.message?.listResponseMessage?.singleSelectReply?.selectedRowId
                  : m.mtype === "templateButtonReplyMessage"
                    ? m.message?.templateButtonReplyMessage?.selectedId
                    : m.mtype === "interactiveResponseMessage"
                      ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id
                      : m.mtype === "messageContextInfo"
                        ? m.message?.buttonsResponseMessage?.selectedButtonId ||
                          m.message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
                          m.text
                        : "") || ""

    const budy = typeof m.text === "string" ? m.text : ""
    const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/
    const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : "."
    const isCmd = body.startsWith(prefix)
    const command = isCmd ? body.slice(prefix.length).trim().split(" ").shift().toLowerCase() : ""
    const args = body.trim().split(/ +/).slice(1)
    const text = args.join(" ")
    const q = text

    // Add section for quoted message handling
    const fatkuns = m.quoted || m
    const quoted =
      fatkuns.mtype === "buttonsMessage"
        ? fatkuns[Object.keys(fatkuns)[1]]
        : fatkuns.mtype === "templateMessage"
          ? fatkuns.hydratedTemplate[Object.keys(fatkuns.hydratedTemplate)[1]]
          : fatkuns.mtype === "product"
            ? fatkuns[Object.keys(fatkuns)[0]]
            : m.quoted
              ? m.quoted
              : m
    const mime = (quoted.msg || quoted).mimetype || ""
    const qmsg = quoted.msg || quoted
    const isMedia = /image|video|sticker|audio/.test(mime)

    //================= { USER } =================\\
    const botNumber = await conn.decodeJid(conn.user.id)
    const globalelit = `${global.owner}@s.whatsapp.net`
    const sender = m.key.fromMe
      ? conn.user.id.split(":")[0] + "@s.whatsapp.net" || conn.user.id
      : m.key.participant || m.key.remoteJid
    const senderNumber = sender.split("@")[0]
    const isAuthor = global.owner.map((v) => v.replace(/[^0-9]/g, "")).includes(senderNumber)
    const isOwner = globalelit.includes(m.sender)
    const itsMe = m.sender === botNumber ? true : false
    const isCreator = [botNumber, ...global.owner]
      .map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net")
      .includes(m.sender)
    const pushname = m.pushName || `${senderNumber}`
    const isBot = botNumber.includes(senderNumber)

    //================= { GROUP } =================\\
    const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat).catch(() => null) : null
    const groupName = groupMetadata?.subject || ""
    const participants = m.isGroup ? groupMetadata?.participants || [] : []
    const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : ""
    const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
    const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
    const groupOwner = m.isGroup ? groupMetadata?.owner : ""
    const isGroupOwner = m.isGroup ? (groupOwner ? groupOwner : groupAdmins).includes(m.sender) : false

    // Add warning section before switch statement
    // Console logging with improved formatting
    if (m.message) {
      const logData = {
        SENDER: pushname || "Unknown",
        JID: m.sender,
        ...(m.isGroup && { GROUP: groupName || "Unknown" }),
        COMMAND: isCmd ? "Yes" : "No",
      }

      console.log("\n" + chalk.cyan("+" + "=".repeat(50) + "+"))
      console.log(chalk.cyan("|") + chalk.white(" LOG MESSAGE ".padStart(25 + 7).padEnd(50)) + chalk.cyan("|"))
      console.log(chalk.cyan("+" + "=".repeat(50) + "+"))
      console.log(createLogTable(logData))
    }

    //================= { COMMAND HANDLER } =================\\
    //================= { MAIN COMMANDS } =================\\
    switch (command) {
      //case"help":{
      //  m.reply("Help command")
      //  break
      //}
      //case"menu":{
      //  m.reply("Menu command")
      //  break
      //}
      //Add your cases here without spaces between case and command name

      //================= { OWNER COMMANDS } =================\\
      default: {
        // Eval command for owner (=>)
        if (budy.startsWith("=>")) {
          if (!isCreator) return
          function Return(sul) {
            const sat = JSON.stringify(sul, null, 2)
            let bang = util.format(sat)
            if (sat == undefined) bang = util.format(sul)
            return m.reply(bang)
          }
          try {
            m.reply(util.format(eval(`(async () => { return ${budy.slice(3)} })()`)))
          } catch (e) {
            m.reply(String(e))
          }
        }

        // Eval command for owner (>)
        if (budy.startsWith(">")) {
          if (!isCreator) return
          try {
            let evaled = eval(budy.slice(2))
            if (typeof evaled !== "string") evaled = util.inspect(evaled)
            m.reply(evaled)
          } catch (err) {
            m.reply(String(err))
          }
        }

        // Terminal command for owner ($)
        if (budy.startsWith("$")) {
          if (!isCreator) return
          exec(budy.slice(2), (err, stdout) => {
            if (err) return m.reply(`${err}`)
            if (stdout) return m.reply(stdout)
          })
        }
      }
    }
  } catch (err) {
    console.log(util.format(err))
  }
}

//================= { FILE WATCHER } =================\\
// Watch for file changes
fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename)
  console.log(chalk.redBright(`Update ${__filename}`))
  import(`file://${__filename}?update=${Date.now()}`).catch(console.error)
})

