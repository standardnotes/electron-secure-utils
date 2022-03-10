import { webFrame, ipcRenderer } from 'electron'
import { IPCMessageChannels, MACOS_SPELLCHECKER_NOOP_WARNING } from './constants'

const streamSpellCheckSuggestionsForWords = (misspeltWords: string[]) => {
  let wordSuggestions = {}
  
  misspeltWords.forEach((word) => {
    wordSuggestions[word] = webFrame.getWordSuggestions(word)
  })

  ipcRenderer.send(IPCMessageChannels.StreamWordSuggestions, wordSuggestions)
}

function setSpellCheckProvider() {
  if (process.platform === 'darwin') {
    console.warn(MACOS_SPELLCHECKER_NOOP_WARNING)
    return
  }

  if (process.type !== 'renderer') {
    throw new Error(
      'SecureSpellChecker.setSpellCheckProvider() should be called in the renderer process.'
    )
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
