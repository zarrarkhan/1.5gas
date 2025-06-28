export type ParsedCountry = {
  name: string;
  iso: string;
  essIndex: number | null;
  indicators: Record<string, number>;
};

export const parseCSV = (csvText: string): Map<string, ParsedCountry> => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = new Map<string, ParsedCountry>();

  const isoIndex = headers.indexOf('ISO_A3');
  const nameIndex = headers.indexOf('Country Name');
  const essIndexIndex = headers.indexOf('ESS Index');

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    const iso = values[isoIndex]?.replace(/"/g, '').trim();
    const name = values[nameIndex]?.replace(/"/g, '').trim();

    if (!iso || !name) continue;

    const essIndexRaw = values[essIndexIndex];
    const essIndex = isNaN(parseFloat(essIndexRaw)) ? null : parseFloat(essIndexRaw);

    const indicators: Record<string, number> = {};
    headers.forEach((header, j) => {
      if (!['Country Name', 'ISO_A3', 'ESS Index'].includes(header)) {
        const parsed = parseFloat(values[j]);
        if (!isNaN(parsed)) indicators[header] = parsed;
      }
    });

    data.set(iso, { name, iso, essIndex, indicators });
  }

  return data;
};
