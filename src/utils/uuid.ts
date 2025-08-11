/**
 * Genera un UUID v4 simple sin dependencias externas
 * Compatible con React Native
 */
export function generateUUID(): string {
  const chars = '0123456789abcdef'
  const sections = [8, 4, 4, 4, 12]
  let uuid = ''

  for (let i = 0; i < sections.length; i++) {
    if (i > 0) uuid += '-'

    for (let j = 0; j < sections[i]; j++) {
      if (i === 1 && j === 0) {
        // Version 4
        uuid += '4'
      } else if (i === 2 && j === 0) {
        // Variant bits
        uuid += chars[8 + Math.floor(Math.random() * 4)]
      } else {
        uuid += chars[Math.floor(Math.random() * 16)]
      }
    }
  }

  return uuid
}

export default generateUUID
