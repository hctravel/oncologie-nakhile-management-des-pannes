# CAHIER DE CHARGE
## Système de Gestion des Machines Médicales

**Version :** 2.0.0  
**Date de création :** 22 Mai 2026  
**Dernière modification :** 22 Mai 2026  
**Statut :** En développement

---

## 1. CONTEXTE ET JUSTIFICATION DU PROJET

### 1.1 Contexte
Ce projet concerne le développement d'une application web complète de gestion des machines médicales pour les établissements de santé. L'application permettra de centraliser la gestion des équipements médicaux, leur maintenance, leur utilisation et les coûts associés.

### 1.2 Objectif général
Mettre en place une solution informatique efficace et sécurisée pour :
- Gérer l'inventaire complet des machines médicales
- Suivre la maintenance préventive et corrective
- Enregistrer l'utilisation des équipements
- Gérer les pannes et les incidents
- Analyser les coûts et générer des rapports
- Maintenir un audit complet des opérations

### 1.3 Justification
- **Besoin organisationnel** : Centralisation et automatisation de la gestion des équipements
- **Besoin opérationnel** : Amélioration de la disponibilité des machines et réduction des temps d'arrêt
- **Besoin financier** : Suivi des dépenses et optimisation des coûts
- **Besoin de conformité** : Traçabilité complète et audit des opérations

---

## 2. PORTÉE DU PROJET

### 2.1 Éléments inclus
- Application web responsive (Frontend React)
- API REST complète (Backend Node.js/Express)
- Base de données MySQL
- Système d'authentification et d'autorisation
- Gestion des rôles et permissions
- Tableau de bord et rapports
- Containerisation Docker

### 2.2 Éléments exclus (hors scope)
- Application mobile native
- Intégration avec les systèmes d'information existants (futur)
- Notification par SMS
- Intégration avec systèmes de paiement
- Support multilingue (futur)

---

## 3. EXIGENCES FONCTIONNELLES

### 3.1 Authentification et Gestion des utilisateurs

#### 3.1.1 Authentification
- **Connexion** : Via email et mot de passe avec validation
- **Tokens JWT** : Authentification par tokens JWT avec refresh token
- **Déconnexion** : Fin de session sécurisée
- **Récupération de session** : Lecture du profil utilisateur actuel

#### 3.1.2 Gestion des utilisateurs
- **Création d'utilisateur** : Par les administrateurs
- **Modification d'utilisateur** : Mise à jour du profil
- **Suppression d'utilisateur** : Archivage logique
- **Liste des utilisateurs** : Avec filtrage et pagination
- **Attribution de rôles** : Super Admin, Admin, Technician, User

#### 3.1.3 Rôles et permissions
| Rôle | Permissions |
|------|------------|
| **Super Admin** | Accès complet, gestion des administrateurs |
| **Admin** | Gestion machines, utilisateurs, maintenance, rapports |
| **Technician** | Gestion maintenance, enregistrement pannes, utilisation |
| **User** | Lecture seule des données |

### 3.2 Gestion des Machines Médicales

#### 3.2.1 CRUD Machines
- **Créer** : Ajout d'une nouvelle machine avec informations détaillées
- **Lire** : Consultation des détails d'une machine
- **Mettre à jour** : Modification des informations de la machine
- **Supprimer** : Suppression logique de la machine

#### 3.2.2 Informations gérées par machine
- Numéro de série / Identifiant unique
- Nom/Model et marque
- Type de machine (Type de maintenance)
- Date d'acquisition
- Numéro de lot / Lot d'installation
- Localisation (Département/Service)
- État actuel (Actif, Inactif, En maintenance, Hors service)
- Statut de garantie
- Coût d'acquisition
- Historique de modifications

#### 3.2.3 Fonctionnalités supplémentaires
- Filtrage et recherche par critères
- Pagination des listes
- Export des données en Excel
- Affichage du statut en temps réel

### 3.3 Gestion de la Maintenance

#### 3.3.1 CRUD Maintenance
- **Créer** : Planification/Enregistrement d'une maintenance
- **Lire** : Consultation des détails de maintenance
- **Mettre à jour** : Modification du statut ou des détails
- **Supprimer** : Suppression logique

#### 3.3.2 Types de maintenance
- Maintenance préventive (programmée)
- Maintenance corrective (suite à une panne)
- Maintenance curative

#### 3.3.3 Informations gérées
- Machine concernée
- Date de maintenance
- Type de maintenance
- Technicien responsable
- Durée de l'intervention
- Description des interventions
- Pièces remplacées
- Coûts associés
- Résultat/Statut (Complétée, En cours, Planifiée)
- Notes et observations
- Historique d'audit

