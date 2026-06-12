# 🏃 FitTrack — Guide complet (Compréhension + Architecture A→Z)

> Ce document **n'est pas la solution**. C'est une carte pour comprendre *ce qu'on te demande*, l'**architecture** du projet, et l'**ordre exact** pour le construire. Les squelettes de code sont des **plans à compléter** (avec des `// TODO`), jamais le code fini. C'est toi qui écris la logique — c'est ça l'exercice.

---

## 1. Le projet en une phrase

Tu construis une app mobile (React Native + Expo) qui transforme le téléphone en **coach sportif**, en lisant **directement les capteurs** : podomètre (pas), GPS (distance), caméra (photo). Tout vient du téléphone — **aucune API web, aucun Axios**.

---

## 2. La grande idée : Device APIs ≠ Web APIs

| Avant (Web API) | Maintenant (Device API) |
|---|---|
| Tu demandes à un **serveur** (`fetch`) | Tu demandes au **téléphone** |
| Une requête → une réponse | Un **abonnement** → flux continu de mesures |
| Pas de permission | L'utilisateur doit **autoriser** |

Comprends « flux continu » + « permissions » → tu as compris 70 % du projet.

---

# PARTIE A — L'ARCHITECTURE 🏛️

C'est la partie que tu m'as demandé d'ajouter. Lis-la lentement : si tu comprends l'architecture, le code devient évident.

## 3. La règle d'or de l'architecture : le sens UNIQUE des données

Le principe le plus important. Les données vont **toujours dans le même sens** :

```
┌────────────┐    ┌─────────────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│  CAPTEUR   │ →  │  HOOK               │ →  │  STORE       │ →  │  ÉCRAN      │ →  │  ANIMATION   │
│  natif     │    │  (abonnement +      │    │  Zustand     │    │  (lit le    │    │  Reanimated  │
│ (pas, GPS) │    │   cleanup)          │    │  (état)      │    │   store)    │    │              │
└────────────┘    └─────────────────────┘    └──────┬───────┘    └─────────────┘    └──────────────┘
                                                     │
                                                     ↓
                                            ┌──────────────────┐
                                            │  AsyncStorage    │
                                            │  (persistance)   │
                                            └──────────────────┘
```

**À retenir :** un **écran ne parle JAMAIS directement à un capteur**. L'écran lit le store. Le store est rempli par un hook. Le hook parle au capteur. Ce découplage = note de structure dans l'évaluation.

Pourquoi ? Parce que :
- L'écran reste **simple** (il affiche, c'est tout).
- La logique compliquée (abonnement, cleanup, calculs) est **isolée** dans les hooks → réutilisable, testable.
- Le store est la **source de vérité unique** : tous les écrans voient les mêmes données.

## 4. L'arborescence complète des fichiers

```
fittrack/
├── app/                          → ÉCRANS (Expo Router : 1 fichier = 1 page)
│   ├── _layout.tsx               → layout racine (charge AsyncStorage au démarrage)
│   └── (tabs)/
│       ├── _layout.tsx           → la barre d'onglets en bas
│       ├── index.tsx             → ÉCRAN 1 : Tableau de bord
│       ├── session.tsx           → ÉCRAN 2 : Session en cours
│       └── history.tsx           → ÉCRAN 3 : Historique & Profil
│
├── components/                   → MORCEAUX D'UI réutilisables (bêtes, sans logique)
│   ├── ProgressRing.tsx          → anneau SVG animé
│   ├── AnimatedNumber.tsx        → compteur de chiffres qui s'incrémente
│   ├── ControlButton.tsx         → bouton Start/Pause/Stop (anim + haptics)
│   ├── StatCard.tsx              → petite carte (pas / distance / calories)
│   └── SessionCard.tsx           → carte d'une session dans la liste
│
├── store/                        → ÉTAT GLOBAL (le cerveau)
│   └── useFitStore.ts            → store Zustand + persistance
│
├── hooks/                        → LOGIQUE des capteurs (abonnements + cleanup)
│   ├── usePedometer.ts           → podomètre
│   ├── useLocationTracker.ts     → GPS + distance
│   └── usePermissions.ts         → (optionnel) regroupe la gestion des permissions
│
├── utils/                        → FONCTIONS PURES (calculs, sans état)
│   ├── haversine.ts              → distance entre 2 points GPS
│   ├── calories.ts               → estimation calories
│   └── format.ts                 → mise en forme (durée mm:ss, vitesse km/h)
│
├── constants/
│   └── theme.ts                  → couleurs, espacements, tailles (palette cohérente)
│
├── app.json                      → config + déclaration des permissions
└── package.json
```

