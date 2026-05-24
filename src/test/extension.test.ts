import * as assert from 'assert';
import { windowsSafe, linuxSafe, urlSlug, filenameSafe } from '../extension';

suite('windowsSafe', () => {
    test('removes illegal characters', () => {
        assert.strictEqual(windowsSafe('fi<le>na:me.txt'), 'filename.txt');
        assert.strictEqual(windowsSafe('a"b/c\\d|e?f*g.txt'), 'abcdefg.txt');
    });

    test('replaces spaces with underscores', () => {
        assert.strictEqual(windowsSafe('my file name.txt'), 'my_file_name.txt');
    });

    test('strips trailing dots from the base name', () => {
        assert.strictEqual(windowsSafe('trailing....ext'), 'trailing.ext');
    });

    test('spaces in base become underscores, not stripped', () => {
        assert.strictEqual(windowsSafe('file.  .txt'), 'file.__.txt');
    });

    test('removes control characters', () => {
        assert.strictEqual(windowsSafe('file\x00name.txt'), 'filename.txt');
        assert.strictEqual(windowsSafe('file\x1fname.txt'), 'filename.txt');
    });

    test('handles all reserved names', () => {
        for (const name of ['CON', 'PRN', 'AUX', 'NUL',
                             'COM1', 'COM9', 'LPT1', 'LPT9']) {
            assert.strictEqual(windowsSafe(name), name + '_', name);
        }
    });

    test('reserved name check is case-insensitive', () => {
        assert.strictEqual(windowsSafe('con'), 'con_');
        assert.strictEqual(windowsSafe('Con'), 'Con_');
        assert.strictEqual(windowsSafe('nUl'), 'nUl_');
    });

    test('reserved names with extension still get underscore suffix on base', () => {
        assert.strictEqual(windowsSafe('CON.txt'), 'CON_.txt');
        assert.strictEqual(windowsSafe('NUL.log'), 'NUL_.log');
    });

    test('COM10 and CONSOLE are not reserved', () => {
        assert.strictEqual(windowsSafe('COM10.txt'), 'COM10.txt');
        assert.strictEqual(windowsSafe('CONSOLE.txt'), 'CONSOLE.txt');
    });

    test('preserves file extension', () => {
        assert.strictEqual(windowsSafe('my<file>.tar.gz'), 'myfile.tar.gz');
        assert.strictEqual(windowsSafe('report.docx'), 'report.docx');
    });

    test('empty or all-illegal input falls back to underscore', () => {
        assert.strictEqual(windowsSafe(''), '_');
        assert.strictEqual(windowsSafe('<>:"/\\|?*'), '_');
    });

    test('dotfiles are treated as the full name, not split', () => {
        assert.strictEqual(windowsSafe('.gitignore'), '.gitignore');
    });
});

suite('linuxSafe', () => {
    test('removes null bytes', () => {
        assert.strictEqual(linuxSafe('file\x00name.txt'), 'filename.txt');
    });

    test('null-only base falls back to underscore', () => {
        assert.strictEqual(linuxSafe('\x00\x00'), '_');
        assert.strictEqual(linuxSafe('\x00\x00.txt'), '_.txt');
    });

    test('strips leading dashes', () => {
        assert.strictEqual(linuxSafe('-file.txt'), 'file.txt');
        assert.strictEqual(linuxSafe('---file.txt'), 'file.txt');
    });

    test('non-leading dashes are preserved', () => {
        assert.strictEqual(linuxSafe('my-file.txt'), 'my-file.txt');
    });

    test('replaces spaces with backslash-space', () => {
        assert.strictEqual(linuxSafe('my file.txt'), 'my\\ file.txt');
        assert.strictEqual(linuxSafe('a b c'), 'a\\ b\\ c');
    });

    test('preserves file extension', () => {
        assert.strictEqual(linuxSafe('normal.txt'), 'normal.txt');
        assert.strictEqual(linuxSafe('archive.tar.gz'), 'archive.tar.gz');
    });

    test('empty input falls back to underscore', () => {
        assert.strictEqual(linuxSafe(''), '_');
    });

    test('dotfiles are treated as the full name, not split', () => {
        assert.strictEqual(linuxSafe('.bashrc'), '.bashrc');
    });
});

