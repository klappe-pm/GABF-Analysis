// Grouping is presentation only; saved tickets retain the category names in the project config.
export const CATEGORY_GROUPS = {
  change: ['Bug', 'New feature', 'Remove'],
  content: ['Content', 'Data', 'Heading', 'Images', 'Videos'],
  appearance: ['Colors', 'Footer', 'Header', 'Icon', 'Layout', 'Typography'],
  interaction: ['Accessibility', 'Action', 'Functionality', 'Link', 'Mobile'],
};

export function categoryGroups(categories) {
  const assigned = new Set(Object.values(CATEGORY_GROUPS).flat());
  return [
    ...Object.entries(CATEGORY_GROUPS).map(([key, members]) => ({ key, categories: members.filter((name) => categories.includes(name)) })),
    { key: 'additional', categories: categories.filter((name) => name !== 'Other' && !assigned.has(name)) },
  ].filter((group) => group.categories.length);
}

export function feedbackDetails(note, other, categories) {
  const detail = other.trim();
  return {
    text: detail ? `${note.trim()}\n\nOther details: ${detail}` : note.trim(),
    categories: [...new Set([...categories.filter((name) => name !== 'Other'), ...(detail ? ['Other'] : [])])],
  };
}
