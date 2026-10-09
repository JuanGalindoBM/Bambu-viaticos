import type { ExpenseReport } from './expense-report.model';
import type { ExpenseReportRepository } from './expense-report.repository';

/**
 * Única implementación del repositorio: el único archivo que el día del backend
 * real cambia. Mantiene la latencia simulada para que los estados de carga se
 * diseñen desde el principio.
 */
export class MockExpenseReportRepository implements ExpenseReportRepository {
  private readonly items: ExpenseReport[] = [];

  async list(): Promise<readonly ExpenseReport[]> {
    await delay();
    return this.items;
  }

  async getById(id: string): Promise<ExpenseReport | null> {
    await delay();
    return this.items.find((i) => i.id === id) ?? null;
  }
}

function delay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
