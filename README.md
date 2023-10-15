# vs-code-custom-ui-font README

This extension allows you to customize the UI font of Visual Studio Code. Designed specifically for Windows users, it replaces the default Segoe UI font with your font of choice.

## Features

- **Change VS Code UI Font**: This extension adds a new command to your command palette (`extension.changeFont`) that prompts you to enter the name of your preferred font.

  \!\[Change Font Command\]\(images/change-font-command.png\)

> TODO: providing a short animation showcasing the process of using the command, and the before and after UI changes.

## Requirements

- **Windows OS**: As of now, this extension is designed to work exclusively on Windows.

## Extension Settings

The extension does not introduce new VS Code settings through the `contributes.configuration` extension point. Instead, it leverages the global state to save and manage changes to the UI font.

## Known Issues

- **Platform Limitation**: Currently, the extension only supports Windows. Attempts to use it on other platforms will result in a notification indicating the limitation.

## Release Notes

### 1.0.0

Initial release of vs-code-custom-ui-font. Enables users to change the VS Code UI font on Windows.

## Important Note

After changing the font using this extension, VS Code might display a popup with the message:

> "Your Code installation appears to be corrupt. Please reinstall."

**Do not worry about this.** It's a standard warning when the core files of VS Code have been modified, which this extension does to change the font.

To dismiss this warning permanently:

1. Click on the settings (gear) icon on the popup.
2. Select "Don't show again."

**Enjoy!**
