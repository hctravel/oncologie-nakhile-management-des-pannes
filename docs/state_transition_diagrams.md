# Diagrammes d'état (State Transition)

Ce fichier contient des diagrammes d'état Mermaid pour les objets principaux : Machine, Panne, Maintenance.

## 1. Machine (MedicalMachine)

```mermaid
stateDiagram-v2
    [*] --> Active
    Active --> ScheduledMaintenance : planifier_maintenance
    ScheduledMaintenance --> InMaintenance : commencer_maintenance
    InMaintenance --> Active : maintenance_terminee
    Active --> ReportedFault : signaler_panne
    ReportedFault --> AssignedToTechnician : assigner_technicien
    AssignedToTechnician --> InRepair : commencer_reparation
    InRepair --> Active : reparations_terminees
    InRepair --> OutOfService : declaration_hors_service
    OutOfService --> Decommissioned : mettre_hors_service_definitif
    Active --> Decommissioned : mise_au_rebut
    Decommissioned --> [*]

    %% états optionnels
    ScheduledMaintenance : (Préventive planifiée)
    ReportedFault : (Panne signalée)
    AssignedToTechnician : (Assignée)
    InRepair : (En réparation)
```

## 2. Panne (Incident)

```mermaid
stateDiagram-v2
    [*] --> Reported
    Reported --> Triaged : triage
    Triaged --> Assigned : assignation
    Assigned --> InProgress : prise_en_charge
    InProgress --> Resolved : resolution
    Resolved --> Verified : verification
    Verified --> Closed : clôture
    Resolved --> Reopened : réouverture
    Reopened --> InProgress
    Closed --> [*]

    %% transitions importantes
    Reported : Signalée par utilisateur
    Triaged : Priorité/gravité évaluée
```

## 3. Maintenance (Ticket)

```mermaid
stateDiagram-v2
    [*] --> Planned
    Planned --> Scheduled : programmer_date
    Scheduled --> InProgress : début_intervention
    InProgress --> Completed : intervention_terminee
    InProgress --> Cancelled : annulée
    Completed --> Verified : vérification_post_intervention
    Verified --> Closed : clôture
    Cancelled --> Planned : replanifier
    Closed --> [*]

    Planned : Proposition / checklist prête
    Scheduled : Date confirmée
```

---

Si vous voulez des versions exportées (SVG/PNG) je peux générer et ajouter les fichiers dans `docs/diagrams/`.