# Workflow Prompt Templates

Ready-to-use prompts you can paste into the **"Generate Workflow"** dialog. Each prompt produces a complete, production-quality workflow. Copy any prompt below and paste it — the generator will produce a valid, runnable workflow.

> **Tip:** After generation, review the visual graph, adjust system prompts to match your tone, and wire up any API connectors / actions.

---

## 1. Simple Knowledge-Base Q&A

**Use case:** User asks a question → search KB → AI answers using retrieved context.

```
Create a simple Q&A workflow:
1. Greet the user with "Hi there! Ask me anything about our product."
2. Collect the user's question (store as "user_question")
3. Search the knowledge base using the user's question (store context as "kb_context", topK 8)
4. Use an AI agent with this system prompt: "You are a helpful product expert. Answer the user's question using ONLY the context provided. If the context does not contain the answer, say you don't know. Be concise and friendly." The user prompt should be: "Context:\n{{kb_context}}\n\nQuestion: {{user_question}}" — store the response as "answer"
5. Send the AI's answer to the user: "{{answer}}"

The AI agent that generates the answer should stream to chat. No classification needed — this is a simple linear flow.
```

---

## 2. Multi-Department Support Router

**Use case:** Classify the user's intent into 4 departments and route to specialized AI agents.

```
Create a customer support workflow with intent classification and routing:

1. Send a welcome message: "Welcome to Acme Support! How can I help you today?"
2. Collect the user's question (variableName: "user_question", inputType: "text")
3. Search the knowledge base with the user's question (outputVariable: "kb_context", topK: 6)
4. Use a classification AI agent (streamToChat: false, temperature: 0, maxTokens: 10):
   - System prompt: "Classify the customer's question into exactly ONE category. Respond with a single word only: billing, technical, account, or general. No explanation."
   - User prompt: "{{user_question}}"
   - outputVariable: "intent"
5. Use a switchRouter on {{intent}} with 4 cases:
   - case "billing" (label "Billing")
   - case "technical" (label "Technical")
   - case "account" (label "Account")
   - default label "General"
6. Each branch has its own AI agent (all use outputVariable: "answer", streamToChat: true, temperature: 0.7):
   - Billing agent system prompt: "You are a billing specialist. Help the customer with invoices, payments, subscriptions, and pricing. Use the provided context. Be professional and clear."
   - Technical agent system prompt: "You are a technical support engineer. Help troubleshoot issues, explain configurations, and guide through solutions. Use the provided context. Be patient and thorough."
   - Account agent system prompt: "You are an account manager. Help with account settings, profile changes, access issues, and permissions. Use the provided context."
   - General/default agent system prompt: "You are a friendly support representative. Answer the customer's question using the provided context. If you're unsure, suggest contacting support directly."
   - All agents use userPromptTemplate: "Context:\n{{kb_context}}\n\nCustomer question: {{user_question}}"
7. All 4 branches converge to a single sendMessage: "{{answer}}"
```

---

## 3. Lead Qualification & Collection

**Use case:** Collect contact info step by step, qualify the lead, and provide a tailored response.

```
Build a lead qualification chatbot workflow:

1. Greet the user: "Hi! I'd love to learn about your needs. Let me ask a few quick questions."
2. Collect their name (variableName: "user_name", prompt: "What's your name?", inputType: "text")
3. Send: "Nice to meet you, {{user_name}}!"
4. Collect their email (variableName: "user_email", prompt: "What's your email address?", inputType: "email")
5. Collect their company size (variableName: "company_size", prompt: "How many employees does your company have?", inputType: "choice", choices: "1-10,11-50,51-200,200+")
6. Collect their main interest (variableName: "interest", prompt: "What are you most interested in?", inputType: "choice", choices: "Product demo,Pricing information,Technical integration,Partnership")
7. Use a condition to check if company_size equals "200+":
   - YES path: Use an AI agent (streamToChat: true, outputVariable: "response") with system prompt: "You are an enterprise sales assistant. The lead is from a large company (200+ employees). Provide a premium, personalized response. Mention dedicated account management and custom pricing. Be enthusiastic but professional." User prompt: "Lead info — Name: {{user_name}}, Email: {{user_email}}, Company size: {{company_size}}, Interest: {{interest}}"
   - NO path: Use an AI agent (streamToChat: true, outputVariable: "response") with system prompt: "You are a friendly sales assistant. Provide a helpful response based on the lead's interest. Mention our self-service options and suggest a free trial. Be warm and encouraging." User prompt: "Lead info — Name: {{user_name}}, Email: {{user_email}}, Company size: {{company_size}}, Interest: {{interest}}"
8. Both paths converge to a sendMessage: "{{response}}\n\nThank you, {{user_name}}! We'll follow up at {{user_email}} shortly."
```

---

## 4. IT Helpdesk Ticket Triage

**Use case:** Collect issue details, check urgency, search KB for a known solution, and either auto-resolve or escalate.