## 5. Qui fait quoi (responsabilité de chaque dossier)

- **`/app`** — Les écrans. **Rôle : afficher et brancher.** Un écran lit le store, appelle un hook, et passe les données aux composants. **Il ne contient pas de calcul compliqué.**
- **`/components`** — De l'UI « bête » et réutilisable. Un composant reçoit des **props** et affiche. Exemple : `ProgressRing` reçoit `progress={0.6}` et dessine l'anneau. Il ne sait pas d'où vient le 0.6.
- **`/store`** — La source de vérité. Contient les **données** (pas, sessions, objectif, profil) et les **actions** pour les modifier. C'est ici que vit la persistance AsyncStorage.
- **`/hooks`** — La logique des capteurs. **C'est ici que vit le `useEffect` + cleanup.** Un hook s'abonne au capteur et écrit le résultat dans le store.
- **`/utils`** — Des fonctions pures (mêmes entrées → mêmes sorties, aucun état). Haversine, calories, formatage. Faciles à tester.
- **`/constants`** — Le thème. Évite de réécrire `#FF5733` partout : tu centralises les couleurs.

## 6. Le flux de données, écran par écran

**Écran 1 (Dashboard) :**
```
usePedometer() s'abonne → écrit steps dans le store
   → l'écran lit steps depuis le store
      → <ProgressRing progress={steps/goal}/>  (Reanimated anime)
      → <AnimatedNumber value={steps}/>
      → <StatCard> distance & calories (calculées via /utils)
```

**Écran 2 (Session) :**
```
useLocationTracker() s'abonne au GPS → à chaque point : haversine(ancien, nouveau)
   → ajoute la distance au total dans le store (session en cours)
      → l'écran affiche distance / durée / vitesse
      → <ControlButton> Start/Pause/Stop → déclenche haptics + actions du store
```

**Écran 3 (Historique) :**
```
au démarrage : le store a déjà rechargé l'historique depuis AsyncStorage
   → FlatList lit sessions[] du store → <SessionCard> pour chacune (anim d'apparition)
   → photo de profil : caméra → on stocke l'URI dans le store → persistée
   → supprimer une session : action du store → réécrit AsyncStorage
```

## 7. Le blueprint du STORE (squelette à compléter)

Voici la **forme** de ton store Zustand — pas l'implémentation. Remplis les `// TODO`.

```
useFitStore = créer un store avec :

  ÉTAT (les données) :
    steps          : number        // pas du jour
    dailyGoal      : number        // objectif (ex: 10000)
    profilePhoto   : string | null // URI de la photo
    sessions       : Session[]     // historique
    currentSession : Session | null// session en cours

  ACTIONS (les fonctions qui modifient l'état) :
    setSteps(n)            // appelée par usePedometer
    setGoal(n)
    startSession()         // crée une currentSession vide
    updateSession(data)    // met à jour distance/durée en direct
    stopSession()          // pousse currentSession dans sessions[]
    deleteSession(id)
    setProfilePhoto(uri)

  + PERSISTANCE :
    envelopper le store avec le middleware "persist" + AsyncStorage
    → sessions, profilePhoto et dailyGoal survivent à la fermeture
    → (pas besoin de persister "steps" du jour ni "currentSession")
```

> Une « Session » = un objet du style `{ id, date, distance, duration, steps, avgSpeed }`.

## 8. Le blueprint d'un HOOK capteur (squelette à compléter)

C'est **ici** que vit le concept clé (abonnement + cleanup). Forme générale :

```
usePedometer():
  useEffect(() => {
     // 1. vérifier que le capteur est disponible (sinon → état "indisponible")
     // 2. vérifier / demander la permission
     // 3. s'abonner :  const sub = Pedometer.watchStepCount(result => {
     //                      setSteps(result.steps)  // ← écrit dans le store
     //                  })
     return () => {
       // 4. CLEANUP : sub.remove()   ← OBLIGATOIRE
     }
  }, [])
```

Le même schéma sert pour `useLocationTracker` avec `Location.watchPositionAsync` (qui renvoie aussi un objet abonnement à `.remove()`).

