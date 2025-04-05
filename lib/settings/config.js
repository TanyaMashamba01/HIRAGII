/**
 * Copyright (C) 2025 LatestURL
 *
 * This code is licensed under the MIT License.
 * See the LICENSE file in the repository root for full license text.
 *
 * HIRAGII Bot Configuration
 * Version: 1.0.0
 * Created by LatestURL
 * GitHub: https://github.com/latesturl/HIRAGII
 */

import fs from "fs"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)

// Bot owner numbers
globalThis.owner = [
  "212703897448", // primary owner number
  "", // secondary owner number (if any)
]

// Custom session directory (default: "./session")
globalThis.sessionDir = "./session"

// Watch for file changes
fs.watchFile(__filename, () => {
  fs.unwatchFile(__filename)
  console.log(`Update ${__filename}`)
  import(`file://${__filename}?update=${Date.now()}`).catch(console.error)
})

