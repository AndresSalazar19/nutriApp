/**
 * Limpia sintaxis Markdown de un texto para mostrarlo como chat plano.
 * Es una red de seguridad por si el modelo de IA no respeta el prompt
 * (p. ej. sigue devolviendo **negrita**, encabezados con # o listas con -).
 */
export function stripMarkdown(text: string): string {
  if (!text) return text;

  return text
    // Bloques de código ```code``` -> code
    .replace(/```([\s\S]*?)```/g, '$1')
    // Código en línea `code` -> code
    .replace(/`([^`]+)`/g, '$1')
    // Encabezados: "# Título", "## Título", etc.
    .replace(/^ {0,3}#{1,6}\s+/gm, '')
    // Negrita/cursiva: **texto**, __texto__, *texto*, _texto_
    .replace(/\*\*\*([^*]+)\*\*\*/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/\*([^*\n]+)\*/g, '$1')
    .replace(/_([^_\n]+)_/g, '$1')
    // Enlaces [texto](url) -> texto
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    // Viñetas de lista al inicio de línea: "- ", "* ", "+ "
    .replace(/^ {0,3}[-*+]\s+/gm, '')
    // Líneas de separación tipo "---" o "***"
    .replace(/^ {0,3}([-*_]){3,}\s*$/gm, '')
    .trim();
}
