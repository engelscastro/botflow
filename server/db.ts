import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

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

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Async storage interface
class AsyncDB<T extends { id: string }> {
  private filePath: string;
  private tableName: string;
  private data: T[] = [];

  constructor(filename: string, tableName: string) {
    this.filePath = path.join(DATA_DIR, filename);
    this.tableName = tableName;
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

  async getAll(): Promise<T[]> {
    if (supabase) {
      const { data, error } = await supabase.from(this.tableName).select('*').order('createdAt', { ascending: true });
      if (!error && data) return data as T[];
      console.error(`Supabase error (getAll ${this.tableName}):`, error);
    }
    return [...this.data];
  }

  async getById(id: string): Promise<T | undefined> {
    if (supabase) {
      const { data, error } = await supabase.from(this.tableName).select('*').eq('id', id).single();
      if (!error && data) return data as T;
    }
    return this.data.find(item => item.id === id);
  }

  // Very simplistic find using local data for complex predicates, or simple equality for Supabase
  // We'll keep local data in sync for fallback and complex finds, or just fetch all
  async find(predicate: (item: T) => boolean): Promise<T | undefined> {
    if (supabase) {
      // In a real scenario, we'd translate predicate to Supabase query.
      // Here we fetch all and filter in memory since dataset is small.
      const all = await this.getAll();
      return all.find(predicate);
    }
    return this.data.find(predicate);
  }
  
  async filter(predicate: (item: T) => boolean): Promise<T[]> {
    if (supabase) {
      const all = await this.getAll();
      return all.filter(predicate);
    }
    return this.data.filter(predicate);
  }

  async upsert(item: T): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from(this.tableName).upsert(item);
      if (error) console.error(`Supabase error (upsert ${this.tableName}):`, error);
    }
    const index = this.data.findIndex(existing => existing.id === item.id);
    if (index >= 0) {
      this.data[index] = item;
    } else {
      this.data.push(item);
    }
    this.save();
  }

  async delete(id: string): Promise<void> {
    if (supabase) {
      const { error } = await supabase.from(this.tableName).delete().eq('id', id);
      if (error) console.error(`Supabase error (delete ${this.tableName}):`, error);
    }
    this.data = this.data.filter(item => item.id !== id);
    this.save();
  }
}

export const contactsDB = new AsyncDB<DBContact>('contacts.json', 'contacts');
export const appointmentsDB = new AsyncDB<Appointment>('appointments.json', 'appointments');
