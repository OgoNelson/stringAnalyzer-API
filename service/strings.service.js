const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Resolve data file path
const dbPath = path.join(__dirname, "../data/strings.json");

// Ensure data directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

// Helper to read JSON file
const readData = () => {
  if (!fs.existsSync(dbPath)) return [];
  const data = fs.readFileSync(dbPath, "utf8");
  return data ? JSON.parse(data) : [];
};

// Helper to write JSON file
const writeData = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

// Compute string properties
const analyzeString = (value) => {
  const cleanValue = value.toLowerCase();

  // ✅ Remove spaces and punctuation for analysis
  const alphanumericOnly = cleanValue.replace(/[^a-z0-9]/g, "");

  const length = value.length;

  // ✅ Palindrome check ignores spaces and punctuation
  const is_palindrome =
    alphanumericOnly === alphanumericOnly.split("").reverse().join("");

  // ✅ Unique characters (letters + digits only)
  const unique_characters = new Set(alphanumericOnly).size;

  // ✅ Word count (split by whitespace)
  const word_count = value.trim().length ? value.trim().split(/\s+/).length : 0;

  // ✅ SHA-256 hash for unique ID
  const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");

  // ✅ Character frequency map (letters + digits only)
  const character_frequency_map = {};
  for (const char of alphanumericOnly) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
};

// Save new string analysis
const saveString = (value) => {
  const strings = readData();
  const existing = strings.find((s) => s.value === value);

  if (existing) {
    return { error: "String already exists", status: 409 };
  }

  const properties = analyzeString(value);
  const newString = {
    id: properties.sha256_hash,
    value,
    properties,
    created_at: new Date().toISOString(),
  };

  strings.push(newString);
  writeData(strings);

  return { data: newString, status: 201 };
};

// Get all strings (with optional filtering)
const getAllStrings = (filters = {}) => {
  let strings = readData();

  if (filters.is_palindrome !== undefined) {
    strings = strings.filter(
      (s) => s.properties.is_palindrome === filters.is_palindrome
    );
  }
  if (filters.min_length !== undefined) {
    strings = strings.filter((s) => s.properties.length >= filters.min_length);
  }
  if (filters.max_length !== undefined) {
    strings = strings.filter((s) => s.properties.length <= filters.max_length);
  }
  if (filters.word_count !== undefined) {
    strings = strings.filter(
      (s) => s.properties.word_count === filters.word_count
    );
  }
  if (filters.contains_character) {
    strings = strings.filter((s) =>
      s.value.includes(filters.contains_character)
    );
  }

  return { data: strings, count: strings.length, filters_applied: filters };
};

// Get a specific string
const getString = (value) => {
  const strings = readData();
  const found = strings.find((s) => s.value === value);
  if (!found) return { error: "Not Found", status: 404 };
  return { data: found, status: 200 };
};

// Delete a string
const deleteString = (value) => {
  let strings = readData();
  const initialLength = strings.length;
  strings = strings.filter((s) => s.value !== value);

  if (strings.length === initialLength) {
    return { error: "Not Found", status: 404 };
  }

  writeData(strings);
  return { status: 204 };
};

module.exports = {
  analyzeString,
  saveString,
  getAllStrings,
  getString,
  deleteString,
};
