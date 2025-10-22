const stringService = require("../service/strings.service");
const crypto = require("crypto");
const db = new Map(); // temporary in-memory store

const analyzeString = (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: "Missing 'value' field" });
    }
    if (typeof value !== "string") {
      return res.status(422).json({ error: "'value' must be a string" });
    }

    const hash = crypto.createHash("sha256").update(value).digest("hex");
    if (db.has(hash)) {
      return res.status(409).json({ error: "String already exists" });
    }

    const cleaned = value.replace(/\s+/g, " ");
    const properties = {
      length: cleaned.length,
      is_palindrome:
        cleaned.toLowerCase().replace(/\s+/g, "") ===
        cleaned.toLowerCase().replace(/\s+/g, "").split("").reverse().join(""),
      unique_characters: new Set(cleaned.replace(/\s+/g, "").toLowerCase())
        .size,
      word_count: cleaned.trim().split(/\s+/).length,
      sha256_hash: hash,
      character_frequency_map: [...cleaned.toLowerCase()].reduce((acc, ch) => {
        if (ch !== " ") acc[ch] = (acc[ch] || 0) + 1;
        return acc;
      }, {}),
    };

    const data = {
      id: hash,
      value,
      properties,
      created_at: new Date().toISOString(),
    };

    db.set(hash, data);
    return res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /strings
// const createString = (req, res) => {
//   const { value } = req.body;
//   if (value === undefined) {
//     return res.status(404).json({ error: "Missing 'value' field" });
//   }
//   if (typeof value !== "string") {
//     return res.status(422).json({ error: "'value' must be a string" });
//   }

//   const result = stringService.saveString(value);
//   if (result.error) {
//     return res.status(result.status).json({ error: result.error });
//   }

//   return res.status(201).json(result.data);
// };

// GET /strings/:value
const getString = (req, res) => {
  const { value } = req.params;
  const result = stringService.getString(value);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  return res.status(200).json(result.data);
};

// GET /strings (with filters)
const getAllStrings = (req, res) => {
  try {
    const {
      is_palindrome,
      min_length,
      max_length,
      word_count,
      contains_character,
    } = req.query;

    let results = [...db.values()];

    if (is_palindrome !== undefined)
      results = results.filter(
        (s) => s.properties.is_palindrome === (is_palindrome === "true")
      );
    if (min_length)
      results = results.filter(
        (s) => s.properties.length >= parseInt(min_length)
      );
    if (max_length)
      results = results.filter(
        (s) => s.properties.length <= parseInt(max_length)
      );
    if (word_count)
      results = results.filter(
        (s) => s.properties.word_count === parseInt(word_count)
      );
    if (contains_character)
      results = results.filter((s) =>
        s.value.toLowerCase().includes(contains_character.toLowerCase())
      );

    res.status(200).json({
      data: results,
      count: results.length,
      filters_applied: req.query,
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid query parameters" });
  }
};


// GET /strings/filter-by-natural-language
const filterByNaturalLanguage = (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  const lower = query.toLowerCase();
  const filters = {};

  if (lower.includes("palindromic")) filters.is_palindrome = true;
  if (lower.includes("single word")) filters.word_count = 1;
  if (lower.match(/longer than (\d+)/))
    filters.min_length = parseInt(lower.match(/longer than (\d+)/)[1]);
  if (lower.includes("containing the letter")) {
    const match = lower.match(/letter (\w)/);
    if (match) filters.contains_character = match[1];
  }

  let results = [...db.values()];
  if (filters.is_palindrome)
    results = results.filter((s) => s.properties.is_palindrome);
  if (filters.word_count)
    results = results.filter(
      (s) => s.properties.word_count === filters.word_count
    );
  if (filters.min_length)
    results = results.filter((s) => s.properties.length > filters.min_length);
  if (filters.contains_character)
    results = results.filter((s) =>
      s.value.toLowerCase().includes(filters.contains_character)
    );

  return res.status(200).json({
    data: results,
    count: results.length,
    interpreted_query: {
      original: query,
      parsed_filters: filters,
    },
  });
};


// DELETE /strings/:value
const deleteString = (req, res) => {
  const value = req.params.string_value;
  const hash = crypto.createHash("sha256").update(value).digest("hex");

  if (!db.has(hash)) return res.status(404).json({ error: "Not Found" });

  db.delete(hash);
  return res.status(204).send();
};


module.exports = {
  analyzeString,
  getString,
  getAllStrings,
  filterByNaturalLanguage,
  deleteString,
};
