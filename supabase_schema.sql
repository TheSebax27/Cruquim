-- ============================================================
-- CRUQUIM - Schema Supabase
-- Ejecutar en el SQL Editor de Supabase
-- ============================================================

-- Categorías
create table if not exists public.categorias (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  descripcion text,
  icono       text,
  activa      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Productos
create table if not exists public.productos (
  id                  uuid primary key default gen_random_uuid(),
  nombre              text not null,
  descripcion         text,
  referencia          text,
  categoria_id        uuid references public.categorias(id) on delete set null,
  imagen_drive_id     text,          -- ID del archivo en Google Drive
  imagen_url          text,          -- URL directa alternativa
  unidad              text,          -- ej: "1 litro", "galón", "kg"
  disponible          boolean not null default true,
  destacado           boolean not null default false,
  -- Costos (privados, solo admin los ve)
  costo_compra        numeric(12,2) default 0,
  costo_transporte    numeric(12,2) default 0,
  costo_envase        numeric(12,2) default 0,
  iva_porcentaje      numeric(5,2)  default 19,
  margen_porcentaje   numeric(5,2)  default 30,
  precio_sugerido     numeric(12,2) generated always as (
    round(
      (costo_compra + costo_transporte + costo_envase)
      * (1 + iva_porcentaje / 100)
      * (1 + margen_porcentaje / 100),
    2)
  ) stored,
  stock_actual        integer not null default 0,
  stock_minimo        integer not null default 5,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Movimientos de inventario
create table if not exists public.movimientos_inventario (
  id           uuid primary key default gen_random_uuid(),
  producto_id  uuid not null references public.productos(id) on delete cascade,
  tipo         text not null check (tipo in ('entrada', 'salida')),
  cantidad     integer not null check (cantidad > 0),
  motivo       text,
  created_at   timestamptz not null default now()
);

-- Trigger: actualizar stock_actual al registrar movimiento
create or replace function public.actualizar_stock()
returns trigger language plpgsql as $$
begin
  if NEW.tipo = 'entrada' then
    update public.productos
    set stock_actual = stock_actual + NEW.cantidad,
        updated_at   = now()
    where id = NEW.producto_id;
  elsif NEW.tipo = 'salida' then
    update public.productos
    set stock_actual = greatest(0, stock_actual - NEW.cantidad),
        updated_at   = now()
    where id = NEW.producto_id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_actualizar_stock on public.movimientos_inventario;
create trigger trg_actualizar_stock
after insert on public.movimientos_inventario
for each row execute function public.actualizar_stock();

-- Trigger: updated_at automático en productos
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

drop trigger if exists trg_productos_updated_at on public.productos;
create trigger trg_productos_updated_at
before update on public.productos
for each row execute function public.set_updated_at();

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

alter table public.categorias enable row level security;
alter table public.productos enable row level security;
alter table public.movimientos_inventario enable row level security;

-- Público: solo lectura de categorías activas y productos disponibles
create policy "publico_ver_categorias" on public.categorias
  for select using (activa = true);

create policy "publico_ver_productos" on public.productos
  for select using (disponible = true);

-- Admin autenticado: acceso total
create policy "admin_categorias" on public.categorias
  for all using (auth.role() = 'authenticated');

create policy "admin_productos" on public.productos
  for all using (auth.role() = 'authenticated');

create policy "admin_movimientos" on public.movimientos_inventario
  for all using (auth.role() = 'authenticated');

-- ============================================================
-- Datos de prueba
-- ============================================================

insert into public.categorias (nombre, descripcion, icono) values
  ('Desengrasantes', 'Limpieza de cocinas y superficies grasosas', '🧴'),
  ('Desinfectantes', 'Eliminación de bacterias y gérmenes', '🦠'),
  ('Detergentes', 'Lavado de ropa y vajilla', '🫧'),
  ('Jabones', 'Higiene personal y de manos', '🧼'),
  ('Ambientadores', 'Fragancias y eliminadores de olores', '🌸')
on conflict do nothing;
