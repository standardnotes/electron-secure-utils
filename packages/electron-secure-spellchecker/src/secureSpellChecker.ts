import { app, ipcMain, BrowserWindow } from 'electron'
import EncryptedDictionary from './encryptedDictionary'
import { IPCMessageChannels } from './constants'

type SpellingSuggestions = {
  [word: string]: string[]
}

class SecureSpellChecker {
  private userDictionary: EncryptedDictionary
  private spellingSuggestions: SpellingSuggestions = {}

  constructor() {
    if (process.platform === 'darwin') {
      throw new Error('System spellchecker is used in MacOS. Skipping...');
    }

    if (process.type !== 'browser') {
      throw new Error('Instance should be created in main process.')
    }

    this.userDictionary = new EncryptedDictionary()
    this.userDictionary.load()

    this.replaceSpellCheckerFunctions()
    this.handleIPCMessages()
  }

  /**
   * Replaces spell checker functions with our own, so that `electron` uses our encrypted dictionary
   * and not the default, plain-text one. Executed each time a browser window gets focused.
   */
  private async replaceSpellCheckerFunctions() {
    await app.whenReady()

    app.on('browser-window-focus', () => {
      const activeWindow = BrowserWindow.getFocusedWindow()
      if (!activeWindow) {
        return
      }

      activeWindow.webContents.session.addWordToSpellCheckerDictionary = (word) => {
        return this.addToDictionary(word)
      }

      activeWindow.webContents.session.removeWordFromSpellCheckerDictionary = (word) => {
        return this.removeFromDictionary(word)
      }

      activeWindow.webContents.session.listWordsInSpellCheckerDictionary = async () => {
        return this.listWords()
      }
    })
  }

  /**
   * Sets up the IPC channels to communicate with the renderer process.
   */
  private handleIPCMessages() {
    ipcMain.handle(IPCMessageChannels.WordsNotInDictionary, (_, words: string[]) => {
      return this.wordsNotInDictionary(words)
    })

    ipcMain.on(IPCMessageChannels.StreamWordSuggestions, (_, wordSuggestions: SpellingSuggestions) => {
      this.spellingSuggestions = wordSuggestions
    })
  }

  private wordsNotInDictionary(words: string[]): string[] {
    return words.filter(word => !this.userDictionary.match(word))
  }

  /**
   * Adds a word to the encrypted dictionary.
   * 
   * Has the same effect as using `addWordToSpellCheckerDictionary` on your session object.
   * @param word the misspelt word.
   */
  public addToDictionary(word: string): boolean {
    return this.userDictionary.add(word)
  }

  /**
   * Removes a word from the encrypted dictionary.
   * 
   * Has the same effect as using `removeWordFromSpellCheckerDictionary` on your session object.
   * @param word the misspelt word.
   */
  public removeFromDictionary(word: string): boolean {
    return this.userDictionary.remove(word)
  }

  /**
   * Gets all words from the encrypted dictionary.
   * 
   * Has the same effect as using `listWordsInSpellCheckerDictionary` on your session object.
   */
  public listWords(): string[] {
    return this.userDictionary.getContents()
  }

  /**
   * Gets spelling suggestions for a misspelt word.
   * 
   * The results are obtained from `webFrame.getWordSuggestions` and sent via a special
   * IPC channel.
   * @param word the misspelt word to get suggestions from.
   */
  public getSpellingSuggestions(word: string): string[] {
    return this.spellingSuggestions[word] ?? []
  }
}

export default SecureSpellChecker