#### 3.3.4 Fonctionnalités
- Planification de maintenances préventives
- Historique complet par machine
- Alertes de maintenance due
- Rapport de maintenance

### 3.4 Gestion des Pannes

#### 3.4.1 CRUD Pannes
- **Créer** : Enregistrement d'une nouvelle panne
- **Lire** : Consultation des détails
- **Mettre à jour** : Mise à jour du statut
- **Supprimer** : Suppression logique

#### 3.4.2 Informations gérées
- Machine concernée
- Date/Heure de la panne
- Description du problème
- Priorité (Critique, Haute, Moyenne, Basse)
- Statut (Signalée, Assignée, En cours, Résolue)
- Technicien assigné
- Cause probable
- Solution appliquée
- Temps de résolution
- Coûts de réparation

#### 3.4.3 Fonctionnalités
- Filtrage par priorité et statut
- Assignment automatique aux techniciens disponibles
- SLA (Temps de réponse/Résolution)
- Notifications en temps réel (WebSocket)
- Historique complet

### 3.5 Gestion de l'Utilisation des Machines

#### 3.5.1 CRUD Utilisation
- **Créer** : Enregistrement d'une session d'utilisation
- **Lire** : Consultation des statistiques
- **Mettre à jour** : Correction d'une entrée
- **Supprimer** : Suppression logique

#### 3.5.2 Informations gérées
- Machine utilisée
- Date et heure d'utilisation
- Nombre de patients traités
- Durée d'utilisation
- Utilisateur/Technicien responsable
- Observations

#### 3.5.3 Fonctionnalités
- Enregistrement de l'utilisation quotidienne
- Statistiques d'utilisation par machine
- Graphiques de tendance
- Export des données d'utilisation

### 3.6 Gestion Financière

#### 3.6.1 CRUD Enregistrements Financiers
- **Créer** : Ajout d'un enregistrement financier
- **Lire** : Consultation des détails
- **Mettre à jour** : Modification des montants/statut
- **Supprimer** : Suppression logique

#### 3.6.2 Types de coûts
- Coût d'acquisition
- Coûts de maintenance
- Coûts de réparation (pannes)
- Coûts de maintenance préventive
- Consommables et pièces
- Autres coûts (transport, installation, etc.)

#### 3.6.3 Informations gérées
- Machine concernée
- Type de coût
- Montant
- Date
- Fournisseur
- Facture/Justificatif
- Description
- Catégorie budgétaire

#### 3.6.4 Fonctionnalités
- Calcul des coûts totaux par machine
- Cumul des coûts sur période
- Budget vs Réalisé
- Alertes de dépassement
- Rapports financiers

### 3.7 Rapports et Tableaux de Bord

#### 3.7.1 Tableau de Bord Principal
- Vue d'ensemble : Nombre total de machines, en maintenance, hors service
- Machines critiques nécessitant attention
- Pannes récentes
- Tâches de maintenance planifiées
- Coûts totaux du mois
- Taux de disponibilité

#### 3.7.2 Rapports disponibles
- **Rapport Machines** : Inventaire, état, localisation
- **Rapport Maintenance** : Maintenance par machine, par technicien, par période
- **Rapport Pannes** : Analyse des pannes, tendances
- **Rapport Utilisation** : Heures d'utilisation, patient-machine
- **Rapport Financier** : Coûts par machine, par catégorie, par période
- **Rapport d'Audit** : Toutes les modifications, qui a fait quoi et quand

#### 3.7.3 Fonctionnalités des rapports
- Filtrage par dates, machines, utilisateurs
- Export en Excel/PDF
- Personnalisation des colonnes
- Mise en cache pour performance
- Programmation automatique

### 3.8 Journalisation et Audit

#### 3.8.1 Enregistrement d'audit
- Utilisateur qui a effectué l'action
- Type d'action (Create, Read, Update, Delete)
- Table/Entity concernée
- Ancienne valeur / Nouvelle valeur
- Timestamp
- Adresse IP
- Détails supplémentaires

#### 3.8.2 Fonctionnalités
- Traçabilité complète de toutes les opérations
- Impossible de modifier l'historique
- Consultation des modifications
- Rapports d'audit
- Alertes sur opérations sensibles

---

## 4. EXIGENCES NON-FONCTIONNELLES

### 4.1 Performance
- **Temps de réponse** : < 2 secondes pour 95% des requêtes
- **Temps de chargement page** : < 3 secondes
- **Concurrence** : Support de 100+ utilisateurs simultanés
- **Pagination** : 50 enregistrements par défaut
- **Cache** : Redis/Caching côté frontend

