## What it's for

Writing the same e-mail 40 times, changing only the first name, is slow and error-prone. Mail merge generates a **draft per contact** from a template and a CSV. Nothing is sent: you proofread, then send yourself, from your own mail client.

## Before you start

- A text template with variables in double braces: `{{prenom}}`, `{{entreprise}}`, or `{{prenom|dear client}}` (default value if the column is empty).
- A CSV of contacts whose columns carry the same names, plus `email`.
- Your recipients' consent: follow the rules on direct marketing.

## Step by step

1. The first line `Objet : …` of the template is used as the subject. Preview the first draft:
   ```bash
   node src/email-merge.mjs samples/modele.txt samples/contacts.csv
   ```
2. Generate every draft into a folder:
   ```bash
   node src/email-merge.mjs samples/modele.txt samples/contacts.csv --out drafts/
   ```
3. Open the files flagged with `!` and fill in what is missing.

## Reading the output

One `.txt` file per contact, with a `À :` line. The script stops with an error if the template asks for a column missing from the CSV, and reports (exit code 2) contacts for whom a value is missing.

## Automating it

Prepare drafts in the morning, proofread, send in moderate batches.

## Pitfalls

- Always proofread the first draft: a misspelled variable shows immediately.
- Do not publish your contacts file: it is personal data.
