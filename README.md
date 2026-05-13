# FLF Website — Future Leaders Foundation

Application web full-stack pour la plateforme **Future Leaders Foundation / مؤسسة أطر الغد**.

Le projet contient un site public en arabe, un système d'inscription candidat, l'upload sécurisé de documents, une base de données MySQL/MariaDB, un système d'email, ainsi qu'un tableau de bord administrateur en arabe.

---

## 1. Stack technique

| Partie | Technologie |
|---|---|
| Frontend | React + TypeScript + Vite |
| UI | Tailwind CSS + Radix UI / composants custom |
| Routing | React Router |
| Backend | Hono + tRPC |
| Base de données | MySQL / MariaDB |
| ORM | Drizzle ORM |
| Auth candidat | Email + mot de passe + JWT cookie |
| Auth admin | Login interne admin + JWT cookie |
| Email | Nodemailer / SMTP |
| Uploads | Stockage privé local dans `storage/private/uploads` |
| Build production | Vite + esbuild |

---

## 2. Fonctionnalités principales

### Site public

- Page d'accueil en arabe.
- Présentation de l'organisation.
- Objectifs, activités et statistiques.
- Section des éditions précédentes : `الدورات السابقة`.
- Page détail pour chaque édition.
- Formulaire contact.
- Inscription newsletter.

### Candidats

- Inscription candidat avec :
  - prénom ;
  - nom ;
  - situation d'étude ;
  - téléphone ;
  - email ;
  - mot de passe ;
  - attestation ;
  - carte d'identité ;
  - choix ambassadeur ;
  - consentement newsletter.
- Login candidat.
- Confirmation email par token.
- Cookie candidat sécurisé.

### Administration

- Page login admin interne : `/admin/login`.
- Dashboard admin en arabe : `/admin`.
- Statistiques :
  - nombre de candidats ;
  - candidats acceptés ;
  - messages contact ;
  - éditions.
- Liste des candidats.
- Consultation sécurisée des documents privés.
- Acceptation / rejet / remise en attente des candidatures.
- Export CSV compatible Excel.
- Consultation messages contact.
- Consultation newsletter subscribers.

---

## 3. Corrections de sécurité intégrées

### 3.1 Uploads privés

Les documents sensibles ne sont plus stockés dans :

```txt
public/uploads
```

Ils sont désormais stockés dans :

```txt
storage/private/uploads
```

Les documents ne sont donc pas accessibles directement par URL publique.

Le serveur retourne une référence interne du type :

```txt
private://attestation-uuid.pdf
```

et non une URL publique.

### 3.2 Validation serveur des fichiers

Le backend vérifie :

- extension autorisée : PDF, JPG, JPEG, PNG ;
- MIME type autorisé ;
- taille maximale ;
- signature réelle du fichier avec magic bytes ;
- protection contre path traversal.

Types acceptés :

```txt
application/pdf
image/jpeg
image/png
```

### 3.3 Protection contre abus d'upload

Une protection backend peut être activée avec :

- limitation du nombre d'uploads par IP ;
- protection anti-spam ;
- logs sécurité dans `storage/logs/security.log` ;
- nettoyage des fichiers orphelins.

> Pour un seul VPS, la protection en mémoire est suffisante au démarrage. Pour plusieurs serveurs, utiliser Redis ou un service équivalent.

### 3.4 Cookies sécurisés

Les cookies d'authentification utilisent :

```txt
HttpOnly
SameSite=Lax
Max-Age
Secure en production HTTPS
```

En local, `Secure` n'est pas imposé afin de permettre le fonctionnement sur `http://localhost`.

### 3.5 Authentification admin interne

L'ancien flux `Sign in with Kimi` a été remplacé pour l'administration par un login interne :

```txt
/admin/login
```

L'admin se connecte avec email + mot de passe. Le mot de passe est hashé avec bcrypt avant stockage en base de données.

---

## 4. Installation locale

### Prérequis

Installer :

- Node.js 20 ou plus récent ;
- npm ;
- XAMPP ou MySQL/MariaDB ;
- Git.

### Installation des dépendances

Dans le dossier du projet :

```bash
npm install
```

### Créer le fichier `.env`

Copier le modèle :

```bash
cp .env.example .env
```

Sous Windows PowerShell :

```powershell
Copy-Item .env.example .env
```

Puis adapter les valeurs.

Exemple local avec XAMPP :

```env
NODE_ENV=development
APP_ID=local-dev
APP_SECRET=local-dev-secret-change-me
APP_URL=http://localhost:3000
PORT=3000

DATABASE_URL=mysql://root@localhost:3306/flf_website

KIMI_AUTH_URL=http://localhost:3000
KIMI_OPEN_URL=http://localhost:3000
VITE_KIMI_AUTH_URL=http://localhost:3000
VITE_APP_ID=local-dev
OWNER_UNION_ID=

SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

MAX_UPLOAD_SIZE_MB=5

ADMIN_EMAIL=admin@local.test
ADMIN_PASSWORD=Admin12345!
ADMIN_NAME=Admin Local
```

> Ne jamais commiter `.env` sur GitHub.

---

## 5. Base de données

### Créer la base

Avec XAMPP/phpMyAdmin :

1. Ouvrir `http://localhost/phpmyadmin`.
2. Créer une base nommée :

```txt
flf_website
```

3. Choisir de préférence :

```txt
utf8mb4_unicode_ci
```

