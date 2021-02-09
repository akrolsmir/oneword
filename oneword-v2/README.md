## Migration from One Word

- Install yarn, then:
  ```
  cd oneword-v2
  yarn # installs all dependencies
  ```
- Install VSCode extensions:

  - `Vetur` for Vue syntax highlighting
  - `Debugger for Chrome` for breakpoint debugging from inside VSCode
    - Then from the menu, `Run` > `Add configuration` > `Chrome (preview)`
      ![](https://i.imgur.com/uFJa9xS.png)
    - [In-depth setup instructions](https://www.freecodecamp.org/news/how-to-set-up-the-debugger-for-chrome-extension-in-visual-studio-code-c0b3e5937c01/)
  - `Prettier` for format-on-save

    - Then open VSCode `Preferences: Open Settings (JSON)`, and add

    ```
    "editor.formatOnSave": true,
    "[html]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[javascript]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[vue]": {
      "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    ```

    - [In-depth setup instructions](https://www.robinwieruch.de/how-to-use-prettier-vscode)

Running the code:

- `yarn start` to spin up a local server
  - When you save a file, the app will automatically reload!
