-- ============================================================
--  ESTIMULAR — Esquema completo (Supabase / PostgreSQL 13+)
--  Sin triggers. Unificado: servicios ⇢ departamentos
--  Flujo: candidato → deptos → entrevistas → (aprobado) → paciente → turnos
--  Nota: 'turnos' asocia EXACTAMENTE a un candidato O a un paciente (XOR).
-- ============================================================

create extension if not exists "pgcrypto";

-- =========================
-- TIPOS (ENUMS)
-- =========================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'entrevista_depto_estado') then
    create type entrevista_depto_estado as enum ('pendiente','asignada','agendada','realizada','aprobada','rechazada','cancelada');
  end if;

  if not exists (select 1 from pg_type where typname = 'entrevista_estado') then
    create type entrevista_estado as enum ('entrevistar','parcial','aprobada','rechazada');
  end if;

  if not exists (select 1 from pg_type where typname = 'modalidad_entrevista') then
    create type modalidad_entrevista as enum ('individual','conjunta');
  end if;

  if not exists (select 1 from pg_type where typname = 'estado_cita_entrevista') then
    create type estado_cita_entrevista as enum ('pendiente','confirmada','completada','cancelada','ausente');
  end if;

  if not exists (select 1 from pg_type where typname = 'obra_social_estado') then
    create type obra_social_estado as enum ('pendiente','activa','inactiva');
  end if;

  if not exists (select 1 from pg_type where typname = 'estado_turno') then
    create type estado_turno as enum ('pendiente','confirmado','asistido','ausente','cancelado');
  end if;
end$$;

-- =========================
-- ROLES / USUARIOS / PROFESIONALES
-- =========================
create table if not exists public.roles (
  id_rol        bigint generated always as identity primary key,
  nombre_rol    varchar(120) not null unique,
  creado_en     timestamptz not null default now()
);

