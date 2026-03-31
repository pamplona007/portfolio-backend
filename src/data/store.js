import { v4 as uuidv4 } from 'uuid';

// In-memory data stores
const users = [];
const education = [];
const experiences = [];
const skills = [];
const projects = [];

export function generateId() {
  return uuidv4();
}

export function now() {
  return new Date().toISOString();
}

export function resetData() {
  users.length = 0;
  education.length = 0;
  experiences.length = 0;
  skills.length = 0;
  projects.length = 0;
}

export const db = {
  users,
  education,
  experiences,
  skills,
  projects,
};

export default db;
