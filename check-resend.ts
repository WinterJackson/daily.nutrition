import { PrismaClient } from '@prisma/client'
import { decrypt } from './src/lib/encryption'

const prisma = new PrismaClient()
async function main() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "default" }, include: { ResendConfig: true }})
  const encryptedObj = settings?.ResendConfig?.encryptedApiKey;
  console.log("Resend Config exists:", !!settings?.ResendConfig);
  console.log("Encrypted key exists:", !!encryptedObj);
  
  if (encryptedObj) {
      try {
          // decrypt takes a string, but what if it's an object?
          const str = typeof encryptedObj === 'string' ? encryptedObj : JSON.stringify(encryptedObj);
          const decrypted = decrypt(str)
          console.log("Decrypted successfully:", !!decrypted)
      } catch (e) {
          console.error("Decryption failed:", e)
      }
  }
}
main().finally(() => prisma.$disconnect())
