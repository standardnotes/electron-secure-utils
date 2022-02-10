import SecureSpellChecker from './secureSpellChecker'
import { setSpellCheckProvider } from './spellCheckProvider'

function initialize () {
  return new SecureSpellChecker()
}

export default {
  initialize,
  setSpellCheckProvider,
}
