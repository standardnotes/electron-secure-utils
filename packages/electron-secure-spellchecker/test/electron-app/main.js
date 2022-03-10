const path = require('path')
const { app, BrowserWindow } = require('electron')
const contextMenu = require('electron-context-menu')

const SecureSpellChecker = require('../../dist').default
SecureSpellChecker.setup()

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

  const secureSpellChecker = SecureSpellChecker.getInstance()

  contextMenu({
    menu: (actions, { misspelledWord }, _, dictionarySuggestions) => {
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

      if (misspelledWord && process.platform !== 'darwin') {
        const suggestions = secureSpellChecker.getSpellingSuggestions(misspelledWord)
        dictionarySuggestions = buildSuggestionOptions(suggestions)
      }

      return [
        ...dictionarySuggestions,
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
