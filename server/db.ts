import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface DBContact {
  id: string;
  phone: string;
  name?: string;
  cpf?: string;
  email?: string;
  customFields: Record<string, string>;
  createdAt: string;
}

export interface Appointment {
  id: string;
  contactId: string;
  date: string; // ISO format
  service: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  createdAt: string;
}

// Simple JSON storage
class JsonDB<T extends { id: string }> {
  private filePath: string;
  private data: T[] = [];

  constructor(filename: string) {
    this.filePath = path.join(DATA_DIR, filename);
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(fileContent);
      }
    } catch (err) {
      console.error(`Error loading DB ${this.filePath}`, err);
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`Error saving DB ${this.filePath}`, err);
    }
  }

  getAll(): T[] {
    return [...this.data];
  }

  getById(id: string): T | undefined {
    return this.data.find(item => item.id === id);
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.data.find(predicate);
  }
  
  filter(predicate: (item: T) => boolean): T[] {
    return this.data.filter(predicate);
  }

  upsert(item: T) {
    const index = this.data.findIndex(existing => existing.id === item.id);
    if (index >= 0) {
      this.data[index] = item;
    } else {
      this.data.push(item);
    }
    this.save();
  }

  delete(id: string) {
    this.data = this.data.filter(item => item.id !== id);
    this.save();
  }
}

export const contactsDB = new JsonDB<DBContact>('contacts.json');
export const appointmentsDB = new JsonDB<Appointment>('appointments.json');
