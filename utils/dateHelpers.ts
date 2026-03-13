// utils/dateHelpers.ts
export const getLast14Days = () => {
  return Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0]; // Format YYYY-MM-DD
  });
};

export const formatDateIndo = (dateStr: string) => {
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return new Date(dateStr).toLocaleDateString('id-ID', options);
};