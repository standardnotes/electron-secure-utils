import path from 'path'
import fs from 'fs-extra'
import { app, safeStorage } from 'electron'
import { FileNames } from './constants'

type Options = {
  fileName?: string
}

/**
 * Reads and writes dictionary words to an encrypted file.
 */
class EncryptedDictionary {
  private dictionary?: string[]
  private filePath: string

  constructor(options?: Options) {
    this.filePath = path.join(
      app.getPath('userData'),
      options?.fileName ?? FileNames.DefaultEncryptedDictionary
    )
  }

  private get ready(): boolean {
    return this.dictionary !== undefined
  }

  private encryptText(text: string) {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.encryptString(text)
    }
    return Buffer.from(text, 'utf-8')
  }

  private decryptText(text: Buffer) {
    if (safeStorage.isEncryptionAvailable()) {
      return safeStorage.decryptString(text)
    }
    return text.toString()
  }

  private migrateDefaultDictionary() {
    const defaultDictionaryPath = path.join(
      app.getPath('userData'),
      FileNames.ChromeCustomDictionary
    )

    this.dictionary = []

    if (!fs.existsSync(defaultDictionaryPath)) {
      return
    }

    const contents = fs.readFileSync(defaultDictionaryPath, 'utf8')
    if (contents.length === 0) {
      return
    }

    const dictionaryWords = contents.split('\n').filter(w => w.length > 1)
    if (dictionaryWords.length === 0) {
      return
    }

    /** Removes the last line, which is a checksum of the dictionary contents. */
    dictionaryWords.pop()

    this.dictionary = dictionaryWords
    this.save()

    fs.removeSync(defaultDictionaryPath)
  }

  public unload(): void {
    this.dictionary = undefined
  }

  public load(): boolean {
    if (!fs.existsSync(this.filePath)) {
      this.migrateDefaultDictionary()
      return true
    }

    try {
      const contents = fs.readFileSync(this.filePath)
      const decryptedContents = this.decryptText(contents)
      this.dictionary = JSON.parse(decryptedContents)
      return true
    } catch (e: any) {
      this.dictionary = []
      return false
    }
  }

  public save(): boolean {
    if (!this.ready) {
      return false
    }

    try {
      const contents = JSON.stringify(this.dictionary!.sort())
      const encryptedContents = this.encryptText(contents)
      fs.outputFileSync(this.filePath, encryptedContents)
      return true
    } catch (e: any) {
      return false
    }
  }

  public add(word: string): boolean {
    if (!this.ready) {
      return false
    }

    if (this.match(word)) {
      return true
    }

    this.dictionary!.push(word)
    return this.save()
  }

  public remove(word: string): boolean {
    if (!this.ready) {
      return false
    }

    if (!this.match(word)) {
      return true
    }

    this.dictionary = this.dictionary!.filter(w => w !== word)
    return this.save()
  }

  public match(word: string) {
    return this.dictionary!.includes(word)
  }

  public getContents(): string[] {
    return this.dictionary || []
  }
}

export default EncryptedDictionary
