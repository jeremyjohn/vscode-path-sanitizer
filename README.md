# Path Sanitizer

A Visual Studio Code extension that sanitizes strings into safe paths for Windows, Linux, URL slugs, and filenames.

## Usage

1. Select any text in the editor
2. Press `Ctrl+Shift+P` and type `Path:` to see all commands
3. Or right-click the selected text for the context menu

## Commands

| Command | Description | Example |
|---|---|---|
| `Path: Windows Safe` | Removes illegal Windows chars, spaces → `_` | `My File<name>` → `My_File_name` |
| `Path: Linux Safe` | Strips null bytes, leading `-`, escapes spaces | `-my file` → `my\ file` |
| `Path: URL Slug` | Lowercase, spaces → `-`, unicode normalized | `café 🎉` → `cafe` |
| `Path: Filename Safe` | Safest for any OS combined | `café<file>` → `cafefile` |

## Features

- Works on selected text, replaces in-place
- Preserves file extensions
- Handles unicode normalization (café → cafe)
- Handles reserved Windows names (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
- Dotfiles preserved (.gitignore stays .gitignore)

## License

MIT
