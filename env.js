const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

const dotenvFiles = ['.env', '.env.local']

// Load env variables from .env files

dotenvFiles.forEach((dotenvFile) => {
  const filePath = path.resolve(dotenvFile)
  if (fs.existsSync(filePath)) {
    dotenvExpand(dotenv.config({ path: filePath }))
  }
})
