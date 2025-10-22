const express = require("express");
const router = express.Router();
const stringController = require("../controller/strings.controller");

router.post("/", stringController.analyzeString);
router.get("/", stringController.getAllStrings);
router.get(
  "/filter-by-natural-language",
  stringController.filterByNaturalLanguage
);
router.get("/:value", stringController.getString);
router.delete("/:value", stringController.deleteString);

module.exports = router;