ou, si indisponible :

```txt
utf8mb4_general_ci
```

### Synchroniser le schéma

```bash
npm run db:push
```

Si Drizzle propose de tronquer des tables contenant déjà des données importantes, choisir :

```txt
No, abort
```

Puis effectuer les migrations manuellement via phpMyAdmin si nécessaire.

### Seeder les 16 éditions précédentes

Pour remplir la section `الدورات السابقة`, exécuter :

```bash
npm run db:seed
```

ou directement :

```bash
npx tsx db/seed.ts
```

### Créer le compte admin local

```bash
npm run admin:create
```

ou directement :

```bash
npx tsx scripts/create-admin.ts
```

Puis se connecter sur :

```txt
http://localhost:3000/admin/login
```

avec les valeurs définies dans `.env` :

```txt
ADMIN_EMAIL
ADMIN_PASSWORD
```

---

## 6. Scripts utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | Lance le serveur local |
| `npm run build` | Build production |
| `npm run start` | Lance le build production |
| `npm run check` | Vérification TypeScript |
| `npm run lint` | Lint du projet |
| `npm run db:push` | Synchronise le schéma DB |
| `npm run db:seed` | Insère les éditions précédentes |
| `npm run admin:create` | Crée ou met à jour le premier admin |

Si les scripts `db:seed` ou `admin:create` ne sont pas encore présents dans `package.json`, ajouter :

```json
"db:seed": "tsx db/seed.ts",
"admin:create": "tsx scripts/create-admin.ts"
```

---

## 7. Structure du projet

```txt
app/
├── api/                    Backend Hono/tRPC
│   ├── admin-auth-router.ts
│   ├── admin-router.ts
│   ├── candidate-auth-router.ts
│   ├── upload-router.ts
│   ├── boot.ts
│   └── lib/
├── contracts/              Types/constantes partagés
├── db/                     Schéma Drizzle + seed
│   ├── schema.ts
│   └── seed.ts
├── scripts/                Scripts utilitaires
│   └── create-admin.ts
├── src/                    Frontend React
│   ├── pages/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminLogin.tsx
│   │   └── ...
│   └── ...
├── storage/
│   └── private/uploads/    Uploads privés non publics
├── public/                 Assets publics uniquement
├── .env.example            Modèle de configuration
├── .gitignore
├── package.json
└── vite.config.ts
```

---

## 8. Sécurité et fichiers à ne pas partager

Ne jamais pousser sur GitHub :

```txt
.env
node_modules/
public/uploads/
storage/private/uploads/*
storage/logs/
dist/
build/
.vite/
```

Garder seulement :

```txt
.env.example
storage/private/uploads/.gitkeep
```

Exemple `.gitignore` recommandé :

```gitignore
node_modules/
.env
.env.local
.env.*.local

dist/
dist-ssr/
build/
.vite/

public/uploads/
storage/logs/
storage/private/uploads/*
!storage/private/uploads/.gitkeep

*.log
*.tsbuildinfo
coverage/
.DS_Store
Thumbs.db
.vscode/*
!.vscode/extensions.json
.idea/
```

---

## 9. Déploiement recommandé

Pour production, l'architecture recommandée est :

```txt
Domaine OVH
↓
Cloudflare Free
↓
VPS OVHcloud VPS-2
↓
Nginx + HTTPS Let's Encrypt
↓
Application Node.js
↓
MySQL/MariaDB
↓
Stockage privé des documents
```

### Offre recommandée

Pour un site administratif pouvant recevoir plusieurs centaines d'utilisateurs simultanés :

```txt
OVHcloud VPS-2
```

VPS-1 peut suffire pour un lancement limité, mais VPS-2 donne plus de marge pour les uploads, MySQL et les pics d'inscription.

---

## 10. Variables production importantes

En production, utiliser des valeurs fortes :

```env
NODE_ENV=production
APP_SECRET=une_longue_cle_secrete_tres_forte
APP_URL=https://ton-domaine.com
DATABASE_URL=mysql://user:password@localhost:3306/flf_website

SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_USER=contact@ton-domaine.com
SMTP_PASS=mot_de_passe_email
SMTP_FROM=contact@ton-domaine.com

MAX_UPLOAD_SIZE_MB=5
```

Ne pas utiliser :

```env
LOCAL_ADMIN=true
```

En production, l'accès admin doit passer par :

```txt
/admin/login
```

---

## 11. Tests recommandés avant mise en ligne

Tester obligatoirement :

- page d'accueil ;
- `الدورات السابقة` ;
- détail de chaque édition ;
- inscription candidat ;
- upload PDF valide ;
- upload JPG/PNG valide ;
- rejet fichier > 5 Mo ;
- rejet faux PDF renommé ;
- confirmation email ;
- login candidat ;
- login admin ;
- accès `/admin` sans connexion ;
- accès documents privés sans admin ;
- export CSV ;
- formulaire contact ;
- newsletter.

---

## 12. Notes importantes

- Les documents sensibles ne doivent jamais être stockés dans `public/uploads`.
- Les routes admin doivent toujours être protégées côté backend, pas seulement côté frontend.
- Les secrets doivent rester dans `.env`, jamais dans GitHub.
- Les 16 éditions précédentes ne s'affichent que si `db/seed.ts` a été exécuté.
- Pour plusieurs serveurs en production, remplacer le rate limit en mémoire par Redis.
