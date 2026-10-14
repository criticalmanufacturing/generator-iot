'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { test } = require('node:test');

const cli = path.resolve(__dirname, '../generators/packagePacker/cli.js');
const run = (args, cwd) => spawnSync(process.execPath, [cli, ...args], {
    cwd, encoding: 'utf8', timeout: 30000
});

test('help explains the standalone options without packing', () => {
    const result = run(['--help']);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Usage: cmf-iot-pack/);
    assert.match(result.stdout, /--input/);
});

test('invalid arguments return a failure', () => {
    const result = run(['--unknown-option']);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /unknown-option/);
});

test('packing preserves the caller identity and existing post-actions', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cmf standalone packer '));
    try {
        const source = path.join(root, 'source package');
        const output = path.join(root, 'output packages');
        fs.mkdirSync(path.join(source, 'src'), { recursive: true });
        if (process.getuid) fs.chmodSync(source, 0o755);
        fs.writeFileSync(path.join(source, 'package.json'), JSON.stringify({
            name: 'standalone-packer-test', version: '1.0.0', main: 'src/index.js'
        }));
        fs.writeFileSync(path.join(source, 'npm-shrinkwrap.json'), JSON.stringify({
            name: 'standalone-packer-test', version: '1.0.0', lockfileVersion: 2, packages: {}
        }));
        fs.writeFileSync(path.join(source, 'packConfig.json'), JSON.stringify({
            type: 'TasksLibrary',
            postActions: [{ type: 'CopyFile', file: 'marker.txt', source: '${Source}', destination: '${Temp}' }]
        }));
        fs.writeFileSync(path.join(source, 'src/index.js'), 'module.exports = { packed: true };\n');
        fs.writeFileSync(path.join(source, 'marker.txt'), 'post-action worked');
        for (const name of ['.npmignore', '.npmrc', 'README.md']) fs.writeFileSync(path.join(source, name), '');

        const result = run(['--input', source, '--output', output, '--debug', '--version', '2.0.0'], root);
        assert.equal(result.status, 0, result.stdout + result.stderr);
        const temp = path.join(source, '__TEMP__');
        assert.equal(fs.readFileSync(path.join(temp, 'marker.txt'), 'utf8'), 'post-action worked');
        assert.equal(JSON.parse(fs.readFileSync(path.join(temp, 'package.json'), 'utf8')).version, '2.0.0');
        assert.ok(fs.statSync(path.join(output, 'standalone-packer-test-2.0.0.tgz')).size > 0);
        if (process.getuid) {
            assert.equal(fs.statSync(temp).uid, process.getuid());
            assert.equal(fs.statSync(source).mode & 0o777, 0o755);
        }
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
});

test('packing errors return a nonzero status', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cmf invalid packer '));
    try {
        fs.writeFileSync(path.join(root, 'packConfig.json'), '{invalid json');
        const result = run(['-i', root], root);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, /JSON|Unexpected/);
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
});
