import { app } from 'electron'
import SecureSpellChecker from './secureSpellChecker'
import { setSpellCheckProvider } from './spellCheckProvider'

let instance: SecureSpellChecker;

function getOrCreateInstance() {
  if (!instance) {
    instance = new SecureSpellChecker()
  }
  return instance
}

function setup() {
  if (instance) {
    throw new Error('SecureSpellChecker.setup() has been called already.')
  }

  if (app.isReady()) {
    throw new Error(
      'SecureSpellChecker.prepare() must be called before application is ready.'
    )
  }

  app.on('ready', () => {
    getOrCreateInstance()
  })
}

export default {
  /**
   * Must be called in your app's `main` script `before` the 
   * ready event of the app module is emitted.
   */
  setup,
  /**
   * Gets the `SecureSpellChecker` instance.
   * 
   * Must be called within your `main` script.
   */
  getInstance: () => {
    if (process.type !== 'browser') {
      throw new Error('SecureSpellChecker instance should be used in the main process.')
    }
    return getOrCreateInstance()
  },
  /**
   * Sets the spell check provider to read words from our encrypted dictionary.
   * 
   * Uses `IPC` to obtain the words that are not in the dictionary.
   * Must be called within your `preload` script.
   */
  setSpellCheckProvider,
}