```
Create an IT helpdesk triage workflow:

1. Send: "Hello! I'm the IT Helpdesk assistant. Let me help you with your issue."
2. Collect the issue description (variableName: "issue_description", prompt: "Please describe your IT issue in detail:", inputType: "text")
3. Collect urgency level (variableName: "urgency", prompt: "How urgent is this?", inputType: "choice", choices: "Low - can wait,Medium - affects my work,High - completely blocked,Critical - affects multiple people")
4. Search the knowledge base with the issue description (outputVariable: "kb_context", topK: 8, minSimilarity: 0.6)
5. Use a condition: check if {{kb_context}} is_empty:
   - YES path (no KB results): Send "I couldn't find a known solution. Let me escalate this to our team." Then use an AI agent (streamToChat: true, outputVariable: "ticket_summary") with system prompt: "You are an IT helpdesk assistant. Summarize this issue into a structured ticket format with: Issue Summary, Urgency, Recommended Team (Network, Software, Hardware, Access Management), and Suggested Priority (P1-P4). Be concise." User prompt: "Issue: {{issue_description}}\nUrgency: {{urgency}}" — then send: "I've prepared a ticket summary:\n\n{{ticket_summary}}\n\nA team member will contact you within the next business day."
   - NO path (KB results found): Use an AI agent (streamToChat: true, outputVariable: "solution") with system prompt: "You are an IT support specialist. Using the knowledge base context, provide a step-by-step solution for the user's issue. If the context only partially matches, say so and provide what you can. Number your steps." User prompt: "Knowledge base context:\n{{kb_context}}\n\nUser's issue: {{issue_description}}" — then send: "Here's what I found:\n\n{{solution}}\n\nDid this resolve your issue? If not, I can escalate to our team."
```

---

## 5. Product Recommendation Bot

**Use case:** Ask what the user needs, search KB for product info, and give a personalized recommendation.

```
Create a product recommendation workflow:

1. Send: "Hi! I'll help you find the perfect product. Let me ask a few questions."
2. Collect use case (variableName: "use_case", prompt: "What will you primarily use this product for?", inputType: "text")
3. Collect budget range (variableName: "budget", prompt: "What's your budget range?", inputType: "choice", choices: "Under $50,50-150,$150-500,$500+")
4. Collect experience level (variableName: "experience", prompt: "What's your experience level?", inputType: "choice", choices: "Beginner,Intermediate,Advanced,Expert")
5. Use a setVariable node to build the search query: variableName "search_query", expression "{{use_case}} budget {{budget}} for {{experience}} users"
6. Search the knowledge base with {{search_query}} (outputVariable: "product_context", topK: 10)
7. Use an AI agent (streamToChat: true, outputVariable: "recommendation", temperature: 0.7, maxTokens: 2048) with system prompt: "You are a knowledgeable product advisor. Based on the customer's needs and our product catalog, recommend 1-3 products. For each recommendation include: product name, why it fits their needs, price range, and a brief pros/cons list. Tailor complexity to their experience level. If our catalog doesn't have a perfect match, recommend the closest options and explain trade-offs." User prompt: "Customer needs:\n- Use case: {{use_case}}\n- Budget: {{budget}}\n- Experience: {{experience}}\n\nAvailable products from our catalog:\n{{product_context}}"
8. Send: "{{recommendation}}\n\nWould you like more details about any of these options?"
```

---

## 6. Multi-Step Onboarding Wizard

**Use case:** Walk a new user through account setup with progressive questions and personalized tips.

```
Build an onboarding wizard workflow:

1. Send: "Welcome aboard! 🎉 Let's get you set up. This will only take a minute."
2. Collect their role (variableName: "user_role", prompt: "What best describes your role?", inputType: "choice", choices: "Developer,Designer,Product Manager,Marketing,Sales,Other")
3. Collect their primary goal (variableName: "primary_goal", prompt: "What's the first thing you want to accomplish?", inputType: "text")
4. Collect their team size (variableName: "team_size", prompt: "How many people on your team?", inputType: "choice", choices: "Just me,2-5,6-20,20+")
5. Search the knowledge base with "getting started {{user_role}} {{primary_goal}}" (outputVariable: "onboarding_context", topK: 6)
6. Use an AI agent (streamToChat: true, outputVariable: "onboarding_tips", temperature: 0.7, maxTokens: 1500) with system prompt: "You are a friendly onboarding assistant. Create a personalized quick-start guide based on the user's role, goals, and team size. Include: 3 recommended first steps, 2 features they should explore based on their role, and one pro tip. Use the knowledge base context for accurate feature references. Keep it concise and encouraging. Use emoji sparingly for warmth." User prompt: "New user profile:\n- Role: {{user_role}}\n- Goal: {{primary_goal}}\n- Team size: {{team_size}}\n\nKnowledge base:\n{{onboarding_context}}"
7. Send: "Here's your personalized getting-started guide:\n\n{{onboarding_tips}}\n\nFeel free to ask me anything as you explore! I'm here to help."
```