suite('urlSlug', () => {
    test('converts to lowercase', () => {
        assert.strictEqual(urlSlug('Hello World.txt'), 'hello-world.txt');
        assert.strictEqual(urlSlug('MyFile.PDF'), 'myfile.PDF');
    });

    test('replaces spaces with hyphens', () => {
        assert.strictEqual(urlSlug('hello world'), 'hello-world');
    });

    test('removes non-alphanumeric characters', () => {
        assert.strictEqual(urlSlug('hello!world?.txt'), 'helloworld.txt');
    });

    test('removes non-alphanumeric — dot in base is stripped', () => {
        // The dot in "archive.tar" is part of the base and is non-alphanumeric
        assert.strictEqual(urlSlug('archive.tar.gz'), 'archivetar.gz');
        assert.strictEqual(urlSlug('price: $9.99'), 'price-9.99');
    });

    test('normalizes unicode accents to ASCII', () => {
        assert.strictEqual(urlSlug('café.txt'), 'cafe.txt');
        assert.strictEqual(urlSlug('résumé.doc'), 'resume.doc');
        assert.strictEqual(urlSlug('naïve.txt'), 'naive.txt');
    });

    test('strips emoji', () => {
        assert.strictEqual(urlSlug('hello🌍world.txt'), 'helloworld.txt');
        assert.strictEqual(urlSlug('🚀rocket.txt'), 'rocket.txt');
    });

    test('collapses multiple consecutive hyphens', () => {
        assert.strictEqual(urlSlug('hello---world.txt'), 'hello-world.txt');
        assert.strictEqual(urlSlug('a  b  c'), 'a-b-c');
    });

    test('strips leading and trailing hyphens', () => {
        assert.strictEqual(urlSlug(' hello .txt'), 'hello.txt');
        assert.strictEqual(urlSlug('!hello!.txt'), 'hello.txt');
    });

    test('preserves file extension as-is', () => {
        assert.strictEqual(urlSlug('My File.txt'), 'my-file.txt');
    });

    test('empty or symbol-only input falls back to underscore', () => {
        assert.strictEqual(urlSlug(''), '_');
        assert.strictEqual(urlSlug('🚀🌍'), '_');
        assert.strictEqual(urlSlug('!!!'), '_');
    });

    test('dotfile dot is removed by slug rules', () => {
        // dot is position 0 so splitExtension treats ".env" as a base name,
        // then the dot is stripped by the non-alphanumeric filter
        assert.strictEqual(urlSlug('.env'), 'env');
    });
});

suite('filenameSafe', () => {
    test('removes Windows illegal characters', () => {
        assert.strictEqual(filenameSafe('fi<le>na:me.txt'), 'filename.txt');
        assert.strictEqual(filenameSafe('a"b/c\\d|e?f*g.txt'), 'abcdefg.txt');
    });

    test('strips leading dashes', () => {
        assert.strictEqual(filenameSafe('-file.txt'), 'file.txt');
    });

    test('replaces spaces with underscores', () => {
        assert.strictEqual(filenameSafe('my file.txt'), 'my_file.txt');
    });

    test('strips trailing dots from base', () => {
        assert.strictEqual(filenameSafe('file....txt'), 'file.txt');
    });

    test('handles reserved names', () => {
        assert.strictEqual(filenameSafe('CON.txt'), 'CON_.txt');
        assert.strictEqual(filenameSafe('NUL'), 'NUL_');
    });

    test('normalizes unicode accents to ASCII', () => {
        assert.strictEqual(filenameSafe('café report.txt'), 'cafe_report.txt');
        assert.strictEqual(filenameSafe('résumé.docx'), 'resume.docx');
    });

    test('strips emoji', () => {
        assert.strictEqual(filenameSafe('my🚀file.txt'), 'myfile.txt');
    });

    test('removes control characters', () => {
        assert.strictEqual(filenameSafe('file\x00name.txt'), 'filename.txt');
    });

    test('preserves file extension', () => {
        assert.strictEqual(filenameSafe('my file.tar.gz'), 'my_file.tar.gz');
    });

    test('empty or all-illegal input falls back to underscore', () => {
        assert.strictEqual(filenameSafe(''), '_');
        assert.strictEqual(filenameSafe('<>:"/\\|?*'), '_');
    });

    test('dotfiles are treated as the full name, not split', () => {
        assert.strictEqual(filenameSafe('.gitignore'), '.gitignore');
    });

    test('combined worst-case input', () => {
        assert.strictEqual(
            filenameSafe('-cON: résumé🚀 file...txt'),
            'cON_resume_file.txt'
        );
    });
});
