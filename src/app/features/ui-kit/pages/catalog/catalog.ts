import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormField, email, form, required } from '@angular/forms/signals';

import {
  BB_ICON_NAMES,
  BbAvatar,
  BbBadge,
  BbButton,
  BbCard,
  BbCheckbox,
  BbChip,
  BbEmptyState,
  BbField,
  BbFormMessage,
  BbIcon,
  BbIconButton,
  BbIconTile,
  BbInput,
  BbInputAction,
  BbLogo,
  BbNote,
  BbStatCard,
  BbStatusCircle,
  BbStep,
} from '../../../../shared/ui';

/**
 * Catálogo de desarrollo de `shared/ui/`: renderiza cada primitivo en los estados
 * que declara el SPEC 03 para poder compararlos contra `references/viaticos-bambu-kit/screens/`
 * y correr AXE sobre todos de una vez.
 *
 * No es una pantalla del producto.
 */
@Component({
  selector: 'app-catalog',
  imports: [
    BbAvatar,
    BbBadge,
    BbButton,
    BbCard,
    BbCheckbox,
    BbChip,
    BbEmptyState,
    BbField,
    BbFormMessage,
    BbIcon,
    BbIconButton,
    BbIconTile,
    BbInput,
    BbInputAction,
    BbLogo,
    BbNote,
    BbStatCard,
    BbStatusCircle,
    BbStep,
    FormField,
    JsonPipe,
  ],
  host: { class: 'block min-h-screen bg-bb-black text-bb-text' },
  template: `
    <div class="mx-auto flex max-w-[1180px] flex-col gap-12 px-4 py-10 md:px-10">
      <header class="flex flex-col gap-4">
        <bb-logo [width]="176" [priority]="true" />
        <h1 class="m-0 text-bb-h2 font-bold leading-bb-tight">
          Catálogo de <span class="italic text-bb-green">primitivos</span>
        </h1>
        <p class="m-0 text-base leading-normal text-bb-text-muted">
          Los 18 componentes de <code>shared/ui/</code> en todos los estados que declara el SPEC 03.
        </p>
      </header>

      <!-- Iconos -->
      <section class="flex flex-col gap-4">
        <h2 class="m-0 text-lg font-bold">bb-icon — {{ iconNames.length }} iconos</h2>
        <ul class="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-3 p-0">
          @for (name of iconNames; track name) {
            <li
              class="flex flex-col items-center gap-2 rounded-lg border border-bb-border-subtle p-3 text-bb-green"
            >
              <bb-icon [name]="name" [size]="24" />
              <span class="text-center text-bb-xs text-bb-text-subtle">{{ name }}</span>
            </li>
          }
        </ul>
      </section>

      <!-- Botones -->
      <section class="flex flex-col gap-4">
        <h2 class="m-0 text-lg font-bold">bb-button</h2>
        <div class="grid gap-4 md:grid-cols-2">
          <button type="button" bb-button variant="primary" size="lg" fit="block">
            Iniciar sesión <bb-icon name="arrow-right" [size]="18" />
          </button>
          <button type="button" bb-button variant="secondary" size="lg" fit="block">
            Reenviar correo
          </button>
          <button type="button" bb-button variant="primary" size="lg" fit="block" disabled>
            Primario deshabilitado
          </button>
          <button type="button" bb-button variant="secondary" size="lg" fit="block" disabled>
            Secundario deshabilitado
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-4">
          <a bb-button variant="primary" size="md" fit="block-mobile" href="#catalogo-anclas">
            <bb-icon name="plus" [size]="18" /> Nuevo reporte de gastos
          </a>
          <a bb-button variant="primary" size="md" fit="inline" href="#catalogo-anclas">
            Ancla en línea
          </a>
          <a bb-button variant="primary" size="md" fit="inline" disabled>Ancla deshabilitada</a>
        </div>
        <p id="catalogo-anclas" class="m-0 text-bb-xs text-bb-text-subtle">
          Las anclas deshabilitadas no navegan: llevan <code>aria-disabled</code> y
          <code>tabindex="-1"</code>.
        </p>
      </section>

      <!-- Botones de icono -->
      <section class="flex flex-col gap-4">
        <h2 class="m-0 text-lg font-bold">bb-icon-button</h2>
        <div class="flex flex-wrap items-center gap-4">
          <button type="button" bb-icon-button variant="ghost" aria-label="Mostrar contraseña">
            <bb-icon name="eye" />
          </button>
          <button type="button" bb-icon-button variant="outlined" aria-label="Notificaciones">
            <bb-icon name="bell" />
          </button>
        </div>
      </section>

      <!-- Campos -->
      <section class="flex flex-col gap-6">
        <h2 class="m-0 text-lg font-bold">bb-field · bb-input · bb-form-message</h2>
        <div class="grid gap-6 md:grid-cols-2">
          <bb-field label="Correo corporativo">
            <bb-input
              icon="mail"
              type="email"
              placeholder="nombre@bambu-techservices.com"
              autocomplete="email"
            />
          </bb-field>

          <bb-field label="Contraseña">
            <a bbFieldAction class="text-sm no-underline" href="#catalogo-anclas"
              >¿Olvidaste tu contraseña?</a
            >
            <bb-input icon="lock" type="password" placeholder="Tu contraseña">
              <button type="button" bbInputAction bb-icon-button aria-label="Mostrar contraseña">
                <bb-icon name="eye" />
              </button>
            </bb-input>
          </bb-field>

          <bb-field label="Campo con error">
            <bb-input status="error" placeholder="Escribe algo" />
            <bb-form-message tone="error">Las contraseñas no coinciden.</bb-form-message>
          </bb-field>

          <bb-field label="Campo correcto">
            <bb-input status="ok" placeholder="Escribe algo" />
            <bb-form-message tone="ok">Las contraseñas coinciden.</bb-form-message>
          </bb-field>

          <bb-field label="Campo deshabilitado" hint="Este campo no admite edición.">
            <bb-input [disabled]="true" placeholder="No editable" />
          </bb-field>

          <bb-field label="Campo sin icono ni acción">
            <bb-input placeholder="Solo texto" />
          </bb-field>
        </div>
      </section>

      <!-- Signal Forms en vivo -->
      <section class="flex flex-col gap-4">
        <h2 class="m-0 text-lg font-bold">Enlace con &#64;angular/forms/signals</h2>
        <div class="grid gap-6 md:grid-cols-2">
          <bb-field label="Correo (validado)">
            <bb-input
              [formField]="loginForm.email"
              icon="mail"
              type="email"
              placeholder="tu@correo.com"
            />
            @if (loginForm.email().touched() && loginForm.email().invalid()) {
              <bb-form-message tone="error">Escribe un correo válido.</bb-form-message>
            }
          </bb-field>

          <div class="flex flex-col gap-3">
            <bb-checkbox [formField]="loginForm.remember">
              Mantener la sesión iniciada en este equipo
            </bb-checkbox>
            <bb-checkbox [checked]="true">Casilla marcada (sin formulario)</bb-checkbox>
            <bb-checkbox [disabled]="true">Casilla deshabilitada</bb-checkbox>
          </div>
        </div>
        <pre
          class="m-0 overflow-x-auto rounded-lg border border-bb-border-subtle bg-bb-surface p-4 text-bb-xs text-bb-text-2"
          >{{ loginModel() | json }}</pre>
      </section>

      <!-- Presentación -->
      <section class="flex flex-col gap-4">
        <h2 class="m-0 text-lg font-bold">bb-badge · bb-chip · bb-note</h2>
        <div class="flex flex-wrap items-center gap-4">
          <bb-badge>HERRAMIENTA INTERNA</bb-badge>
          <bb-chip icon="user">nombre&#64;bambu-techservices.com</bb-chip>
        </div>
        <bb-note icon="shield-check">
          ¿Aún no tienes acceso? Esta es una herramienta interna: solicita tu alta al área de TI de
          Bambú.
        </bb-note>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="m-0 text-lg font-bold">bb-icon-tile · bb-status-circle · bb-avatar</h2>
        <div class="flex flex-wrap items-center gap-6">
          <bb-icon-tile icon="key" />
          <bb-status-circle icon="check" />
          <bb-status-circle icon="mail-check" />
          <div class="flex items-center gap-3">
            <bb-avatar name="Juan Manuel Galindo" />
            <span class="text-sm">Juan Manuel Galindo</span>
          </div>
        </div>
      </section>

      <!-- Tarjetas -->
      <section class="flex flex-col gap-4">
        <h2 class="m-0 text-lg font-bold">bb-stat-card</h2>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <bb-stat-card label="Borradores" [value]="0" />
          <bb-stat-card label="En revisión" [value]="0" />
          <bb-stat-card label="Aprobados" [value]="0" />
          <bb-stat-card label="Por reembolsar" value="$0.00" unit="MXN" [highlight]="true" />
        </div>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <bb-stat-card label="Monto largo" value="$1,234,567.89" unit="MXN" [highlight]="true" />
        </div>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="m-0 text-lg font-bold">bb-card · bb-empty-state</h2>
        <bb-card heading="Reportes recientes">
          <a bbCardAction class="text-sm no-underline" href="#catalogo-anclas">Ver todos</a>
          <bb-empty-state
            icon="report"
            title="Aún no tienes reportes"
            text="Crea tu primer reporte para registrar los gastos de tu viaje y enviarlos a aprobación."
          />
        </bb-card>
        <bb-card>
          <p class="m-0 p-6 text-sm text-bb-text-muted">Tarjeta sin encabezado.</p>
        </bb-card>
      </section>

      <section class="flex flex-col gap-4">
        <h2 class="m-0 text-lg font-bold">bb-step</h2>
        <div class="grid gap-4 md:grid-cols-3">
          <bb-step
            [number]="1"
            title="Crea el reporte"
            text="Indica el viaje, las fechas y el proyecto o cliente."
          />
          <bb-step
            [number]="2"
            title="Sube tus comprobantes"
            text="Agrega cada gasto con su factura (XML y PDF) o ticket."
          />
          <bb-step
            [number]="3"
            title="Envíalo a aprobación"
            text="Da seguimiento al estatus hasta tu reembolso."
          />
        </div>
      </section>
    </div>
  `,
})
export class Catalog {
  protected readonly iconNames = BB_ICON_NAMES;

  protected readonly loginModel = signal({ email: '', remember: false });

  /** Formulario mínimo que demuestra el enlace de `bb-input` y `bb-checkbox` con un `FieldTree`. */
  protected readonly loginForm = form(this.loginModel, (path) => {
    required(path.email);
    email(path.email);
  });
}
