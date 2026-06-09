import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'sf_categories';

export const BASE_CATEGORIES = [
  'Pratos Principais', 'Pratos à La Carte', 'Sucos', 'Promoção',
  'Cervejas', 'Bebidas', 'Sobremesas', 'Acompanhamentos', 'Porções',
];

export function toTitleCase(s) {
  return String(s ?? '').toLowerCase().replace(
    /(^|\s|-|\/)([\p{L}])/gu,
    (_, sep, ch) => sep + ch.toUpperCase()
  );
}

export function normalizeCategory(s) {
  return String(s ?? '').trim().toLowerCase();
}

function deduplicateCategories(list) {
  const seen = new Map();
  for (const raw of list) {
    if (!raw) continue;
    const key = normalizeCategory(raw);
    if (!seen.has(key)) seen.set(key, toTitleCase(raw));
  }
  return [...seen.values()];
}

function loadStoredCategories() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

export function useProductCategories(productCategories = []) {
  const [customCategories, setCustomCategories] = useState(loadStoredCategories);

  const allCategories = useMemo(
    () => deduplicateCategories([...BASE_CATEGORIES, ...customCategories, ...productCategories]),
    [customCategories, productCategories]
  );

  const persist = useCallback((updated) => {
    setCustomCategories(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addCategory = useCallback((name) => {
    const title = toTitleCase(name.trim());
    if (!title || allCategories.some((c) => normalizeCategory(c) === normalizeCategory(title))) {
      return false;
    }
    persist([...customCategories, title]);
    return true;
  }, [allCategories, customCategories, persist]);

  const renameCategory = useCallback((oldName, newName) => {
    const newTitle = toTitleCase(newName.trim());
    if (!newTitle || normalizeCategory(oldName) === normalizeCategory(newTitle)) return false;
    if (allCategories.some((c) => normalizeCategory(c) === normalizeCategory(newTitle))) return false;
    persist(customCategories.map((c) =>
      normalizeCategory(c) === normalizeCategory(oldName) ? newTitle : c
    ));
    return true;
  }, [allCategories, customCategories, persist]);

  const deleteCategory = useCallback((name) => {
    persist(customCategories.filter((c) => normalizeCategory(c) !== normalizeCategory(name)));
  }, [customCategories, persist]);

  const isCustom = useCallback((name) =>
    customCategories.some((c) => normalizeCategory(c) === normalizeCategory(name)),
    [customCategories]
  );

  return { allCategories, customCategories, addCategory, renameCategory, deleteCategory, isCustom };
}
