import { InjectionToken } from '@angular/core';
import type { ExpenseReport } from './expense-report.model';

export interface ExpenseReportRepository {
  list(): Promise<readonly ExpenseReport[]>;
  getById(id: string): Promise<ExpenseReport | null>;
}

/** Las pantallas inyectan ESTE token, nunca la clase mock. */
export const EXPENSE_REPORT_REPOSITORY = new InjectionToken<ExpenseReportRepository>('ExpenseReportRepository');
