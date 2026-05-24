import * as vscode from 'vscode';

const WINDOWS_ILLEGAL_CHARS = /[<>:"/\\|?*]/g;
const WINDOWS_CONTROL_CHARS = /[\x00-\x1f]/g;
const WINDOWS_RESERVED = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;

function splitExtension(name: string): [string, string] {
    const dot = name.lastIndexOf('.');
    if (dot > 0) {
        return [name.slice(0, dot), name.slice(dot)];
    }
    return [name, ''];
}

function normalizeUnicode(s: string): string {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x00-\x7F]/g, '');
}

export function windowsSafe(input: string): string {
    const [base, ext] = splitExtension(input);
    let result = base
        .replace(WINDOWS_ILLEGAL_CHARS, '')
        .replace(WINDOWS_CONTROL_CHARS, '')
        .replace(/ /g, '_')
        .replace(/[. ]+$/, '');
    if (WINDOWS_RESERVED.test(result)) {
        result += '_';
    }
    return (result || '_') + ext;
}

export function linuxSafe(input: string): string {
    const [base, ext] = splitExtension(input);
    const result = base
        .replace(/\x00/g, '')
        .replace(/^-+/, '')
        .replace(/ /g, '\\ ');
    return (result || '_') + ext;
}

export function urlSlug(input: string): string {
    const [base, ext] = splitExtension(input);
    const result = normalizeUnicode(base)
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-{2,}/g, '-')
        .replace(/^-+|-+$/g, '');
    return (result || '_') + ext;
}

export function filenameSafe(input: string): string {
    const [base, ext] = splitExtension(input);
    let result = normalizeUnicode(base)
        .replace(WINDOWS_ILLEGAL_CHARS, '')
        .replace(WINDOWS_CONTROL_CHARS, '')
        .replace(/^-+/, '')
        .replace(/ /g, '_')
        .replace(/[. ]+$/, '');
    if (WINDOWS_RESERVED.test(result)) {
        result += '_';
    }
    return (result || '_') + ext;
}

function applyToSelection(transform: (s: string) => string, message: string): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const sel = editor.selection;
    if (sel.isEmpty) {
        vscode.window.showWarningMessage('Please select text first');
        return;
    }
    const sanitized = transform(editor.document.getText(sel));
    editor.edit(b => b.replace(sel, sanitized));
    vscode.window.showInformationMessage(message);
}

export function activate(context: vscode.ExtensionContext) {
    const commands: [string, (s: string) => string, string][] = [
        ['path-sanitizer.windowsSafe', windowsSafe, 'Converted to Windows safe path'],
        ['path-sanitizer.linuxSafe',   linuxSafe,   'Converted to Linux safe path'],
        ['path-sanitizer.urlSlug',     urlSlug,     'Converted to URL slug'],
        ['path-sanitizer.filenameSafe', filenameSafe, 'Converted to filename safe path'],
    ];

    for (const [id, fn, msg] of commands) {
        context.subscriptions.push(
            vscode.commands.registerCommand(id, () => applyToSelection(fn, msg))
        );
    }
}

export function deactivate() {}
