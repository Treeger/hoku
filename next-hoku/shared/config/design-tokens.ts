/**
 * Design Tokens для Hoku
 *
 * Единая цветовая палитра и типы для сегментов.
 * Используется для динамического изменения --hero-bg-tint в зависимости от сегмента.
 */


/**
 * Базовые цветовые токены (HSL без hsl())
 */
export const DESIGN_TOKENS = {
  baseBg: "249 250 251",        // #F9FAFB
  surface1: "0 0% 100%",        // #FFFFFF
  surface2: "241 243 245",      // #F1F3F5
  surface3: "42 38% 93%",       // #F2ECE2 (warm beige)
  accent: "44 100% 49%",        // #FAB700
  textPrimary: "17 24 39",      // #111827
  textSecondary: "75 85 99",    // #4B5563
} as const;

/**
 * Градиенты для CTA-кнопок
 */
export const GRADIENTS = {
  brand: "linear-gradient(135deg, #FFD34E 0%, #FBBF24 100%)",
} as const;

/**
 * Тени (two-layer realistic shadows)
 */
export const SHADOWS = {
  small: "0 0.5px 0.5px rgba(0, 0, 0, 0.05), 0 -0.5px 0.5px rgba(255, 255, 255, 0.6) inset",
  medium: "0 1px 2px rgba(0, 0, 0, 0.08), 0 -1px 1px rgba(255, 255, 255, 0.7) inset",
  large: "0 4px 12px rgba(0, 0, 0, 0.1), 0 -2px 4px rgba(255, 255, 255, 0.8) inset",
} as const;