---

## 7. FAQ + Escalation with Confidence Check

**Use case:** Answer from KB when confident; offer human handoff when KB context is weak.

```
Create a FAQ bot with smart escalation:

1. Send: "Hi! I can answer questions about our service. What would you like to know?"
2. Collect the user's question (variableName: "user_question", prompt: "Type your question:", inputType: "text")
3. Search the knowledge base with {{user_question}} (outputVariable: "kb_context", topK: 6, minSimilarity: 0.65)
4. Use a condition: check if {{kb_context_count}} is greater_than "0":
   - YES path (context found):
     a. Use an AI agent (streamToChat: false, outputVariable: "confidence_check", temperature: 0, maxTokens: 20) with system prompt: "Evaluate whether the provided context contains enough information to answer the question accurately. Respond with ONLY one word: 'confident' or 'uncertain'. Nothing else." User prompt: "Context:\n{{kb_context}}\n\nQuestion: {{user_question}}"
     b. Use a condition: check if {{confidence_check}} contains "confident":
        - YES: Use an AI agent (streamToChat: true, outputVariable: "answer", temperature: 0.5) with system prompt: "Answer the question using the provided context. Be accurate, concise, and helpful. Cite specific details from the context." User prompt: "Context:\n{{kb_context}}\n\nQuestion: {{user_question}}" — then send: "{{answer}}"
        - NO: Send: "I found some related information but I'm not fully confident in the answer. Here's what I found:\n\n{{kb_context}}\n\nWould you like me to connect you with a team member for a more detailed answer?"
   - NO path (no context): Send: "I don't have information about that in my knowledge base yet. Would you like me to connect you with a team member who can help?"
```

---

## 8. Feedback Collection & Analysis

**Use case:** Collect structured feedback, analyze sentiment, and respond accordingly.

```
Create a feedback collection workflow:

1. Send: "We'd love your feedback! It helps us improve. 💬"
2. Collect their rating (variableName: "rating", prompt: "How would you rate your experience?", inputType: "choice", choices: "⭐ Poor,⭐⭐ Fair,⭐⭐⭐ Good,⭐⭐⭐⭐ Great,⭐⭐⭐⭐⭐ Excellent")
3. Collect detailed feedback (variableName: "feedback_text", prompt: "Tell us more — what went well and what could be better?", inputType: "text")
4. Collect which area the feedback is about (variableName: "feedback_area", prompt: "Which area does your feedback relate to?", inputType: "choice", choices: "Product quality,Customer service,Delivery/shipping,Website/app,Pricing,Other")
5. Use an AI agent (streamToChat: false, outputVariable: "sentiment", temperature: 0, maxTokens: 10) with system prompt: "Analyze the sentiment of this feedback. Respond with exactly ONE word: positive, neutral, or negative. Nothing else." User prompt: "Rating: {{rating}}\nFeedback: {{feedback_text}}"
6. Use a switchRouter on {{sentiment}} with cases:
   - case "positive" (label "Positive")
   - case "neutral" (label "Neutral")
   - case "negative" (label "Negative")
   - default label "Other"
7. Branch responses (all using outputVariable: "response", streamToChat: true):
   - Positive: AI agent system prompt: "The customer left positive feedback. Write a warm, appreciative thank-you message. Mention that their feedback about {{feedback_area}} is valuable and will be shared with the team. Keep it brief and genuine." User prompt: "Rating: {{rating}}\nFeedback: {{feedback_text}}\nArea: {{feedback_area}}"
   - Neutral: AI agent system prompt: "The customer left neutral feedback. Thank them, acknowledge their points about {{feedback_area}}, and ask one specific follow-up question to understand how we could improve. Be friendly." User prompt: "Rating: {{rating}}\nFeedback: {{feedback_text}}\nArea: {{feedback_area}}"
   - Negative: AI agent system prompt: "The customer left negative feedback. Respond with empathy and concern. Apologize for the poor experience with {{feedback_area}}, acknowledge their specific complaints, and assure them the feedback will be escalated. Offer to have someone follow up personally. Be sincere, not scripted." User prompt: "Rating: {{rating}}\nFeedback: {{feedback_text}}\nArea: {{feedback_area}}"
   - Default: same as Neutral branch
8. All branches converge to sendMessage: "{{response}}"
```

---

## Tips for Writing Your Own Prompts

1. **Be explicit about variable names** — say `variableName: "user_email"` not just "collect their email"
2. **Specify `streamToChat: false`** for classification/intermediate AI agents
3. **Use the same `outputVariable`** across parallel branches when they converge to one sendMessage
4. **Always include a default branch** for switchRouter workflows
5. **Reference variables with `{{double_braces}}`** in message content and system prompts
6. **Leave `provider` and `model` as empty strings** — the bot's configured AI is used automatically
7. **Knowledge base queries** support interpolation — `{{user_question}}` works in the query field
8. **collectInput halts the workflow** — the next nodes run only after the user responds