### 4.2 Sécurité
- **Authentification** : JWT avec expiration (15 min) et refresh token (7 jours)
- **Autorisation** : Vérification des permissions sur chaque endpoint
- **Chiffrement** : HTTPS/TLS, mot de passe hashé (bcrypt)
- **Protection CSRF** : Headers CORS configurés
- **Protection XSS** : Sanitisation des entrées, Content Security Policy
- **SQL Injection** : Utilisation de Sequelize ORM et requêtes paramétrées
- **Rate Limiting** : Limitation du nombre de requêtes par IP
- **Validation** : Validation côté serveur et client
- **Audit** : Logging complet de toutes les opérations sensibles

### 4.3 Disponibilité et Reliability
- **Uptime** : 99% (SLA à définir)
- **Backup** : Sauvegarde quotidienne de la base de données
- **Disaster Recovery** : Plan de récupération en cas de sinistre
- **Redondance** : (Futur) Base de données répliquée
- **Gestion erreurs** : Gestion gracieuse et logging

### 4.4 Scalabilité
- **Architecture** : Stateless backend pour load balancing
- **Base de données** : Indexation adéquate pour optimiser les requêtes
- **Frontend** : Code splitting et lazy loading
- **Containerisation** : Docker pour déploiement facilité

### 4.5 Utilisabilité
- **Interface** : Interface intuitive et responsive
- **Accessibilité** : Respect des normes WCAG 2.1 (futur)
- **Documentation** : Aide en ligne, tooltips
- **Formation** : Manuel utilisateur fourni

### 4.6 Maintenance
- **Code** : Suivre les bonnes pratiques (ESLint, Prettier)
- **Documentation** : Code documenté et commenté
- **Tests** : Tests unitaires et d'intégration
- **Logging** : Morgan pour HTTP, logs applicatifs
- **Monitoring** : (Futur) Monitoring et alertes

### 4.7 Compatibilité
- **Navigateurs** : Chrome, Firefox, Safari, Edge (dernières 2 versions)
- **Résolution** : Support mobile (320px) et desktop
- **OS** : Windows, Linux, macOS

---

## 5. ARCHITECTURE TECHNIQUE

### 5.1 Architecture générale
```
┌─────────────────────────────────────────┐
│         Frontend (React)                 │
│  - Redux State Management               │
│  - React Router Navigation              │
│  - Bootstrap UI Components              │
└─────────────────────────────────────────┘
                    ↓ (HTTP/HTTPS)
┌─────────────────────────────────────────┐
│    Backend API (Express.js)             │
│  - RESTful endpoints                    │
│  - JWT Authentication                  │
│  - Business Logic                       │
│  - Validation & Authorization           │
└─────────────────────────────────────────┘
                    ↓ (TCP)
┌─────────────────────────────────────────┐
│      MySQL Database                     │
│  - Persistent Data Storage              │
│  - Tables relationnelles                │
└─────────────────────────────────────────┘
```

### 5.2 Stack Technologique

#### Backend
- **Runtime** : Node.js (v16+)
- **Framework** : Express.js 4.18
- **ORM** : Sequelize 6.37
- **Database** : MySQL 8.0
- **Authentication** : JSON Web Token (JWT)
- **Security** : Helmet, bcryptjs, hpp, xss-clean
- **Validation** : express-validator
- **Rate Limiting** : express-rate-limit
- **Logging** : Morgan
- **Real-time** : Socket.io
- **Testing** : Jest, Supertest
- **Linting** : ESLint

#### Frontend
- **Library** : React 18.2
- **State Management** : Redux & Redux Toolkit
- **Routing** : React Router v6
- **HTTP Client** : Axios
- **UI Framework** : Bootstrap 5, React-Bootstrap
- **Charts** : Recharts
- **Tables** : React-Table
- **Forms** : React Hook Form
- **Notifications** : React-Toastify
- **Icons** : React-Icons
- **Date** : date-fns
- **Excel Export** : XLSX
- **Calendar** : React-Calendar
- **Real-time** : Socket.io-client
- **Linting** : ESLint, Prettier

#### Infrastructure
- **Containerization** : Docker
- **Orchestration** : Docker Compose
- **Version Control** : Git

### 5.3 Base de Données - Schéma Entités-Associations

#### Entities principales
- **Users** : Utilisateurs du système
- **MedicalMachines** : Machines médicales
- **Maintenance** : Enregistrements de maintenance
- **Pannes** : Signalement des pannes
- **MachineUsage** : Utilisation des machines
- **FinancialRecords** : Coûts associés
- **AuditLogs** : Journalisation d'audit

