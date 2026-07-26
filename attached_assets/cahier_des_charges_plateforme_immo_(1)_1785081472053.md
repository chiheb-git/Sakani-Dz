# CAHIER DES CHARGES – PLATEFORME DE LOCATION IMMOBILIÈRE & TOURISME
### (Application mobile Client + Portail Vendeur + Back-office Admin)

---

## 1. PRÉSENTATION GÉNÉRALE DU PROJET

Créer une plateforme mobile complète, professionnelle et prête pour publication sur le **Play Store**, permettant :

- Aux **clients** de rechercher et consulter des appartements, villas et sites (ensembles de plusieurs logements) en location, ainsi que des lieux touristiques par wilaya.
- Aux **vendeurs** (propriétaires/agences) de publier leurs biens moyennant un abonnement mensuel.
- À l'**administrateur** de valider les vendeurs, gérer les abonnements, superviser la plateforme et consulter les statistiques.

Le design doit être **ultra professionnel**, moderne, fluide, avec des **animations 3D dynamiques**, des transitions soignées et une identité visuelle cohérente (logo animé, micro-interactions, effets de profondeur). L'application doit être **100% fonctionnelle, sans bug**, prête pour un déploiement en production.

---

## 2. ARCHITECTURE TECHNIQUE DE RÉFÉRENCE

```
📱 React Native (TypeScript) — Clean Architecture (Presentation / Domain / Data)
        │
        ▼
   Base locale SQLite ──► Service de synchronisation ──► Axios (HTTPS)
        │
        ▼
   API Backend (Clean Architecture + DDD)
        │
   ┌────────────┬────────────────┬───────────────┐
   ▼            ▼                ▼
Authentification   Logique métier   Stockage fichiers
        │
        ▼
PostgreSQL (Neon)
```

### Stack proposée
| Couche | Technologie |
|---|---|
| Mobile | React Native + TypeScript, React Navigation, Redux Toolkit + RTK Query, Zod, React Hook Form |
| Internationalisation | i18next / react-i18next (support RTL/LTR, 3 langues : arabe, français, anglais) |
| Base locale | SQLite (cache offline, synchronisation) |
| Stockage sécurisé | React Native Keychain / AsyncStorage |
| Notifications | Firebase Cloud Messaging |
| Backend | API REST (Node.js/Express ou ASP.NET Core selon préférence) en Clean Architecture + DDD, CQRS, Repository Pattern |
| Base de données | PostgreSQL (Neon/Supabase) |
| Fichiers médias | Cloudflare R2 / Firebase Storage / Amazon S3 |
| Sécurité | JWT + Refresh Token, bcrypt, HTTPS, Rate Limiting, CORS |
| Déploiement | Render / Railway pour l'API, Neon pour la base |
| CI/CD | GitHub Actions |
| Tests | Jest (mobile), tests d'intégration API |

> Le choix du framework backend (Node.js/Express ou ASP.NET Core) est laissé libre à l'implémentation ; l'important est le respect strict de la Clean Architecture, de la séparation des responsabilités et de la sécurité des échanges.

---

## 3. MODULE CLIENT (Application mobile)

### 3.1 Dashboard principal
- À l'ouverture, affichage d'une **liste d'appartements par défaut**, mise en avant (featured), qui **se renouvelle automatiquement** à chaque fermeture/réouverture de l'application (rotation aléatoire ou algorithme de mise en avant).
- Navigation par onglets clairs : **Appartements / Villas / Sites / Tourisme / Historique / Profil**.

### 3.2 Fiche détail d'un bien (appartement / villa / site)
Chaque fiche doit afficher :
- Numéro de téléphone du vendeur
- Type de bien (F2, F3, F4, F5…)
- Description complète (équipements : table, machine à laver, climatisation, etc.)
- Localisation **GPS exacte** sur carte interactive
- Bouton d'appel direct et bouton **WhatsApp** vers le vendeur
- Galerie photos
- Prix de location