---

# PARTIE B — CONSTRUIRE DE A À Z 🔨

Maintenant l'ordre exact. **Une brique à la fois.** Ne saute pas d'étape, et valide chaque étape avant la suivante.

## ÉTAPE A — Créer le projet
- `npx create-expo-app@latest fittrack` (template TypeScript).
- Installe les libs : Reanimated, Gesture Handler, Zustand, AsyncStorage, expo-sensors, expo-location, expo-camera (ou image-picker), expo-haptics, react-native-svg, lucide-react-native.
- **Vérifier :** l'app de base démarre sur ton **vrai téléphone** via Expo Go.

## ÉTAPE B — Poser la structure de dossiers
- Crée les dossiers vides : `/components /store /hooks /utils /constants`.
- Crée les 3 écrans vides dans `/app/(tabs)/` + le `_layout` des onglets.
- **Vérifier :** tu peux naviguer entre 3 écrans vides.

## ÉTAPE C — Le premier capteur (podomètre) en console
- Crée `hooks/usePedometer.ts` avec le squelette (section 8).
- Pour l'instant : juste un `console.log` des pas (pas encore de store).
- **Mets le cleanup tout de suite** (bonne habitude).
- **Vérifier :** tes vrais pas s'affichent dans la console quand tu marches. ✅ = Jour 1 fini.

## ÉTAPE D — Le store Zustand
- Crée `store/useFitStore.ts` avec l'état + `setSteps` (section 7).
- Branche `usePedometer` pour qu'il appelle `setSteps` au lieu de `console.log`.
- **Vérifier :** l'écran 1 affiche le nombre de pas lu depuis le store.

## ÉTAPE E — L'anneau animé + compteur (Reanimated)
- Crée `components/ProgressRing.tsx` (SVG + `useSharedValue` + `useAnimatedProps`).
- Crée `components/AnimatedNumber.tsx`.
- L'écran 1 passe `progress = steps / dailyGoal` à l'anneau.
- Ajoute `utils/calories.ts` et l'estimation distance pour les `StatCard`.
- Gère le cas « capteur indisponible ».
- **Vérifier :** l'anneau se remplit quand tu marches. ✅ = Jour 2 fini.

## ÉTAPE F — Le GPS et la distance
- Crée `utils/haversine.ts` (distance entre 2 points).
- Crée `hooks/useLocationTracker.ts` : permission → `watchPositionAsync` → à chaque point, additionne `haversine(ancien, nouveau)`.
- **Vérifier :** la distance augmente quand tu te déplaces dehors.

## ÉTAPE G — L'écran Session (chrono + boutons + haptics)
- Écran 2 : affiche distance / durée / vitesse depuis la `currentSession` du store.
- Chronomètre (un `setInterval` qui incrémente la durée, nettoyé dans le cleanup).
- `components/ControlButton.tsx` : Start/Pause/Stop, animation scale + couleur, `Haptics.impactAsync` au clic.
- **Vérifier :** tu démarres une session, le chrono tourne, le GPS suit, ça vibre. ✅ = Jour 3 fini.

## ÉTAPE H — Persistance (AsyncStorage)
- Ajoute le middleware `persist` au store (sessions, goal, photo).
- À l'arrêt d'une session : `stopSession()` la pousse dans `sessions[]`.
- **Vérifier :** tu fermes l'app, tu la rouvres → l'historique est toujours là.

## ÉTAPE I — Historique + caméra
- Écran 3 : FlatList de `sessions[]` → `components/SessionCard.tsx` avec animation d'apparition (Reanimated entering).
- Photo de profil : caméra → stocke l'URI → persistée.
- Action « supprimer une session ».
- **Vérifier :** liste, photo, suppression fonctionnent. ✅ = Jour 4 fini.

## ÉTAPE J — Design, robustesse & livraison
- `constants/theme.ts` : palette + espacements cohérents, icônes lucide.
- Gère **tous** les refus de permission (message + bouton réglages).
- Teste : permission refusée, pas de GPS, session vide.
- Vérifie que **tous** les abonnements s'arrêtent (cleanup).
- Screenshots + vidéo démo 60 s + doc + README + 5 questions de réflexion. ✅ = Jour 5 fini.

---

# PARTIE C — COMPRENDRE LES POINTS DÉLICATS 🧠

