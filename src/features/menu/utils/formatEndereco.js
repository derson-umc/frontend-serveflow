/**
 * Preposições e artigos do português que NÃO devem ser capitalizados
 * quando estão no meio de uma frase (exceto na primeira palavra).
 */
const LOWERCASE_PT = new Set([
  'do', 'da', 'de', 'dos', 'das',
  'a', 'e', 'o', 'os', 'as',
  'em', 'no', 'na', 'nos', 'nas',
  'ao', 'aos',
  'pelo', 'pela', 'pelos', 'pelas',
  'um', 'uma',
  'por', 'para', 'com',
]);

/**
 * Converte uma string para Title Case respeitando preposições/artigos em PT-BR.
 * Exemplo: "estrada do areião" → "Estrada do Areião"
 */
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split(' ')
    .map((word, i) => {
      if (!word) return word;
      // Primeira palavra sempre capitalizada; demais respeitam a lista
      if (i > 0 && LOWERCASE_PT.has(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/** Heurística: o segmento é um número de logradouro? */
const isNumero = (s) =>
  /^\d/.test(s.trim()) ||     // começa com dígito: "55", "2B", "1200"
  /^s\/n$/i.test(s.trim());   // sem número

/**
 * Formata um endereço cru no padrão estruturado:
 *   "estrada do areião, 55, adega encontro nordestino"
 *   → "Estrada do Areião, Nº 55, Complemento: Adega Encontro Nordestino"
 *
 * Suporta ausência de número e/ou complemento.
 *
 * @param {string|null|undefined} raw  Endereço como string simples
 * @returns {string}
 */
export function formatEndereco(raw) {
  if (!raw || !raw.trim()) return '';

  const partes = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (partes.length === 0) return '';

  const logradouro = toTitleCase(partes[0]);

  if (partes.length === 1) return logradouro;

  let numero = null;
  let complementoPartes = [];

  if (isNumero(partes[1])) {
    numero = partes[1];
    complementoPartes = partes.slice(2);
  } else {
    // Sem número — tudo a partir do índice 1 é complemento
    complementoPartes = partes.slice(1);
  }

  let resultado = logradouro;
  if (numero)                   resultado += `, Nº ${numero}`;
  if (complementoPartes.length) resultado += `, Complemento: ${toTitleCase(complementoPartes.join(', '))}`;

  return resultado;
}
