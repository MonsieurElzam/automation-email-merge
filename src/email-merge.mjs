#!/usr/bin/env node
/* Publipostage : un modèle de message + un CSV de contacts = un brouillon par personne. N'envoie rien. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { parseCsv } from '../lib/csv.mjs'
import { isMain, parseArgs, usage, fail } from '../lib/cli.mjs'

/** Variables : {{prenom}} ou {{prenom|cher client}} (valeur par défaut si la colonne est vide). */
export function placeholders(template) {
  return [...template.matchAll(/\{\{\s*([\w.-]+)\s*(?:\|([^}]*))?\}\}/g)].map((m) => ({ name: m[1], fallback: m[2] }))
}

export function merge(template, record) {
  const missing = []
  const text = template.replace(/\{\{\s*([\w.-]+)\s*(?:\|([^}]*))?\}\}/g, (_, name, fallback) => {
    const v = record[name]
    if (v !== undefined && String(v).trim() !== '') return String(v).trim()
    if (fallback !== undefined) return fallback.trim()
    missing.push(name)
    return `{{${name}}}`
  })
  return { text, missing: [...new Set(missing)] }
}

const slug = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'contact'

export function mergeAll(template, records) {
  const used = placeholders(template).map((p) => p.name)
  return records.map((r, i) => ({ id: slug(r.email || r.name || `ligne-${i + 1}`), email: r.email ?? '', ...merge(template, r), used }))
}

if (isMain(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2), ['help'])
  usage(`
Usage : node src/email-merge.mjs modele.txt contacts.csv [--out brouillons/]
Dans le modèle : {{prenom}}, {{entreprise}}, {{prenom|cher client}} (valeur par défaut). La première ligne « Objet : … » devient l'objet.
Sans --out, affiche le premier brouillon pour vérification. Les contacts à variable manquante sont signalés (code de sortie 2).`, args, 2)
  let results, headers
  try {
    const csv = parseCsv(readFileSync(args._[1], 'utf8'))
    headers = csv.headers
    const template = readFileSync(args._[0], 'utf8')
    const unknown = [...new Set(placeholders(template).map((p) => p.name))].filter((n) => !headers.includes(n))
    if (unknown.length) fail(`colonne(s) absente(s) du CSV : ${unknown.join(', ')}`)
    results = mergeAll(template, csv.records)
  } catch (e) { fail(e.message) }
  if (args.out) {
    mkdirSync(args.out, { recursive: true })
    const seen = new Map()
    for (const r of results) { const n = seen.get(r.id) ?? 0; seen.set(r.id, n + 1); writeFileSync(join(args.out, `${r.id}${n ? `-${n + 1}` : ''}.txt`), `${r.email ? `À : ${r.email}\n` : ''}${r.text}`) }
    console.log(`${results.length} brouillon(s) écrit(s) dans ${args.out}`)
  } else console.log(`--- brouillon 1/${results.length} ---\n${results[0]?.email ? `À : ${results[0].email}\n` : ''}${results[0]?.text ?? ''}`)
  const incomplete = results.filter((r) => r.missing.length)
  incomplete.forEach((r) => console.log(`! ${r.id} : valeur manquante pour ${r.missing.join(', ')}`))
  process.exit(incomplete.length ? 2 : 0)
}
