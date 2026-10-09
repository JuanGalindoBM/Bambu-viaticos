# angular-file-architecture

Skill de arquitectura de archivos para apps Angular standalone. Destila la estructura que se usó en
este repo (`viaticos`) a reglas agnósticas al dominio, para arrancar proyectos nuevos con la misma
forma y para mantener en su sitio los que ya existen.

## Qué contiene

| Archivo | Para qué |
| --- | --- |
| `SKILL.md` | El árbol de carpetas, las cuatro reglas de pertenencia, dirección de dependencias, nombres y casos frontera. |
| `references/domain-module.md` | El patrón `model` / `rules` puras / `repository` + `InjectionToken` / mock único, con esqueletos de código. |
| `references/routing.md` | Un `*.routes.ts` por área, lazy siempre, guards en el padre, verificación por chunks. |
| `references/review-checklist.md` | Once comprobaciones con el `grep` que detecta cada violación. Para revisar o refactorizar. |
| `scripts/scaffold-architecture.sh` | Crea el esqueleto en un proyecto nuevo. Idempotente, nunca sobrescribe. `--help` para las opciones. |

## Uso rápido

```bash
# proyecto nuevo, desde su raíz
.claude/skills/angular-file-architecture/scripts/scaffold-architecture.sh \
  --prefix bam --domain order --areas auth,dashboard --dry-run
```

En conversación basta con pedir "dónde va este archivo", "organiza el proyecto con esta arquitectura"
o "revisa la estructura" — la skill se activa sola por su `description`.

## Lo que la skill decide (y lo que no)

Decide **ubicación**: qué capa, qué carpeta, qué nombre de archivo, qué puede importar qué. No decide
diseño visual, ni testing E2E (para eso está `playwright-qa-e2e`), ni convenciones de sintaxis de
Angular más allá de las que determinan dónde vive un archivo.

## Portarla a otro proyecto

Es autocontenida: copia la carpeta completa a `.claude/skills/` del otro repo, o a
`~/.claude/skills/` para tenerla en todos. Lo único que cambia por proyecto es el prefijo del design
system, el nombre del dominio y las áreas de `features/` — todo parametrizado, nada hardcodeado.
