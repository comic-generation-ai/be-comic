import { ValueTransformer } from 'typeorm';

/**
 * Transformer cho cột `numeric/decimal` của Postgres.
 * Driver `pg` trả về string — convert sang number cho service layer.
 */
export const numericTransformer: ValueTransformer = {
  to: (value: number | null | undefined): number | null | undefined => value,
  from: (value: string | null): number | null =>
    value == null ? null : Number(value),
};
