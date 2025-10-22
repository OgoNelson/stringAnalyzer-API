const request = require("supertest");
const app = require("../main");

let server;

beforeAll(() => {
  // start app in memory
  server = app.listen(0); // 0 lets OS pick a free port
});

afterAll((done) => {
  server.close(done); // ✅ ensure Jest exits cleanly
});

describe("String Analyzer API", () => {
  const testString = "racecar";
  const multiWordString = "madam anna civic level rotor kayak";

  // 1️⃣ Create/Analyze String
  it("should analyze a new string and return computed properties", async () => {
    const res = await request(app)
      .post("/strings")
      .send({ value: testString })
      .expect(201);

    expect(res.body).toHaveProperty("id");
    expect(res.body.value).toBe(testString);
    expect(res.body.properties).toMatchObject({
      is_palindrome: true,
      word_count: 1,
      unique_characters: expect.any(Number),
      sha256_hash: expect.any(String),
    });
  });

  // 2️⃣ Handle duplicate string (409)
  it("should return 409 if string already exists", async () => {
    const res = await request(app)
      .post("/strings")
      .send({ value: testString })
      .expect(409);

    expect(res.body.error || res.body.message).toBeDefined();
  });

  // 3️⃣ Get Specific String
  it("should get a specific string by its value", async () => {
    const res = await request(app)
      .get(`/strings/${encodeURIComponent(testString)}`)
      .expect(200);

    expect(res.body.value).toBe(testString);
    expect(res.body.properties.is_palindrome).toBe(true);
  });

  // 4️⃣ Validate bad request
  it("should return 400 if no value is provided", async () => {
    const res = await request(app).post("/strings").send({}).expect(400);

    expect(res.body.error || res.body.message).toBeDefined();
  });

  // 5️⃣ Get all strings with filters
  it("should return strings that match query filters", async () => {
    await request(app).post("/strings").send({ value: multiWordString });

    const res = await request(app)
      .get("/strings?is_palindrome=false&min_length=5")
      .expect(200);

    expect(res.body).toHaveProperty("data");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // 6️⃣ Natural language query
  it("should interpret natural language query", async () => {
    const res = await request(app)
      .get(
        "/strings/filter-by-natural-language?query=all single word palindromic strings"
      )
      .expect(200);

    expect(res.body).toHaveProperty("interpreted_query");
    expect(res.body.interpreted_query.parsed_filters).toHaveProperty(
      "is_palindrome"
    );
  });

  // 7️⃣ Delete a string
  it("should delete a string successfully", async () => {
    await request(app)
      .delete(`/strings/${encodeURIComponent(testString)}`)
      .expect(204);
  });

  // 8️⃣ Not found after delete
  it("should return 404 for deleted string", async () => {
    await request(app)
      .get(`/strings/${encodeURIComponent(testString)}`)
      .expect(404);
  });
});
