import type { ExpenseReport, ExpenseReportCatalogs } from './expense-report.model';

/**
 * Reglas de negocio como funciones puras: sin Angular, sin UI, sin constantes
 * internas — el catálogo entra como parámetro para que el backend real no
 * obligue a tocar una sola regla.
 */
export function isComplete(entity: ExpenseReport, catalogs: ExpenseReportCatalogs): boolean {
  void catalogs;
  return Boolean(entity.id);
}
