import { webFrame, ipcRenderer } from 'electron'
import { IPCMessageChannels, MACOS_SPELLCHECKER_NOOP_WARNING } from './constants'

const streamSpellCheckSuggestionsForWords = (misspeltWords: string[]) => {
  let wordSuggestions = {}
  
  misspeltWords.forEach((word) => {
    wordSuggestions[word] = webFrame.getWordSuggestions(word)
  })

  ipcRenderer.send(IPCMessageChannels.StreamWordSuggestions, wordSuggestions)
}

/**
 * Sets the spell check provider to read words from our encrypted dictionary.
 * Uses IPC to obtain the words that are not in the dictionary.
 * 
 * Must be called within your preload script.
 */
function setSpellCheckProvider() {
  if (process.platform === 'darwin') {
    console.warn(MACOS_SPELLCHECKER_NOOP_WARNING)
    return
  }

  if (process.type !== 'renderer') {
    throw new Error('setSpellCheckProvider should be called in renderer process.')
  }

  webFrame.setSpellCheckProvider('en-US', {
    spellCheck: async (words, callback) => {
      const misspeltWords = words.filter(word => webFrame.isWordMisspelled(word))
      const wordsNotInDictionary = await ipcRenderer.invoke(IPCMessageChannels.WordsNotInDictionary, misspeltWords)

      streamSpellCheckSuggestionsForWords(wordsNotInDictionary ?? [])
      callback(wordsNotInDictionary)
    }
  })
}

export {
  setSpellCheckProvider
}
