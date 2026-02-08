# Guide Connections Map

Tracks prerequisite and next-step relationships between onboarding guides. Used by the dashboard to show the onboarding graph.

## Connection Graph

```
                        Getting Started (1)
                       /        |         \
              Course Path   Project Path   Contributor Path
                   |              |              |
          Creating First    Creating First    Earning
          Course (2)        Project (6)       Credentials (8)
                   |              |              |
          Publishing &     Managing           Completing
          Modules (3)      Contributors (7)   Prerequisites (9)
              |    \                              |
          Managing  Setting Up               Joining
          Students  Prerequisites (5)        Projects (10)
          (4)       (needs 3 + 6)
```

## Connections Table

Each row defines what must come before a guide, and what becomes available after.

| ID | Guide | Prereqs (before) | Next Steps (after) |
|----|-------|-------------------|---------------------|
| `getting-started` | Getting Started | — (entry point) | `creating-your-first-course`, `creating-your-first-project`, `earning-credentials` |
| `creating-your-first-course` | Creating Your First Course | `getting-started` | `publishing-and-modules` |
| `publishing-and-modules` | Publishing and Modules | `creating-your-first-course` | `managing-students`, `setting-up-prerequisites` |
| `managing-students` | Managing Students and Grading | `publishing-and-modules` | — (end of course-owner path) |
| `setting-up-prerequisites` | Setting Up Prerequisites | `publishing-and-modules` + `creating-your-first-project` | — (bridges course and project paths) |
| `creating-your-first-project` | Creating Your First Project | `getting-started` | `managing-contributors`, `setting-up-prerequisites` |
| `managing-contributors` | Managing Contributors and Tasks | `creating-your-first-project` | — (end of project-owner path) |
| `earning-credentials` | Earning Credentials | `getting-started` | `completing-prerequisites` |
| `completing-prerequisites` | Completing Prerequisites | `earning-credentials` | `joining-projects` |
| `joining-projects` | Joining Projects | `completing-prerequisites` | — (end of contributor path) |

## Three Onboarding Paths

1. **Course Owner Path**: 1 → 2 → 3 → 4
2. **Project Owner Path**: 1 → 6 → 7
3. **Contributor Path**: 1 → 8 → 9 → 10

**Cross-path bridge**: Setting Up Prerequisites (5) requires completing guides on *both* the course path (through 3) and the project path (through 6).

## Rules

- A guide's **Prerequisites** section in the MDX must link to its prereq guides
- A guide's **Next Steps** section in the MDX must link to its next-step guides
- When reviewing a guide (`/guide-pipeline review`), verify these links match this map
- When a guide is published, its prereqs should already be published (warn if not)

## Dashboard Display

When showing the dashboard, append the path view:

```
Onboarding Paths:
  Course Owner:  (1) → (2) → (3) → (4)
  Project Owner: (1) → (6) → (7)
  Contributor:   (1) → (8) → (9) → (10)
  Bridge:        (3) + (6) → (5)
```
