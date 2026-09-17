import { BroadcastContact } from '../types';

/**
 * Auto-detects the delimiter in a CSV text (comma, semicolon, tab, pipe)
 */
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/)[0] || '';
  const counts: Record<string, number> = {
    ';': (firstLine.match(/;/g) || []).length,
    ',': (firstLine.match(/,/g) || []).length,
    '\t': (firstLine.match(/\t/g) || []).length,
    '|': (firstLine.match(/\|/g) || []).length,
  };

  let maxDelim = ';';
  let maxCount = -1;
  for (const [delim, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxDelim = delim;
    }
  }
  return maxCount > 0 ? maxDelim : ';';
}

/**
 * Normalizes phone numbers specifically for WhatsApp (E.164 without '+' or Baileys format)
 * and generates a readable display string
 */
export function normalizeAndFormatPhone(rawPhone: string): { rawDigits: string; formatted: string; isValid: boolean } {
  let digits = rawPhone.replace(/\D/g, '');

  if (!digits || digits.length < 8) {
    return {
      rawDigits: digits,
      formatted: rawPhone.trim() || 'Inválido',
      isValid: false,
    };
  }

  // If number starts with 0 (e.g. 082999998888), strip the leading 0
  if (digits.startsWith('0') && digits.length >= 11) {
    digits = digits.substring(1);
  }

  // Brazil standard: 10 or 11 digits (DDD + 8 or 9 digits) -> Prepend 55 (Brazil DDI)
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }

  // Format nicely for UI
  let formatted = `+${digits}`;
  if (digits.startsWith('55') && digits.length === 13) {
    // +55 (DD) 9XXXX-XXXX
    const ddd = digits.slice(2, 4);
    const part1 = digits.slice(4, 9);
    const part2 = digits.slice(9, 13);
    formatted = `+55 (${ddd}) ${part1}-${part2}`;
  } else if (digits.startsWith('55') && digits.length === 12) {
    // +55 (DD) XXXX-XXXX
    const ddd = digits.slice(2, 4);
    const part1 = digits.slice(4, 8);
    const part2 = digits.slice(8, 12);
    formatted = `+55 (${ddd}) ${part1}-${part2}`;
  }

  const isValid = digits.length >= 10 && digits.length <= 15;

  return {
    rawDigits: digits,
    formatted,
    isValid,
  };
}

/**
 * Parses raw CSV lines handling quotes and delimiters properly
 */
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses CSV content with two columns: Column 1 = Name, Column 2 = Phone
 */
