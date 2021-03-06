const IPC_CHANNEL_PREFIX = 'secure-spellchecker'

export const IPCMessageChannels = {
  WordsNotInDictionary: `${IPC_CHANNEL_PREFIX}_words-not-in-dictionary`,
  StreamWordSuggestions: `${IPC_CHANNEL_PREFIX}_stream-word-suggestions`,
}

export enum FileNames {
  ChromeCustomDictionary = 'Custom Dictionary.txt',
  DefaultEncryptedDictionary = 'enc_dic.txt'
}

export const MACOS_SPELLCHECKER_NOOP_WARNING = "The system spellchecker is used on macOS. Skipping..."
