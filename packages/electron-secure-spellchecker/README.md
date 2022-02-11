# electron-secure-spellchecker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A spellchecker provider for Electron, that encrypts your dictionary file.

## Why?

Electron uses the built-in spellchecker from Chromium. It stores custom dictionary words on a plain-text file
named `Custom dictionary.txt`:

```txt
worda
wordb
checksum_v1 = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

This package reads all words from such file (if any exists) and then encrypts them using [Electron's safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage). The plain-text file is then deleted and the encrypted file is used to read/write words going forward.

## Installation

_Your Electron app must be using `electron@15.3.0` or later._

To install, run:

```bash
yarn add @standardnotes/electron-secure-spellchecker
```

Or:

```bash
npm install @standardnotes/electron-secure-spellchecker
```

## Usage

1. Import the package into your `main` file and call `initialize()`:

```javascript
import SecureSpellChecker from '@standardnotes/electron-secure-spellchecker';

...

const secureSpellChecker = SecureSpellChecker.initialize();
```

1. Use `secureSpellChecker.getSpellingSuggestions()` to obtain misspelt word suggestions:

```javascript
...
const suggestions = secureSpellChecker.getSpellingSuggestions('ytpo');
```

1. Import the package into your `preload` script and call `setSpellCheckProvider()`

```javascript
import SecureSpellChecker from '@standardnotes/electron-secure-spellchecker';

...

SecureSpellChecker.setSpellCheckProvider();
```

---

You can also see usage on [the test app](test/electron-app/)

## Notes

Needs `libxkbfile-dev`. You can install it by running the following (Linux):

```bash
sudo apt-get install libxkbfile-dev
```

## Contributing

1. Fork this repo
1. Create your feature branch: `git checkout -b feat/my-feature`
1. Code your feature
1. Add your changes: `git add .`
1. Commit your changes: `git commit -am 'feat: my feature'`
1. Push the branch `git push origin feat/my-feature`
1. Submit a pull request

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (MIT).
