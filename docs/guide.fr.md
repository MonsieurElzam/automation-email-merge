## À quoi ça sert

Écrire 40 fois le même e-mail en changeant le prénom, c'est long et on se trompe. Le publipostage génère un **brouillon par contact** à partir d'un modèle et d'un CSV. Rien n'est envoyé : vous relisez, puis vous envoyez vous-même, avec votre messagerie.

## Avant de commencer

- Un modèle texte avec des variables entre doubles accolades : `{{prenom}}`, `{{entreprise}}`, ou `{{prenom|cher client}}` (valeur par défaut si la colonne est vide).
- Un CSV de contacts dont les colonnes portent les mêmes noms, plus `email`.
- Le consentement de vos destinataires : respectez la réglementation sur la prospection.

## Pas à pas

1. La première ligne `Objet : …` du modèle sert d'objet. Prévisualisez le premier brouillon :
   ```bash
   node src/email-merge.mjs samples/modele.txt samples/contacts.csv
   ```
2. Générez tous les brouillons dans un dossier :
   ```bash
   node src/email-merge.mjs samples/modele.txt samples/contacts.csv --out brouillons/
   ```
3. Ouvrez les fichiers signalés (`!`) et complétez ce qui manque.

## Lire le résultat

Un fichier `.txt` par contact, avec une ligne `À :`. Le script s'arrête avec une erreur si le modèle réclame une colonne absente du CSV, et signale (code 2) les contacts pour lesquels une valeur manque.

## L'automatiser

Préparez les brouillons le matin, relisez, envoyez par lots modérés.

## Pièges à éviter

- Relisez toujours le premier brouillon : une variable mal orthographiée se voit tout de suite.
- Ne publiez pas votre fichier de contacts : ce sont des données personnelles.
