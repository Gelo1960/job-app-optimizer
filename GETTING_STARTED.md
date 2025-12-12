# 🚀 Guide de Démarrage Rapide

Ce guide te permettra de lancer le système en **15 minutes**.

---

## ✅ Checklist Rapide

- [ ] Node.js 18+ installé
- [ ] Compte Supabase créé
- [ ] Clé API Claude obtenue
- [ ] Variables d'environnement configurées
- [ ] Base de données initialisée
- [ ] Application lancée

---

## 📝 Étape 1 : Installation (2 min)

```bash
# Cloner le repo (si pas déjà fait)
cd job-app-optimizer

# Installer les dépendances
npm install
```

---

## 🔑 Étape 2 : Configuration Supabase (5 min)

### 2.1 Créer le projet

1. Va sur [supabase.com](https://supabase.com)
2. Clique sur "New Project"
3. Choisis :
   - **Nom** : job-optimizer (ou autre)
   - **Database Password** : Génère un mot de passe fort
   - **Region** : Europe West (ou proche de toi)
4. Attends ~2 minutes que le projet se crée

### 2.2 Initialiser la base de données

1. Dans ton projet Supabase, va dans **SQL Editor** (menu gauche)
2. Clique sur "New Query"
3. Ouvre le fichier `lib/db/schema.sql` de ce projet
4. **Copie TOUT le contenu** et colle-le dans l'éditeur SQL
5. Clique sur **Run** (ou CMD+Enter)
6. Vérifie qu'il n'y a pas d'erreurs (devrait afficher "Success")

### 2.3 Récupérer les clés API

1. Va dans **Settings** > **API** (menu gauche)
2. Tu verras :
   - **Project URL** : `https://xxx.supabase.co`
   - **anon public** : `eyJhbG...` (clé publique)
   - **service_role** : `eyJhbG...` (clé secrète - scroll down)
3. **Copie ces 3 valeurs** pour l'étape suivante

---

## 🤖 Étape 3 : Configuration Claude (2 min)

### 3.1 Obtenir une clé API

1. Va sur [console.anthropic.com](https://console.anthropic.com)
2. Crée un compte (ou connecte-toi)
3. Va dans **API Keys**
4. Clique sur "Create Key"
5. Nomme-la "job-optimizer" et copie la clé `sk-ant-...`

**💡 Coût :** ~0,15€ par CV généré (modèle Sonnet). Budget 20€ = ~130 CVs.

---

## 🔧 Étape 4 : Variables d'environnement (3 min)

```bash
# Copier le template
cp .env.example .env.local

# Éditer le fichier
nano .env.local
# (ou ouvre avec ton éditeur préféré)
```

**Remplis ces valeurs :**

```env
# SUPABASE (copiées de l'étape 2.3)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# CLAUDE API (copiée de l'étape 3.1)
ANTHROPIC_API_KEY=sk-ant-...

# Les autres sont optionnels pour le MVP
```

**Sauvegarde** le fichier (CMD+S ou CTRL+S).

---

## 🎉 Étape 5 : Lancer l'application (1 min)

```bash
npm run dev
```

**Ouvre** [http://localhost:3000](http://localhost:3000)

Tu devrais voir la page d'accueil Next.js par défaut (on va créer l'UI ensuite).

---

## 🧪 Étape 6 : Tester l'API (2 min)

### Test 1 : Analyse d'offre

Ouvre un nouveau terminal et teste l'API :

```bash
curl -X POST http://localhost:3000/api/analyze-job \
  -H "Content-Type: application/json" \
  -d '{
    "jobText": "Nous recherchons un Développeur Full-Stack React Native expérimenté pour rejoindre notre startup en hyper-croissance. Vous développerez des applications mobiles innovantes avec TypeScript, Redux et Firebase. Minimum 3 ans d'\''expérience requis. Stack : React Native, TypeScript, Node.js, PostgreSQL. Environnement agile, remote possible."
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "keywords": {
      "technical": ["React Native", "TypeScript", "Redux", "Firebase", "Node.js", "PostgreSQL"],
      "business": ["agile"],
      ...
    },
    "formalityScore": 5,
    "seniorityLevel": "mid",
    "companyType": "startup",
    ...
  }
}
```

**✅ Si ça fonctionne** : Félicitations, ton backend est opérationnel !

**❌ Si erreur** : Vérifie :
- Que le serveur `npm run dev` tourne
- Que ta clé `ANTHROPIC_API_KEY` est correcte dans `.env.local`
- Que le texte fait plus de 100 caractères

---

## 🎨 Prochaines Étapes

Maintenant que le backend fonctionne, tu peux :

1. **Créer ton profil utilisateur** (via l'interface - à développer)
2. **Tester la génération de CV** avec une vraie offre
3. **Personnaliser les prompts** Claude dans `lib/prompts/`
4. **Développer l'UI** avec les composants dans `components/`

---

## 🐛 Troubleshooting

### Erreur : "Missing Supabase environment variables"

→ Vérifie que `.env.local` existe et contient les 3 clés Supabase.

### Erreur : "Failed to analyze job"

→ Vérifie ta clé Claude API :
```bash
# Teste directement
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4-20250514",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Erreur : "relation 'job_analyses' does not exist"

→ Le schéma SQL n'a pas été exécuté dans Supabase. Retourne à l'étape 2.2.

### Port 3000 déjà utilisé

```bash
# Utilise un autre port
PORT=3001 npm run dev
```

---

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Claude API](https://docs.anthropic.com/)
- [README complet du projet](./README.md)

---

## 💬 Besoin d'aide ?

- Lis le [README.md](./README.md) pour plus de détails
- Vérifie les types dans `lib/types/index.ts`
- Regarde les exemples de prompts dans `lib/prompts/`

---

**Prêt à optimiser tes candidatures ! 🚀**
