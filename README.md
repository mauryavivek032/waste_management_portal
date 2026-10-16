# Waste2Power — Hackathon Frontend Prototype

A responsive static frontend prototype for a waste and energy hackathon project.

## Run it
1. Extract `Waste2Power.zip`.
2. Open the `Waste2Power` folder in VS Code.
3. Open `index.html` in a browser, or use the Live Server extension.
4. Internet is only needed for the optional Google Fonts import; the app logic itself is local.

## Included features
- Responsive sidebar navigation and six pages.
- Dashboard cards and a waste composition donut chart.
- Image upload and local preview.
- Category + weight input, disposal recommendation, and indicative selling-value estimate using public Panipat market snapshots (listed as checked 9 Oct 2026).
- Links to public scrap-rate listings for users to check current rates; these links are not a live API and values in the app do not auto-refresh.
- Waste log with delete and reset sample data.
- Dynamic dashboard totals and category bar chart.
- Campus collection-route concept view and e-waste guidance.
- Browser `localStorage` persistence.

## Important demo limitations
- This is a frontend prototype, not a production waste-management service.
- Image recognition is **not** implemented. The user selects the category; the app calculates a transparent illustrative estimate from that category and weight.
- Selling-value figures are indicative public market snapshots, not direct buyer quotes. Plastic and cardboard use the listed Panipat references; the metal value is an iron-only reference and must not be applied to aluminium/copper. Open the linked listings and confirm the exact grade, weight, pickup costs and final rate with the buyer. No live rate API is connected, so the snapshot must be updated manually. Energy coefficients remain illustrative.
- Route map, bin fill levels, and collection savings are illustrative, not live GPS/sensor data.
- No backend, authentication, cloud database, or external AI API is connected.

## Suggested 30-second demo
1. Open Dashboard and point out the totals.
2. Click Scan Waste, upload a photo, choose Plastic, enter `0.5` kg, and click Analyze & save entry.
3. Show the result recommendation.
4. Open My Waste and show the saved row; delete it to demonstrate interaction.
5. Open Energy & Impact to show the totals and category chart.
6. Explain that the next engineering step is integrating a real classifier and verified processing data.


## Seller Marketplace (prototype)
- Open **Seller Marketplace** in the sidebar to create a recyclable-waste listing with category, weight, condition, details and seller contact.
- Listings and contact details are saved only in the current browser's localStorage. They are NOT published to a shared server and buyers cannot see them on other devices.
- Rates are indicative demo snapshots, not live API prices or guaranteed offers. Confirm material grade, price, minimum quantity and pickup fees directly with a recycler.
- For a production marketplace, add a backend/database, user authentication, verified recycler accounts, privacy controls, spam prevention and a secure buyer-seller messaging flow.


## AI photo detection (Gemini)
- On **Scan Waste**, upload a photo, open *AI settings*, paste a free Gemini API key from Google AI Studio, then tap **Detect category with AI**.
- The AI only *suggests* a category and item name; the user confirms or edits before saving. Weight is still entered by the user.
- The key is stored only in the browser's localStorage. For a public launch, move the API call to a small backend so the key is never exposed.
- Model names are listed in `GEMINI_MODELS` at the bottom of `script.js`. If Google retires one, edit that list.

## Plastic type (rigid / film / multilayer)
- For Plastic, choose the type. The listed plastic rate is applied only to **rigid** plastic (bottles, jugs, boxes, caps).
- **Thin film** (carry bags) and **multilayer** packaging (chips packets, foil pouches) show no selling value, because they usually have no reliable resale rate.
- The AI suggests the type along with the category; the user can change it.
- Marketplace listings still use one plastic rate; mention the plastic type in the listing details.

## Latest additions
- Fixed a startup error (initialisation order) that stopped the script before the marketplace and AI buttons were attached.
- Marketplace listings now have a plastic type (rigid / thin film / multilayer), and thin film or multilayer shows no resale estimate.
- Two clearly labelled SAMPLE listings are added the first time the app opens, so the marketplace is not empty during a demo.
- Scan page: "Take photo" button for phone cameras, and drag and drop for images.
- Dashboard hero shows a live one-line impact summary.

## Demo sign-in
- On first open, the user enters a name. The dashboard then says "Hello, <name>" and the avatar shows the first letter.
- Each name keeps its own waste log in the browser's localStorage. **Log out** (sidebar) lets another person sign in.
- This is a demo sign-in only: no password, no server, and anyone on the same browser can use any name. For real accounts, use Supabase Auth or Firebase Authentication.