### 3.3 Navigation par type de bien
- **Villas** → liste des maisons/villas disponibles
- **Appartements** → liste des appartements
- **Sites** → un site regroupe plusieurs appartements/logements ; en cliquant sur un site, la liste des logements qu'il contient s'affiche

### 3.4 Recherche par wilaya
- Sélection d'une wilaya (les 58 wilayas d'Algérie) → affichage de tous les appartements, villas et sites disponibles dans cette wilaya, avec un rendu visuel professionnel (cartes, filtres, tri par prix/type).

### 3.5 Module Tourisme
- Par wilaya, une section dédiée aux **lieux touristiques**.
- Chaque lieu touristique affiche : photos, position GPS, description détaillée.

### 3.6 Historique / Favoris
- Le client peut enregistrer/consulter un **historique** des biens et lieux touristiques consultés ou sélectionnés, organisé de manière claire (par date, par type).

### 3.7 Fonctionnalités recommandées à ajouter (non mentionnées mais essentielles)
- **Filtres de recherche avancés** : prix, type (F1 à F5), nombre de pièces, présence d'équipements spécifiques.
- **Favoris/liste de souhaits** distincts de l'historique (sélection volontaire vs consultation).
- **Système de notation/avis** sur les vendeurs (fiabilité, exactitude de l'annonce).
- **Partage** d'une annonce via réseaux sociaux/WhatsApp.
- **Signalement d'annonce** (annonce frauduleuse, injoignable, déjà louée).
- **Recherche "autour de moi"** basée sur la géolocalisation du client.
- **Notifications push** : nouvelles annonces correspondant aux critères sauvegardés (alertes de recherche).
- **Mode hors-ligne** : consultation des dernières données synchronisées sans connexion.
- **Écran d'onboarding** animé à la première ouverture (présentation des fonctionnalités).
- **CGU / Politique de confidentialité** accessibles depuis le profil.

---

## 4. MODULE VENDEUR

### 4.1 Inscription (demande de connexion vendeur)
Formulaire accessible via un bouton **« Devenir vendeur »**, contenant :
- Nom, prénom, adresse
- Choix du type de bien : Appartement / Villa / Site
- Si Appartement : type (F1, F2, F3, F4, F5)
- Position GPS exacte du bien
- Numéro de téléphone
- Adresse email
- Prix de location proposé
- Photos du bien

Le formulaire est envoyé à l'**administrateur**, qui doit contacter le vendeur par téléphone pour validation.

### 4.2 Validation & code d'accès
- Si l'admin **accepte** la demande : un **code unique** est généré et transmis au vendeur pour se connecter à son espace vendeur.
- Chaque vendeur dispose d'un **code et d'un accès dédiés et uniques**.

### 4.3 Espace vendeur (après connexion)
- Gestion de ses annonces (ajout, modification, suppression, statut disponible/loué).
- **Ajout de villas gratuit** pour tout vendeur connecté, quel que soit son statut initial.
- **Ajout d'appartements ou de sites payant/verrouillé** tant que ce droit n'est pas activé par l'admin (voir 5.4).
- Consultation de ses **propres statistiques** (vues, contacts générés, historique de performance).
- Visualisation de sa date de dernier accès / statut d'abonnement.
- Récupération de mot de passe (voir 4.4).

### 4.4 Mot de passe oublié (vendeur)
- Le vendeur clique sur « Mot de passe oublié ».
- La demande est envoyée à l'espace admin, dans une section dédiée **« Demandes de mot de passe oublié »**, affichant : informations du vendeur (nom, téléphone…), ancien mot de passe, nouveau mot de passe généré.
- L'admin transmet/valide le nouveau mot de passe et les informations nécessaires au vendeur (par téléphone/WhatsApp).
- Le vendeur peut ensuite se reconnecter avec le nouveau mot de passe.

### 4.5 Fonctionnalités recommandées à ajouter
- **Tableau de bord vendeur** avec graphiques (vues par jour/semaine/mois).
- **Upload multi-photos** avec réorganisation par glisser-déposer.
- **Notification** de rappel avant expiration d'abonnement (J-7, J-3, J-1).
- **Historique des paiements** du vendeur consultable depuis son espace.
- **Messagerie interne** optionnelle (au-delà de l'appel/WhatsApp) pour tracer les échanges.
- **Statut de vérification** (badge « Vendeur vérifié ») une fois validé par l'admin.

---

## 5. MODULE ADMINISTRATEUR

### 5.1 Gestion des vendeurs
- Liste de toutes les demandes d'inscription vendeur (formulaires reçus).
- Action **Accepter** → génération automatique d'un code unique + activation du partage des données vers l'app client.
- Action **Refuser**.

### 5.2 Tarification des abonnements
| Type de bien | Tarif mensuel |
|---|---|
| Appartement | 2 000 DA / mois |
| Villa | 3 500 DA / mois |
| Site | 5 000 DA / mois |

### 5.3 Gestion des accès et blocages
- L'admin visualise la **date de dernier accès à la plateforme** de chaque vendeur.
- Si **30 jours** se sont écoulés depuis cette date sans renouvellement : le vendeur passe dans une liste **« Abonnements à renouveler »** (le vendeur peut encore payer pour réactiver son compte).
- Si le vendeur ne renouvelle pas : il est **bloqué** et déplacé dans une liste **« Vendeurs bloqués »**.
- Cette liste des bloqués est conservée **3 mois**, puis le vendeur est **supprimé automatiquement** de la plateforme à l'issue de cette période.
- Si le vendeur paie pendant qu'il est bloqué (dans les 3 mois), il peut être **réactivé/relancé** sur la plateforme.

### 5.4 Gestion des droits par vendeur (« La Clé »)
- Section **« La Clé »** listant tous les vendeurs, avec une **barre de recherche** (par nom).
- Pour chaque vendeur, l'admin peut **activer/autoriser** un type de bien supplémentaire (ex. autoriser un vendeur inscrit comme « Villa » à ajouter également des appartements ou des sites).

### 5.5 Statistiques
- Statistiques globales : par **semaine, mois, année**.
- **Top 5 des meilleurs vendeurs** (par nombre d'annonces, vues, ou revenus générés).
- Chaque vendeur voit également ses propres statistiques (cf. 4.3).

### 5.6 Sécurité de l'accès admin
- L'admin dispose d'une **clé d'accès unique**.
- En cas d'oubli, un **nouveau code est envoyé sur WhatsApp** pour permettre la récupération de l'accès.

### 5.7 Fonctionnalités recommandées à ajouter
- **Rôles multiples** : super-admin / modérateur (droits limités pour certaines tâches, ex. validation seule, sans accès aux paramètres financiers).
- **Journal d'activité (logs)** : traçabilité des actions admin (validations, blocages, modifications de prix).
- **Export des statistiques** en PDF/Excel.
- **Gestion des paiements** : suivi manuel ou intégration future d'un moyen de paiement en ligne (CIB/Edahabia) pour automatiser le renouvellement.
- **Modération des annonces** : possibilité de suspendre une annonce individuelle sans bloquer tout le compte vendeur.
- **Gestion des signalements clients** (annonces frauduleuses, avis).
- **Configuration des tarifs** modifiable depuis l'admin (sans redéploiement).
- **Notifications automatiques** aux vendeurs (rappel avant blocage à J-25, J-28…).

---

## 6. MODÈLE DE DONNÉES (entités principales)

- **Utilisateur Client** : id, historique, favoris, wilaya préférée
- **Vendeur** : id, nom, prénom, adresse, téléphone, email, type de bien autorisé(s), code unique, statut (actif/à renouveler/bloqué), date dernier accès, date de blocage
- **Bien (Appartement/Villa)** : id, vendeur_id, type (F1-F5 si appartement), description, équipements, prix, position GPS, photos, statut (disponible/loué), wilaya
- **Site** : id, vendeur_id, liste des logements associés
- **Lieu touristique** : id, wilaya, nom, description, photos, position GPS
- **Abonnement/Paiement** : id, vendeur_id, montant, date de paiement, date d'expiration, statut
- **Historique client** : client_id, bien_id/lieu_id, date de consultation

---

## 7. SÉCURITÉ

- Authentification JWT + Refresh Token pour vendeurs et admin.
- Mots de passe hashés (bcrypt).
- HTTPS obligatoire sur tous les échanges.
- Rate limiting sur les endpoints sensibles (connexion, mot de passe oublié).
- Génération de codes uniques vendeurs via UUID/token cryptographiquement sûr.
- Validation stricte des données (Zod côté mobile, FluentValidation/Joi côté serveur).

---

## 8. DESIGN & EXPÉRIENCE UTILISATEUR

- Identité visuelle forte : logo animé à l'ouverture (splash screen 3D).
- Animations fluides sur les transitions entre écrans (partagées/shared element transitions).
- Cartes de biens avec effet de profondeur (parallax léger, ombres douces).
- Micro-interactions sur les boutons (retour visuel au clic, effets de pression).
- Thème cohérent (couleurs, typographie) reflétant le secteur immobilier/tourisme (chaleureux, professionnel, rassurant).
- Mode sombre recommandé en option.

### 8.1 Support multilingue (obligatoire)
La plateforme doit être **entièrement disponible en 3 langues : Arabe, Français, Anglais**, sur les **trois interfaces** (Client, Vendeur, Admin) :

- Sélecteur de langue accessible dès le premier lancement (écran d'onboarding) et depuis les paramètres/profil à tout moment.
- **Arabe** : activation automatique du mode **RTL (droite-à-gauche)** sur toute l'interface (mise en page, icônes, navigation, formulaires) — pas seulement une traduction du texte.
- Tous les textes statiques (menus, boutons, messages d'erreur, notifications, emails/SMS système) traduits dans les 3 langues.
- Le contenu saisi par les vendeurs (descriptions de biens, équipements) reste dans la langue de saisie d'origine, avec possibilité future de traduction automatique.
- Détection de la langue du téléphone à la première ouverture, avec le français comme langue par défaut si non détectée.
- Fichiers de traduction centralisés (i18n) pour faciliter la maintenance et l'ajout éventuel d'autres langues plus tard.
- Interface Admin : mêmes exigences (bascule de langue, RTL pour l'arabe), pour permettre à un administrateur arabophone, francophone ou anglophone de gérer la plateforme sans difficulté.
- Interface Vendeur : formulaire d'inscription, espace de gestion des annonces et statistiques disponibles dans les 3 langues.

---

## 9. PLAN DE DÉVELOPPEMENT SUGGÉRÉ (à donner à l'IA de Replit)

1. Mise en place de l'architecture backend (API + base de données + authentification).
2. Développement du module Admin (validation vendeurs, gestion abonnements, statistiques).
3. Développement du module Vendeur (formulaire, espace connecté, gestion des annonces).
4. Développement du module Client (dashboard, recherche par wilaya, fiches détail, tourisme, historique).
5. Intégration des animations et finalisation du design.
6. Tests complets (fonctionnels, sécurité, offline/sync).
7. Préparation du build pour publication sur le Play Store (icônes, splash screen, politique de confidentialité, permissions).

---

## 10. EXIGENCE FINALE

L'application doit être livrée **100% fonctionnelle, sans erreur**, avec un rendu visuel et une fluidité dignes d'une application professionnelle publiée sur le Play Store, incluant l'ensemble des fonctionnalités décrites ci-dessus ainsi que les ajouts recommandés en sections 3.7, 4.5 et 5.7.
