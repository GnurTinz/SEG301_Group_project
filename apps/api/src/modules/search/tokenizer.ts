/**
 * Điểm Mới — Phase 2 Search Engine: Text Processing & Tokenizer Engine
 * Specialized for Vietnamese, technical English, and multilingual computing terminology.
 */

// Comprehensive Vietnamese stop words list
export const VIETNAMESE_STOP_WORDS = new Set([
  'và', 'là', 'của', 'những', 'các', 'trong', 'có', 'cho', 'với', 'được', 
  'về', 'thì', 'mà', 'ở', 'từ', 'này', 'khi', 'đã', 'sẽ', 'đang', 'như', 
  'ra', 'vào', 'lại', 'đến', 'theo', 'để', 'bởi', 'lên', 'do', 'qua', 'sau', 
  'trước', 'nhất', 'rất', 'nhiều', 'cũng', 'hoặc', 'tại', 'bằng', 'vẫn', 
  'đều', 'phải', 'chỉ', 'nào', 'gì', 'ai', 'sao', 'đâu', 'cùng', 'tới',
  'bị', 'nên', 'vì', 'thế', 'vậy', 'hãy', 'cả', 'tuy', 'dù', 'ngay',
  // Common English stop words in tech papers
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
  'by', 'from', 'is', 'are', 'was', 'were', 'it', 'its', 'as', 'that', 'this'
]);

/**
 * Normalizes Unicode diacritics and converts to lowercase
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Strips Vietnamese diacritics / accents for accent-insensitive fallback matching
 */
export function removeDiacritics(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd');
}

/**
 * Tokenizes input string into normalized word tokens.
 * Supports Vietnamese compound word n-grams (e.g. "trí tuệ", "học máy").
 */
export function tokenize(
  text: string, 
  options: { 
    removeStopWords?: boolean; 
    includeBigrams?: boolean;
    generateBigrams?: boolean;
    minTokenLength?: number;
  } = {}
): string[] {
  const { 
    removeStopWords = true, 
    includeBigrams = false,
    generateBigrams = false,
    minTokenLength = 1 
  } = options;

  const shouldIncludeBigrams = includeBigrams || generateBigrams;

  if (!text || typeof text !== 'string') return [];

  const normalized = normalizeText(text);

  // Split on punctuation, whitespace, symbols while keeping alphanumeric tokens and hyphens inside words
  // Match word characters, including Vietnamese Unicode range (\p{L}) and numbers (\p{N})
  const rawTokens = normalized
    .replace(/[^\p{L}\p{N}_\s-]/gu, ' ')
    .split(/\s+/)
    .map((t) => t.trim().replace(/^[-_]+|[-_]+$/g, ''))
    .filter((t) => t.length >= minTokenLength);

  const filteredTokens: string[] = [];
  for (const token of rawTokens) {
    if (removeStopWords && VIETNAMESE_STOP_WORDS.has(token)) {
      continue;
    }
    filteredTokens.push(token);
  }

  // Optionally generate compound bigrams for Vietnamese (e.g., "trí tuệ", "nhân tạo")
  if (shouldIncludeBigrams && filteredTokens.length > 1) {
    const bigrams: string[] = [];
    for (let i = 0; i < filteredTokens.length - 1; i++) {
      bigrams.push(`${filteredTokens[i]} ${filteredTokens[i + 1]}`);
      bigrams.push(`${filteredTokens[i]}_${filteredTokens[i + 1]}`);
    }
    return [...filteredTokens, ...bigrams];
  }

  return filteredTokens;
}

/**
 * Computes term frequencies (TF) for a token array
 */
export function countTermFrequencies(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  for (const token of tokens) {
    tf.set(token, (tf.get(token) ?? 0) + 1);
  }
  return tf;
}
