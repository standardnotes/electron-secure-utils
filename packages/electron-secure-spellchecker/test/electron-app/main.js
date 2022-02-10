const path = require('path')
const { app, BrowserWindow } = require('electron')
const contextMenu = require('electron-context-menu')

const SecureSpellChecker = require('../../dist').default

app.on('ready', () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'Electron App',
    webPreferences: {
      devTools: true,
      spellcheck: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  mainWindow.loadURL(`file://${path.join(__dirname, '/index.html')}`)

  const secureSpellChecker = SecureSpellChecker.initialize()

  contextMenu({
    menu: (actions, { misspelledWord }) => {
      let suggestionOptions = []

      const buildSuggestionOptions = (suggestions) => {
        if (suggestions.length === 0) {
          return [
            {
              label: 'No suggestions',
              enabled: false
            }
          ]
        }

        return suggestions.map((suggestion) => {
          return {
            label: suggestion,
            click: () => mainWindow.webContents.replaceMisspelling(suggestion)
          }
        })
      }

      if (misspelledWord) {
        const dictionarySuggestions = secureSpellChecker.getSpellingSuggestions(misspelledWord)
        suggestionOptions = buildSuggestionOptions(dictionarySuggestions)
      }

      return [
        ...suggestionOptions,
        actions.separator(),
        actions.copyLink({
          transform: content => `modified_link_${content}`
        }),
        actions.separator(),
        actions.copy({
          transform: content => `modified_copy_${content}`
        }),
        actions.paste({
          transform: content => `modified_paste_${content}`
        }),
        ...(misspelledWord && [
          {
            label: 'Add to dictionary',
            click: () => mainWindow.webContents.session.addWordToSpellCheckerDictionary(misspelledWord)
          }
        ]),
      ]
    }
  })
})