create table if not exists public.usuarios (
  id_usuario      bigint generated always as identity primary key,
  id_rol          bigint not null references public.roles(id_rol),
  dni             bigint unique,
  password_hash   varchar(255),
  activo          boolean not null default true,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

create index if not exists idx_usuarios_activo on public.usuarios(activo);

-- Perfil profesional 1:1 con usuarios (si el usuario es profesional)
create table if not exists public.profesionales (
  id_profesional        bigint primary key references public.usuarios(id_usuario) on delete cascade,
  nombre_profesional    varchar(120) not null,
  apellido_profesional  varchar(120) not null,
  telefono_profesional  varchar(60),
  email_profesional     varchar(160) unique,
  fecha_nacimiento      date not null,
  foto_perfil           text
);

-- =========================
-- DEPARTAMENTOS (unifica "servicios") y N:M con profesionales
-- =========================
create table if not exists public.departamentos (
  id_departamento       bigint generated always as identity primary key,
  nombre                varchar(160) not null unique,
  -- Campos heredados de "servicios":
  duracion_default_min  int not null default 30,
  descripcion           text,
  -- Responsable (jefa) del departamento
  responsable_id        bigint references public.profesionales(id_profesional)
);

create table if not exists public.profesional_departamentos (
  profesional_id  bigint not null references public.profesionales(id_profesional) on delete cascade,
  departamento_id bigint not null references public.departamentos(id_departamento) on delete cascade,
  primary key (profesional_id, departamento_id)
);

create index if not exists idx_pd_depto on public.profesional_departamentos(departamento_id);

-- =========================
-- OBRAS SOCIALES
-- =========================
create table if not exists public.obras_sociales (
  id_obra_social     bigint generated always as identity primary key,
  nombre_obra_social text not null unique,
  estado             obra_social_estado not null default 'pendiente',
  created_at         timestamptz not null default now()
);

-- =========================
-- RESPONSABLES (unificada para candidatos/pacientes)
-- =========================
create table if not exists public.responsables (
  id_responsable bigint generated always as identity primary key,
  nombre         text not null,
  apellido       text not null,
  telefono       text,
  email          text,
  creado_en      timestamptz not null default now()
);

-- =========================
-- PACIENTES (post-aprobación)
-- =========================
create table if not exists public.pacientes (
  id_paciente        bigint generated always as identity primary key,
  nombre_paciente    varchar(160),
  apellido_paciente  varchar(160),
  fecha_nacimiento   date,
  dni_paciente       varchar(32) unique,
  telefono_paciente  varchar(60),
  email_paciente     varchar(160),
  titular_nombre     varchar(160),
  obra_social        varchar(160),
  creado_en          timestamptz not null default now(),
  actualizado_en     timestamptz not null default now()
);

-- Responsables asociados al paciente (N:M)
create table if not exists public.paciente_responsables (
  id_paciente_responsable bigint generated always as identity primary key,
  id_paciente             bigint not null references public.pacientes(id_paciente) on delete cascade,
  id_responsable          bigint not null references public.responsables(id_responsable),
  parentesco              varchar(80) not null,
  es_principal            boolean not null default false,
  created_at              timestamptz not null default now(),
  constraint uq_paciente_responsable unique (id_paciente, id_responsable)
);

-- =========================
-- CANDIDATOS (pre-paciente)
-- =========================
create table if not exists public.candidatos (
  id_candidato             bigint generated always as identity primary key,
  id_obra_social           bigint references public.obras_sociales(id_obra_social),
  nombre_nino              text not null,
  apellido_nino            text not null,
  fecha_nacimiento         date not null,
  dni_nino                 varchar(32) unique,
  certificado_discapacidad boolean not null default false,
  motivo_consulta          text not null,
  created_at               timestamptz not null default now(),
  estado_entrevista        entrevista_estado not null default 'entrevistar',
  -- al aprobar, se linkea manualmente a paciente:
  paciente_id              bigint unique references public.pacientes(id_paciente)
);

-- Responsables asociados al candidato (N:M)
create table if not exists public.candidato_responsables (
  id_candidato_responsable bigint generated always as identity primary key,
  id_candidato             bigint not null references public.candidatos(id_candidato) on delete cascade,
  id_responsable           bigint not null references public.responsables(id_responsable),
  parentesco               varchar(80) not null,
  es_principal             boolean not null default false,
  created_at               timestamptz not null default now(),
  constraint uq_candidato_responsable unique (id_candidato, id_responsable)
);

-- =========================
-- CONSULTORIOS
-- =========================
create table if not exists public.consultorios (
  id         bigint generated always as identity primary key,
  nombre     varchar(120) not null unique,
  ubicacion  varchar(200)
);

-- =========================
-- DEPARTAMENTOS requeridos por candidato (seguimiento por depto)
-- =========================
create table if not exists public.candidato_departamentos (
  id                       bigint generated always as identity primary key,
  id_candidato             bigint not null references public.candidatos(id_candidato) on delete cascade,
  departamento_id          bigint not null references public.departamentos(id_departamento),
  estado                   entrevista_depto_estado not null default 'pendiente',
  profesional_asignado_id  bigint references public.profesionales(id_profesional),
  notas                    text,
  creado_en                timestamptz not null default now(),
  actualizado_en           timestamptz not null default now(),
  constraint uq_candidato_depto unique (id_candidato, departamento_id)
);

create index if not exists idx_cand_depto_estado on public.candidato_departamentos(id_candidato, estado);
create index if not exists idx_cand_depto_prof   on public.candidato_departamentos(profesional_asignado_id);

-- =========================
-- CITAS DE ENTREVISTA (pre-paciente)
-- =========================
create table if not exists public.entrevista_citas (
  id               bigint generated always as identity primary key,
  id_candidato     bigint  not null references public.candidatos(id_candidato) on delete cascade,
  departamento_id  bigint  not null references public.departamentos(id_departamento),
  profesional_id   bigint  not null references public.profesionales(id_profesional),
  inicio           timestamptz not null,
  fin              timestamptz not null,
  consultorio_id   bigint references public.consultorios(id),
  modalidad        modalidad_entrevista not null default 'individual',
  estado           estado_cita_entrevista not null default 'pendiente',
  grupo_uuid       uuid not null default gen_random_uuid(),
  observaciones    text,
  creado_en        timestamptz not null default now(),
  actualizado_en   timestamptz not null default now(),
  constraint chk_entrevista_intervalo check (fin > inicio)
);

create index if not exists idx_ent_citas_candidato on public.entrevista_citas(id_candidato);
create index if not exists idx_ent_citas_prof_inicio on public.entrevista_citas(profesional_id, inicio);
create index if not exists idx_ent_citas_consultorio_inicio on public.entrevista_citas(consultorio_id, inicio);
create index if not exists idx_ent_citas_estado on public.entrevista_citas(estado);

-- Resultados/informes por cita
create table if not exists public.entrevista_cita_resultados (
  id              bigint generated always as identity primary key,
  cita_id         bigint not null references public.entrevista_citas(id) on delete cascade,
  resultado       entrevista_depto_estado not null,
  informe         text,
  registrado_por  bigint references public.usuarios(id_usuario),
  registrado_en   timestamptz not null default now()
);

-- =========================
-- TURNOS (Agenda unificada: candidato O paciente) usando DEPARTAMENTOS
-- =========================
create table if not exists public.turnos (
  id               bigint generated always as identity primary key,
  -- EXACTAMENTE uno de estos dos debe tener valor:
  candidato_id     bigint references public.candidatos(id_candidato) on delete cascade,
  paciente_id      bigint references public.pacientes(id_paciente) on delete cascade,

  departamento_id  bigint not null references public.departamentos(id_departamento),
  inicio           timestamptz not null,
  fin              timestamptz not null,
  duracion_min     int not null,
  consultorio_id   bigint references public.consultorios(id),
  estado           estado_turno not null default 'pendiente',
  creado_por       bigint references public.usuarios(id_usuario),
  creado_en        timestamptz not null default now(),
  actualizado_en   timestamptz not null default now(),
  notas            text,

  constraint chk_turno_intervalo check (fin > inicio),

  -- XOR: o candidato o paciente (pero no ambos y no ninguno)
  constraint chk_turno_candidato_xor_paciente check (
    (candidato_id is not null and paciente_id is null) or
    (candidato_id is null and paciente_id is not null)
  )
);

create index if not exists idx_turnos_candidato_inicio on public.turnos(candidato_id, inicio);
create index if not exists idx_turnos_paciente_inicio  on public.turnos(paciente_id, inicio);
create index if not exists idx_turnos_depto_inicio     on public.turnos(departamento_id, inicio);
create index if not exists idx_turnos_estado_inicio    on public.turnos(estado, inicio);

-- Profesionales asignados al turno (N:M)
create table if not exists public.turno_profesionales (
  turno_id       bigint not null references public.turnos(id) on delete cascade,
  profesional_id bigint not null references public.profesionales(id_profesional),
  rol_en_turno   varchar(32) not null default 'responsable',
  primary key (profesional_id, turno_id)
);

-- =========================
-- FIN DEL SCRIPT
-- =========================