#### Relations
- User → Maintenance (1 à N)
- MedicalMachine → Maintenance (1 à N)
- MedicalMachine → Panne (1 à N)
- MedicalMachine → MachineUsage (1 à N)
- MedicalMachine → FinancialRecords (1 à N)

---

## 6. PLANNING ET JALONS

### 6.1 Phases du projet

| Phase | Description | Durée | Statut |
|-------|------------|-------|--------|
| Phase 1 | Setup architecture & Base de données | 2 sem | ✅ Complété |
| Phase 2 | Backend - API Core (CRUD) | 3 sem | ✅ Complété |
| Phase 3 | Frontend - UI & Components | 3 sem | ✅ Complété |
| Phase 4 | Authentication & Authorization | 2 sem | ✅ Complété |
| Phase 5 | Rapports & Analytics | 2 sem | 🔄 En cours |
| Phase 6 | Testing & QA | 2 sem | ⏳ Planifié |
| Phase 7 | Deployment & Documentation | 1 sem | ⏳ Planifié |
| Phase 8 | Formation & Support | 1 sem | ⏳ Planifié |

### 6.2 Jalons clés
- **16 Mars 2026** : Architecture définie
- **20 Avril 2026** : Backend API opérationnel
- **10 Mai 2026** : Frontend prototype fonctionnel
- **22 Mai 2026** : Version 2.0 déployée
- **31 Mai 2026** : Tests et ajustements
- **15 Juin 2026** : Déploiement production

---

## 7. RESSOURCES NÉCESSAIRES

### 7.1 Équipe
- 1 Développeur Full-Stack (ou 1 Backend + 1 Frontend)
- 1 Responsable QA/Testing
- 1 DevOps/Infrastructure (partiel)
- 1 Responsable projet (partiel)

### 7.2 Environnements
- **Développement** : Machine locale développeur
- **Test** : Serveur de test interne
- **Staging** : Réplique de production
- **Production** : Serveur de production

### 7.3 Outils
- IDE : VS Code
- Version Control : Git/GitHub
- Project Management : Jira/Trello
- Communication : Teams/Slack
- Documentation : Confluence/Wiki

---

## 8. CRITÈRES D'ACCEPTATION

### 8.1 Critères de succès
- ✅ Tous les CRUD fonctionnels pour toutes les entités
- ✅ Authentification et autorisation opérationnelles
- ✅ Performance : < 2s par requête en moyenne
- ✅ Zéro SQL injection / XSS / CSRF
- ✅ 100% de couverture des tests pour les critères
- ✅ Documentation complète
- ✅ Déploiement en production réussi
- ✅ Formation utilisateurs complétée
- ✅ Audit complet de sécurité réussi

### 8.2 Métriques de qualité
- Code coverage : > 80%
- Time to first byte : < 300ms
- Lighthouse score : > 80
- Zero critical security issues
- Uptime > 99%

---

## 9. RISQUES ET MITIGATION

### 9.1 Risques techniques

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|-----------|
| Perte de données | Critique | Basse | Backups quotidiens, réplication DB |
| Performance dégradée | Haute | Moyenne | Caching, indexation DB, CDN |
| Faille sécurité | Critique | Basse | Code review, pentesting, OWASP |
| Incompatibilité navigateur | Moyenne | Basse | Testing multi-navigateur |
| Intégration API externe | Haute | Moyenne | Mock APIs pour dev, fallback |

### 9.2 Risques organisationnels

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|-----------|
| Retard livrable | Haute | Moyenne | Planification agile, buffer temps |
| Scope creep | Moyenne | Haute | Gestion rigoureuse scope |
| Absence clé | Moyenne | Basse | Documentation, knowledge sharing |
| Budget dépassé | Haute | Moyenne | Suivi budget, scope control |

---

## 10. LIVRABLES

### 10.1 Livrables finaux
1. **Code source** : Backend + Frontend + Infrastructure
2. **Base de données** : Schema SQL avec données exemple
3. **Documentation technique** : API docs, architecture, setup guide
4. **Documentation utilisateur** : Manuels et guides
5. **Tests** : Suites de tests unitaires et d'intégration
6. **Configuration déploiement** : Docker Compose, CI/CD
7. **Plan de formation** : Support utilisateurs et administrateurs

### 10.2 Documentation fournie
- README complet
- API Documentation (Swagger/OpenAPI)
- Architecture et design decisions
- Guide de déploiement
- Guide de maintenance
- Manuel utilisateur
- Guide administrateur
- Plan de récupération après sinistre

