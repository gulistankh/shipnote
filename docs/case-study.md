# Shipnote: from idea to a product that can charge money

**A changelog tool for SaaS founders. Write an update, publish it, and every product gets a public "What's new" page customers can open without logging in.**

- **Demo video (2 minutes):** https://youtu.be/HIu0TYvBWfc
- **Live demo:** https://shipnote-gulistan.vercel.app (click a demo button on the login page, no sign-up needed)
- **Code:** https://github.com/gulistankh/shipnote
- **Payments run in Stripe test mode.** No real money moves.

## The idea

Early-stage founders ship something almost every week, but their customers rarely hear about it. Updates get buried in chat threads, tweets and one-off emails. Shipnote gives each product one clean page where every update lives, tagged **New**, **Improved** or **Fixed**, with a link the founder can share anywhere.

I built it end to end as a complete SaaS MVP, because the question a founder asks isn't "can you build screens?" It's "can you take my idea to something I can actually charge for?"

## What I set out to prove

One small product that covers everything a real SaaS needs:

| What | Why a founder cares |
|---|---|
| Landing page, pricing and a waitlist saved in a database | Interest is captured from day one |
| Sign up, log in, a three-step onboarding | New users reach value in under a minute |
| Create, edit, publish and delete updates, for one or more products | The core feature works, not just a mock-up |
| A public page per product with search and filters | Customers see the value without an account |
| Free and Pro plans with limits enforced on the server | The business model is real, not just a pricing table |
| Subscription billing with checkout, a cancel-anytime portal and webhooks | Money can flow, and cancellations behave correctly |
| An admin view with users, plans and the waitlist | The founder can see the business |
| A demo anyone can try with one click | Prospects can judge it in 30 seconds |

## How I worked

1. **Design decisions first.** I chose a look that feels modern and trustworthy for founders: a dark hero with a lime accent, a light and calm app interior, Bricolage Grotesque for headings and Inter for text.
2. **Frontend first, with realistic sample data.** Every screen existed and was tested on a phone before any server code, so the product shape was settled early.
3. **Database and API designed together.** Five tables and a small REST API, with plan rules and permissions planned before they were coded.
4. **Backend with security from the start**, not added at the end.
5. **Then the connection, billing and deployment**, each tested before moving on.

## Problems that made it better

### 1. "Free is limited to 5 updates" can't just be a hidden button
Hiding a button is not a rule. Anyone can send the request by hand. The limit is checked on the server, inside a database transaction that locks the user's row first, so two quick clicks can't both slip past. Over the limit, the server answers with a clear `PLAN_LIMIT` error and the interface shows the upgrade popup. I tested it by publishing a sixth update directly against the API: refused.

### 2. The browser must never decide who is Pro
The plan changes only when Stripe's webhook says so. The webhook verifies Stripe's signature, stores each event's id so a repeated event is processed once, and re-reads the subscription from Stripe instead of trusting the event's snapshot, so events that arrive out of order can't corrupt a plan. A fake request to the webhook is rejected.

### 3. A cancellation that Stripe described differently than I expected
Testing the full lifecycle (pay, cancel in the portal, cancel immediately) showed that Stripe's newer API marks a scheduled cancellation with a different field than the one I was reading. The page kept saying "Renews" after a cancel. I confirmed it by asking Stripe directly, fixed it in one line, and re-tested. Now a cancelled customer sees "Your Pro plan ends on …", keeps Pro until the paid month is over, and then drops back to Free with their published updates still online.

### 4. A demo anyone can click, without leaking anyone's data
The three demo accounts are shared by every visitor, so they reset each time, billing is switched off for them, and the demo admin sees masked names and emails (`g***@gmail.com`). Without that, anyone clicking "Demo: Admin" could read real visitors' emails.

### 5. Found on a phone, not in a code review
Testing at 375px width showed a product menu hiding **behind** the mobile drawer, and an admin table whose extra columns nobody would notice. I fixed the layering and added a fade, an arrow and a "swipe sideways" hint, with the first column pinned so you never lose track of the row.

### 6. One project for the site and the API
The website and the API share one address, so the secure login cookie never crosses sites. That also keeps the login rate limit counting each visitor separately, and it makes the whole app a single deployment.

## Security, in short

- Login is an HttpOnly, Secure cookie, so JavaScript can never read it, and passwords are hashed with bcrypt.
- Every product and update query checks who owns it, and answers "not found" for other people's data.
- Requests that change data are checked against the site's own address, login and waitlist are rate limited, and every API answer says `no-store`.
- Only a Stripe test key is accepted by the server.
- The repository holds no secrets, and I scanned the contents of every file before pushing.

## What works, end to end

- Sign up, onboarding, creating and publishing updates, and a public page anyone can open
- Free limits enforced by the server, with an upgrade popup
- A Stripe test payment from checkout to Pro, the customer portal, cancellation at period end, and cancelling immediately back to Free
- An admin view that is safe to demo
- A phone-friendly layout across the public and logged-in pages
- Runs on free tiers (Vercel and Neon), so it costs nothing to keep online

## What I would build next

- Email a subscriber list whenever an update is published
- Custom domains for each product's page, and an embeddable "What's new" widget
- Team members and roles on one account
- Automated tests around the plan limits and the webhook
- Going live with real payments (a business verification step with Stripe)

## Stack

React and Vite, Node.js and Express, PostgreSQL on Neon, Stripe (Checkout, Customer Portal and webhooks), Vercel.