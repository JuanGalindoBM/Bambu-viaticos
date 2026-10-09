/** Tipos del dominio. Sin funciones, sin Angular. `readonly` por default. */

export interface ExpenseReport {
  readonly id: string;
}

/** Lo que en producción vendrá de configuración; las reglas lo reciben como parámetro. */
export interface ExpenseReportCatalogs {
  readonly placeholder?: never;
}
