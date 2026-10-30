import * as migration_20260922_021810_student_domain_etapa1 from './20260922_021810_student_domain_etapa1';
import * as migration_20261021_033808_domain_etapa2 from './20261021_033808_domain_etapa2';
import * as migration_20261021_144500_domain_etapa3 from './20261021_144500_domain_etapa3';

export const migrations = [
  {
    up: migration_20260922_021810_student_domain_etapa1.up,
    down: migration_20260922_021810_student_domain_etapa1.down,
    name: '20260922_021810_student_domain_etapa1',
  },
  {
    up: migration_20261021_033808_domain_etapa2.up,
    down: migration_20261021_033808_domain_etapa2.down,
    name: '20261021_033808_domain_etapa2'
  },
  {
    up: migration_20261021_144500_domain_etapa3.up,
    down: migration_20261021_144500_domain_etapa3.down,
    name: '20261021_144500_domain_etapa3',
  },
];