## 9. ⭐ Abonnement + cleanup (le concept noté n°1)

Un capteur ne marche pas « une fois » : tu **t'abonnes** (« préviens-moi quand ça change ») et il envoie en continu. Si tu n'arrêtes jamais l'abonnement quand l'écran disparaît → **batterie qui chauffe, doublons, fuite mémoire**.

```
useEffect = "quand l'écran apparaît"
   ↳ je m'abonne                       (start)
   ↳ return () => { je me désabonne }  (cleanup, au démontage)
```
`useEffect` peut **retourner une fonction** : elle s'exécute quand l'écran est démonté. C'est là que tu fais `.remove()`.

## 10. Les permissions (cycle pour chaque capteur sensible)

1. **Vérifier** l'état actuel. 2. **Demander** si besoin (popup système). 3. **Réagir** :
- ✅ accordée → on utilise ; ❌ refusée → message clair + bouton réglages ; ⏳ chargement → spinner.

Expo fournit des hooks `use…Permissions()`. Le brief **note explicitement** le cas « refus ».

## 11. La formule de Haversine

Le GPS donne des coordonnées (lat, long). Haversine transforme **2 points → une distance en mètres** (sur la sphère terrestre). Tu **comprends ce qu'elle fait**, tu n'as pas à réinventer la trigonométrie. Tu additionnes les petits segments → distance totale.

## 12. L'anneau SVG animé

Un cercle SVG a `strokeDashoffset` qui contrôle « quelle portion du trait est dessinée ». Le faire varier de « vide » à « plein » = anneau qui se remplit. Reanimated anime cette valeur selon `steps / goal`. `useSharedValue` = valeur animée hors React (fluide) ; `useAnimatedProps` = la relie à la prop SVG.

## 13. Pièges classiques

1. **Émulateur** → capteurs morts. Utilise un **vrai téléphone**.
2. **Cleanup oublié** → fuites. Toujours le `return`.
3. **Refus de permission ignoré** → écran blanc. Prévois le message.
4. **Animer avec setState** → saccades. Utilise `useSharedValue`.
5. **Pas de persistance** → historique perdu. Lecture au démarrage, écriture à chaque changement.
6. `{count && <Text/>}` → affiche un « 0 » fantôme. Écris `{count > 0 && ...}`.
7. **Tout re-render** → utilise des **sélecteurs** Zustand (ne lis que ce dont l'écran a besoin).

---

# PARTIE D — LIVRER & SOUTENIR 🎤

## 14. Checklist des livrables
- [ ] Podomètre temps réel — [ ] GPS + distance — [ ] Caméra/photo — [ ] Permissions (demande **+ refus**)
- [ ] Anneau animé lié aux vraies données — [ ] Chiffres animés — [ ] Haptics — [ ] Persistance AsyncStorage
- [ ] Zustand (temps réel + abonnements) — [ ] `useEffect` cleanup correct
- [ ] Structure `/app /components /store /hooks` (+ `/utils /constants`)
- [ ] Design cohérent — [ ] **Lien GitHub** code commenté — [ ] Doc technique (permissions + **pourquoi**)
- [ ] README — [ ] **5 questions de réflexion** — [ ] **Vidéo démo 60 s** — [ ] Planif Jira

## 15. Questions probables en soutenance (prépare tes réponses)
- Pourquoi un capteur a besoin d'un **cleanup** ?
- Différence **Web API** vs **Device API** ?
- Pourquoi **Zustand** plutôt que passer les props écran par écran ?
- Pourquoi **Reanimated** plutôt qu'une animation classique ?
- Que fait ton app si l'utilisateur **refuse** une permission ?
- Pourquoi **AsyncStorage** et pas juste l'état React ?
- Comment tu calcules la **distance** depuis le GPS ?

## 16. Par où commencer MAINTENANT
1. Étape A (créer + installer) → 2. Étape C (podomètre en console, avec cleanup) → 3. quand les pas s'affichent sur ton vrai téléphone, tu es lancé. **Une brique validée avant la suivante.**

---

### Et après ?
Quand tu bloques sur une partie précise (« mon cleanup », « relier le store à l'anneau », « le GPS renvoie rien », « comment écrire le hook »…), reviens avec **la question exacte** : je t'explique le raisonnement pas à pas, toujours pour que **tu** écrives le code. 💪
