import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsv, toDate } from '../lib/csv.mjs'

const sample = (n) => readFileSync(new URL(`../samples/${n}`, import.meta.url), 'utf8')
const mod = (n) => import(`../src/${n}.mjs`)
const run = (n, args = []) => spawnSync(process.execPath, [fileURLToPath(new URL(`../src/${n}.mjs`, import.meta.url)), ...args], { encoding: 'utf8' })
const samplePath = (n) => fileURLToPath(new URL(`../samples/${n}`, import.meta.url))

test('32 publipostage : valeur par défaut, variable manquante, noms de fichiers', async () => {
  const { placeholders, merge, mergeAll } = await mod('email-merge')
  assert.deepEqual(placeholders('{{a}} {{b|défaut}}').map((p) => p.name), ['a', 'b'])
  assert.deepEqual(merge('Bonjour {{p|cher client}} de {{e}}', { p: '', e: 'ACME' }), { text: 'Bonjour cher client de ACME', missing: [] })
  assert.deepEqual(merge('{{x}} {{x}}', {}).missing, ['x'])
  const all = mergeAll(sample('modele.txt'), parseCsv(sample('contacts.csv')).records)
  assert.equal(all.length, 3); assert.match(all[1].text, /Bonjour cher client/); assert.deepEqual(all.map((r) => r.missing), [[], [], ['entreprise']]); assert.equal(all[0].id, 'awa-exemple-test')
  const out = mkdtempSync(join(tmpdir(), 'mail-')); const r = run('email-merge', [samplePath('modele.txt'), samplePath('contacts.csv'), '--out', out])
  assert.equal(r.status, 2); assert.ok(existsSync(join(out, 'awa-exemple-test.txt'))); assert.match(readFileSync(join(out, 'awa-exemple-test.txt'), 'utf8'), /^À : awa@exemple.test/)
  assert.equal(run('email-merge', [samplePath('modele.txt'), samplePath('prospects.csv')]).status, 1)
})
