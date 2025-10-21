const stringService = require("../service/strings.service");

// POST /strings
const createString = (req, res) => {
  const { value } = req.body;
  if (value === undefined) {
    return res.status(400).json({ error: "Missing 'value' field" });
  }
  if (typeof value !== "string") {
    return res.status(422).json({ error: "'value' must be a string" });
  }

  const result = stringService.saveString(value);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(201).json(result.data);
};

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
  const filters = {};

  if (req.query.is_palindrome !== undefined) {
    if (
      req.query.is_palindrome !== "true" &&
      req.query.is_palindrome !== "false"
    ) {
      return res.status(400).json({ error: "Invalid value for is_palindrome" });
    }
    filters.is_palindrome = req.query.is_palindrome === "true";
  }

  if (req.query.min_length) filters.min_length = parseInt(req.query.min_length);
  if (req.query.max_length) filters.max_length = parseInt(req.query.max_length);
  if (req.query.word_count) filters.word_count = parseInt(req.query.word_count);
  if (req.query.contains_character)
    filters.contains_character = req.query.contains_character;

  const result = stringService.getAllStrings(filters);
  return res.status(200).json(result);
};

// GET /strings/filter-by-natural-language
const filterByNaturalLanguage = (req, res) => {
  const { query } = req.query;
  if (!query || typeof query !== "string") {
    return res
      .status(400)
      .json({ error: "Missing or invalid 'query' parameter" });
  }

  const parsedFilters = {};
  const q = query.toLowerCase();

  try {
    // Palindrome detection
    if (q.includes("palindrome") || q.includes("palindromic")) {
      parsedFilters.is_palindrome = true;
    }

    // Word count
    if (q.includes("single word") || q.includes("one word")) {
      parsedFilters.word_count = 1;
    } else if (q.match(/(\d+)\s*word/)) {
      const match = q.match(/(\d+)\s*word/);
      parsedFilters.word_count = parseInt(match[1]);
    }


    // Length filters
    if (q.includes("longer than")) {
      const match = q.match(/longer than (\d+)/);
      if (match) parsedFilters.min_length = parseInt(match[1]) + 1;
    } else if (q.includes("shorter than")) {
      const match = q.match(/shorter than (\d+)/);
      if (match) parsedFilters.max_length = parseInt(match[1]) - 1;
    }

    // Contains character
    const charMatch = q.match(/letter\s+([a-z])/);
    if (charMatch) {
      parsedFilters.contains_character = charMatch[1];
    }

    // If we couldn’t parse anything meaningful
    if (Object.keys(parsedFilters).length === 0) {
      return res.status(400).json({
        error: "Unable to parse natural language query",
      });
    }

    const result = require("../service/strings.service").getAllStrings(
      parsedFilters
    );

    res.status(200).json({
      data: result.data,
      count: result.count,
      interpreted_query: {
        original: query,
        parsed_filters: parsedFilters,
      },
    });
  } catch (err) {
    res.status(422).json({
      error: "Query parsed but resulted in conflict",
      details: err.message,
    });
  }
};

// DELETE /strings/:value
const deleteString = (req, res) => {
  const { value } = req.params;
  const result = stringService.deleteString(value);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }
  return res.status(204).send();
};

module.exports = {
  createString,
  getString,
  getAllStrings,
  filterByNaturalLanguage,
  deleteString,
};
