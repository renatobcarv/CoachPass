import * as migration_20260922_021810_student_domain_etapa1 from './20260922_021810_student_domain_etapa1';
import * as migration_20261021_033808_domain_etapa2 from './20261021_033808_domain_etapa2';
import * as migration_20261021_090000_users_plan_default from './20261021_090000_users_plan_default';
import * as migration_20261021_144500_domain_etapa3 from './20261021_144500_domain_etapa3';
import * as migration_20261030_034603_domain_etapa4 from './20261030_034603_domain_etapa4';
import * as migration_20261030_041106_pro_plans from './20261030_041106_pro_plans';
import * as migration_20261030_044608_abacate_billing from './20261030_044608_abacate_billing';
import * as migration_20261030_051312_workout_log_optional_workout from './20261030_051312_workout_log_optional_workout';
import * as migration_20261030_052008_link_professional_name from './20261030_052008_link_professional_name';
import * as migration_20261030_142337_v2_periodization_roles_exercises from './20261030_142337_v2_periodization_roles_exercises';

export const migrations = [
  {
    up: migration_20260922_021810_student_domain_etapa1.up,
    down: migration_20260922_021810_student_domain_etapa1.down,
    name: '20260922_021810_student_domain_etapa1',
  },
  {
    up: migration_20261021_033808_domain_etapa2.up,
    down: migration_20261021_033808_domain_etapa2.down,
    name: '20261021_033808_domain_etapa2',
  },
  {
    up: migration_20261021_090000_users_plan_default.up,
    down: migration_20261021_090000_users_plan_default.down,
    name: '20261021_090000_users_plan_default',
  },
  {
    up: migration_20261021_144500_domain_etapa3.up,
    down: migration_20261021_144500_domain_etapa3.down,
    name: '20261021_144500_domain_etapa3',
  },
  {
    up: migration_20261030_034603_domain_etapa4.up,
    down: migration_20261030_034603_domain_etapa4.down,
    name: '20261030_034603_domain_etapa4',
  },
  {
    up: migration_20261030_041106_pro_plans.up,
    down: migration_20261030_041106_pro_plans.down,
    name: '20261030_041106_pro_plans',
  },
  {
    up: migration_20261030_044608_abacate_billing.up,
    down: migration_20261030_044608_abacate_billing.down,
    name: '20261030_044608_abacate_billing',
  },
  {
    up: migration_20261030_051312_workout_log_optional_workout.up,
    down: migration_20261030_051312_workout_log_optional_workout.down,
    name: '20261030_051312_workout_log_optional_workout',
  },
  {
    up: migration_20261030_052008_link_professional_name.up,
    down: migration_20261030_052008_link_professional_name.down,
    name: '20261030_052008_link_professional_name',
  },
  {
    up: migration_20261030_142337_v2_periodization_roles_exercises.up,
    down: migration_20261030_142337_v2_periodization_roles_exercises.down,
    name: '20261030_142337_v2_periodization_roles_exercises'
  },
];
