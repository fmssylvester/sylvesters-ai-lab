# n8n Practice Exercises

Watch each chapter from the course, then build the exercise below in your n8n Cloud.

---

## 1. IF/Else Node (Video @ 3:00:25)

**Concept:** Branch into different paths based on a condition.

**Exercise:** Build a workflow that:
- Webhook receives `{ "score": 75 }`
- IF node: score >= 50 → "Pass", else → "Fail"
- Respond to Webhook with the result

**Try:** Change the threshold. Add a second IF for "Excellent" (score >= 90).

---

## 2. Merge Node (Video @ 3:26:43)

**Concept:** Combine data from two branches.

**Exercise:** Build a workflow that:
- Webhook receives `{ "customerId": 5, "name": "John" }`
- Branch 1: Set node adds `"tier": "gold"`
- Branch 2: Set node adds `"points": 1200`
- Merge node combines both into one object
- Respond to Webhook with merged result

**Try:** Change merge mode to "Combine" vs "Wait". See the difference.

---

## 3. Aggregate Node (Video @ 4:22:29)

**Concept:** Group multiple items into a single list.

**Exercise:** Build a workflow that:
- Webhook receives `{ "items": [{"product": "A", "qty": 2}, {"product": "B", "qty": 5}] }`
- Loop Over Items (or Code node) splits into individual items
- Aggregate node groups them back into a single array
- Respond to Webhook

---

## 4. Loop Over Items (Video @ 6:08:39)

**Concept:** Process each item in a list one at a time.

**Exercise:** Build a workflow that:
- Webhook receives `{ "numbers": [1, 2, 3, 4, 5] }`
- Loop node iterates over each number
- Inside the loop: Set node multiplies by 2
- After loop: Aggregate the results
- Respond to Webhook with `[2, 4, 6, 8, 10]`

---

## 5. HTTP Request Node (Video @ 7:45:02)

**Concept:** Call any external API from n8n.

**Exercise:** Build a workflow that:
- Manual trigger (or Webhook)
- HTTP Request node: GET https://jsonplaceholder.typicode.com/todos/1
- IF node: completed === true → "Done", else → "Pending"
- Respond to Webhook

**Try:** Call a different API (weather, crypto price, etc.)

---

## 6. Expressions & Functions (Video @ 6:52:58)

**Concept:** Manipulate data using expressions.

**Exercise:** Build a workflow that:
- Webhook receives `{ "firstName": "john", "lastName": "doe" }`
- Set node using expressions:
  - `fullName`: `={{ $json.firstName + " " + $json.lastName }}`
  - `capitalized`: `={{ $json.firstName.toUpperCase() }}`
  - `date`: `={{ $now.toFormat("yyyy-MM-dd") }}`
- Respond to Webhook

---

## 7. Code Node (Video @ 7:14:49)

**Concept:** Write JavaScript to transform data.

**Exercise:** Build a workflow that:
- Webhook receives `{ "price": 100, "taxRate": 0.1 }`
- Code node: calculate total = price * (1 + taxRate), add a timestamp
  ```
  const item = $input.first().json;
  return {
    total: item.price * (1 + item.taxRate),
    originalPrice: item.price,
    timestamp: new Date().toISOString()
  };
  ```
- Respond to Webhook

---

## 8. Sub-Workflow (Video @ 9:03:55)

**Concept:** Call one workflow from another (reuse).

**Exercise:**
- Workflow A: Webhook receives a number. Calls Workflow B with that number. Responds with result.
- Workflow B: Takes a number, multiplies by 10, returns it.

**Pro tip:** Sub-workflows are how you stop repeating the same logic across workflows.

---

## After Exercises

Come back to me after you've built all 8. Next step:
- Tier 4: Error workflows, scheduled triggers, environment variables
- Or: Build your **third template** for n8n Markets