---

## 11. MAINTENANCE ET SUPPORT

### 11.1 Support post-déploiement
- **Hotline technique** : Support 24/5 les 3 premiers mois
- **SLA réponse** : 2h pour critique, 8h pour normal
- **Maintenance corrective** : Bugs découverts post-déploiement
- **Maintenance évolutive** : Nouvelles fonctionnalités futures

### 11.2 Maintenance Préventive
- **Monitoring** : 24/7 monitoring de la disponibilité
- **Updates** : Sécurité patchs appliqués mensuellement
- **Logs** : Rotation logs, archivage
- **Performances** : Analyse mensuelle des performances

### 11.3 Améliorations futures (Roadmap)
- [ ] Application mobile iOS/Android
- [ ] Intégration ERP existant
- [ ] Notification SMS/Email
- [ ] BI avancée (Power BI/Tableau)
- [ ] Support multilingue
- [ ] Prédiction maintenance préventive (ML)
- [ ] API pour tiers
- [ ] Intégration IoT pour monitoring temps réel

---

## 12. SIGNATURES ET VALIDATIONS

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| Product Owner | ________________ | __________ | ___________ |
| Lead Developer | ________________ | __________ | ___________ |
| Project Manager | ________________ | __________ | ___________ |
| Directeur IT | ________________ | __________ | ___________ |

---

## 13. GLOSSAIRE

| Terme | Définition |
|-------|-----------|
| **CRUD** | Create, Read, Update, Delete - opérations de base |
| **JWT** | JSON Web Token - méthode d'authentification |
| **ORM** | Object-Relational Mapping - abstraction DB |
| **SLA** | Service Level Agreement - engagement de service |
| **DevOps** | Development & Operations - intégration continue |
| **CI/CD** | Continuous Integration/Deployment |
| **XSS** | Cross-Site Scripting - faille de sécurité |
| **CSRF** | Cross-Site Request Forgery - faille de sécurité |
| **OWASP** | Open Web Application Security Project |
| **ESLint** | Outil d'analyse code JavaScript |
| **Panne** | Défaillance/Incident d'une machine |
| **Maintenance Préventive** | Maintenance programmée régulière |
| **Maintenance Corrective** | Maintenance suite à une panne |

---

## 14. ANNEXES

### 14.1 Endpoints API principaux

**Authentification**
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Enregistrement (Admin)
- `POST /api/auth/refresh-token` - Renouvellement token
- `GET /api/auth/me` - Profil courant

**Machines**
- `GET /api/machines` - Liste
- `GET /api/machines/:id` - Détail
- `POST /api/machines` - Créer
- `PUT /api/machines/:id` - Modifier
- `DELETE /api/machines/:id` - Supprimer

**Maintenance**
- `GET /api/maintenance` - Liste
- `POST /api/maintenance` - Créer
- `PUT /api/maintenance/:id` - Modifier
- `DELETE /api/maintenance/:id` - Supprimer

**Pannes**
- `GET /api/pannes` - Liste
- `POST /api/pannes` - Signaler
- `PUT /api/pannes/:id` - Mettre à jour
- `DELETE /api/pannes/:id` - Supprimer

**Utilisation**
- `GET /api/usage` - Liste
- `POST /api/usage` - Enregistrer
- `PUT /api/usage/:id` - Modifier

**Financier**
- `GET /api/financial` - Liste
- `POST /api/financial` - Ajouter
- `GET /api/financial/summary/all` - Résumé

**Rapports**
- `GET /api/reports/machines` - Rapport machines
- `GET /api/reports/maintenance` - Rapport maintenance
- `GET /api/reports/pannes` - Rapport pannes
- `GET /api/reports/financial` - Rapport financier

### 14.2 Données exemple pour test
- 5+ machines médicales
- 3+ utilisateurs (Admin, Technician, User)
- 10+ enregistrements maintenance
- 5+ pannes
- 20+ enregistrements utilisation
- 30+ enregistrements financiers

---

**FIN DU CAHIER DE CHARGE**

*Ce document est confidentiel et destiné à l'usage interne uniquement.*  
*Toute reproduction ou divulgation sans autorisation est interdite.*

---

## VERSION ET HISTORIQUE

| Version | Date | Auteur | Description |
|---------|------|--------|-------------|
| 1.0 | 15/03/2026 | Équipe Dev | Première version |
| 1.5 | 01/04/2026 | Équipe Dev | Intégration retours |
| 2.0 | 22/05/2026 | Équipe Dev | Version finale mise à jour |
