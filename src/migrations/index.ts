import * as migration_20260922_021810_student_domain_etapa1 from './20260922_021810_student_domain_etapa1';

export const migrations = [
  {
    up: migration_20260922_021810_student_domain_etapa1.up,
    down: migration_20260922_021810_student_domain_etapa1.down,
    name: '20260922_021810_student_domain_etapa1'
  },
];