export function parseCSVContacts(csvContent: string): {
  contacts: BroadcastContact[];
  total: number;
  validCount: number;
  invalidCount: number;
  errors: string[];
} {
  const errors: string[] = [];
  const contacts: BroadcastContact[] = [];

  if (!csvContent || !csvContent.trim()) {
    return { contacts: [], total: 0, validCount: 0, invalidCount: 0, errors: ['O arquivo CSV está vazio.'] };
  }

  const rawLines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (rawLines.length === 0) {
    return { contacts: [], total: 0, validCount: 0, invalidCount: 0, errors: ['Nenhuma linha encontrada no CSV.'] };
  }

  const delimiter = detectDelimiter(csvContent);

  // Check if first line is a header
  const firstLineCols = parseCSVLine(rawLines[0], delimiter).map(c => c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  const isHeader = firstLineCols.some(col => 
    col.includes('nome') || 
    col.includes('name') || 
    col.includes('cliente') || 
    col.includes('contato') || 
    col.includes('tel') || 
    col.includes('phone') || 
    col.includes('cel') || 
    col.includes('whatsapp')
  );

  const dataLines = isHeader ? rawLines.slice(1) : rawLines;

  if (dataLines.length === 0) {
    return { contacts: [], total: 0, validCount: 0, invalidCount: 0, errors: ['O CSV contém apenas o cabeçalho, sem contatos válidos.'] };
  }

  let validCount = 0;
  let invalidCount = 0;

  dataLines.forEach((line, index) => {
    const cols = parseCSVLine(line, delimiter);
    if (cols.length === 0 || (cols.length === 1 && !cols[0])) return;

    let rawName = (cols[0] || '').replace(/^["']|["']$/g, '').trim();
    let rawPhone = (cols[1] || '').replace(/^["']|["']$/g, '').trim();

    // If only 1 column was passed, check if it's name or phone
    if (!rawPhone && cols.length === 1) {
      if (/\d{8,}/.test(rawName)) {
        rawPhone = rawName;
        rawName = `Contato ${index + 1}`;
      }
    }

    if (!rawName && rawPhone) {
      rawName = `Contato ${index + 1}`;
    }

    const { rawDigits, formatted, isValid } = normalizeAndFormatPhone(rawPhone);

    const contact: BroadcastContact = {
      id: `bc-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      name: rawName || `Contato ${index + 1}`,
      phone: rawDigits,
      formattedPhone: formatted,
      status: isValid ? 'pending' : 'invalid',
      error: isValid ? undefined : 'Telefone inválido ou incompleto',
    };

    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
    }

    contacts.push(contact);
  });

  return {
    contacts,
    total: contacts.length,
    validCount,
    invalidCount,
    errors,
  };
}

/**
 * Evaluates Spintax like "{Olá|Oi|Opa} {{nome}}, tudo bem?"
 */
export function parseSpintax(text: string): string {
  const spintaxRegex = /\{([^{}]+)\}/g;
  let result = text;
  while (spintaxRegex.test(result)) {
    result = result.replace(spintaxRegex, (_, match) => {
      // Don't replace template tags like {nome} as spintax if no pipe exists
      if (!match.includes('|')) {
        return `{${match}}`;
      }
      const options = match.split('|');
      const chosen = options[Math.floor(Math.random() * options.length)];
      return chosen.trim();
    });
  }
  return result;
}

/**
 * Returns dynamic greeting based on current local hour
 */
export function getDynamicGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Processes message template variables and Spintax for a specific contact
 */
export function processMessageTemplate(template: string, contact: { name: string; formattedPhone?: string; phone?: string }): string {
  if (!template) return '';

  let message = template;

  const firstName = (contact.name || '').trim().split(' ')[0] || 'Cliente';
  const fullName = (contact.name || 'Cliente').trim();
  const phone = contact.formattedPhone || contact.phone || '';
  const greeting = getDynamicGreeting();

  // Replace variable tags (support both {{tag}} and {tag})
  message = message.replace(/\{\{\s*nome\s*\}\}/gi, fullName);
  message = message.replace(/\{\{\s*name\s*\}\}/gi, fullName);
  message = message.replace(/\{\{\s*cliente\s*\}\}/gi, fullName);
  message = message.replace(/\{\s*nome\s*\}/gi, fullName);

  message = message.replace(/\{\{\s*primeiro_nome\s*\}\}/gi, firstName);
  message = message.replace(/\{\{\s*primeiro nome\s*\}\}/gi, firstName);
  message = message.replace(/\{\{\s*first_name\s*\}\}/gi, firstName);
  message = message.replace(/\{\s*primeiro_nome\s*\}/gi, firstName);

  message = message.replace(/\{\{\s*telefone\s*\}\}/gi, phone);
  message = message.replace(/\{\{\s*phone\s*\}\}/gi, phone);
  message = message.replace(/\{\s*telefone\s*\}/gi, phone);

  message = message.replace(/\{\{\s*saudacao\s*\}\}/gi, greeting);
  message = message.replace(/\{\{\s*greeting\s*\}\}/gi, greeting);
  message = message.replace(/\{\s*saudacao\s*\}/gi, greeting);

  // Parse spintax options
  message = parseSpintax(message);

  return message;
}

/**
 * Generates sample CSV template for users to download
 */
export function generateCSVTemplate(): string {
  return `Nome;Telefone
João da Silva;82993530493
Maria Santos;11987654321
Carlos Eduardo Oliveira;21998765432
Ana Paula Souza;31988776655
Lucas Fernandes;41991234567`;
}

/**
 * Exports dispatch execution report to CSV format
 */
export function exportContactsReportToCSV(contacts: BroadcastContact[], campaignName = 'Disparo em Massa'): string {
  const header = 'Nome;Telefone_Formatado;Telefone_Whatsapp;Status;Horario_Envio;Detalhes\n';
  const rows = contacts.map(c => {
    const statusLabel = 
      c.status === 'sent' ? 'Enviado com Sucesso' :
      c.status === 'failed' ? 'Falha no Envio' :
      c.status === 'invalid' ? 'Telefone Inválido' :
      c.status === 'sending' ? 'Em Envio' : 'Pendente';

    const cleanName = `"${c.name.replace(/"/g, '""')}"`;
    const cleanError = c.error ? `"${c.error.replace(/"/g, '""')}"` : 'OK';
    return `${cleanName};${c.formattedPhone};${c.phone};${statusLabel};${c.sentAt || '-'};${cleanError}`;
  }).join('\n');

  return header + rows;
}
