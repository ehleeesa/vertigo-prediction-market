# My project submission

## What I've built
I focused on making the platform feel organized, responsive, and data-rich. I implemented a filtering and sorting system that allows users to navigate through thousands of entries with ease, whether they want to see the "Newest First" or markets with the "Most Participants". 

To ensure everything stays stable, I set up a suite of E2E tests with **Playwright**. I also spent time populating the database with a cat market theme to test how the UI and API handle real-world scale.

## Challenges I faced

One of the trickiest parts was getting the dashboard to sync odds and bets in real-time without refreshing the page or affecting performance. Setting up the E2E tests with Playwright also required a lot of focus to ensure they stayed stable.

I also put a lot of effort into project housekeeping, making sure my local database and secrets stayed private while providing a clear template for others to spin up the project easily. Lastly, getting the Docker setup to auto-populate the database correctly on the first run was a real lesson in attention to detail and maintaining environment consistency.


## Assets & demos
Here is a detailed breakdown of the work included in this submission:

### Video demo
* **internship-demo.mp4**: A full walk-through of the platform's features and my contributions.

### Admin features
* **admin-active / admin-resolved**: Views of the market management system.
* **admin-controls**: Interface for administrative actions.
* **admin-create-market**: The flow for adding new prediction markets to the ecosystem.

### User experience & dashboard
* **dashboard**: The main market landing page.
* **dashboard-api / dashboard-api-generated**: Demonstrating the API key generation and management for bot access.
* **dashboard-counting1 / dashboard-counting2**: Showing real-time data updates and statistics.
* **leaderboard**: The competitive ranking system for users.
* **user-active / user-controls**: Personalized views for managing active bets and account settings.

### Data & sorting
* **newest-first**: Demonstration of the new sorting functionality.
* **most-participants**: Filtering markets by engagement levels.
* **total-stakes**: Overview of the total volume traded on the platform.
* **dropdown**: The UI components used for navigation and filtering.
* **market-distribution-piechart / resolved-market**: Visual representations of market outcomes and data distribution.

### Backend & testing
* **api-endpoint-testing**: A successful JSON response from the backend via `curl`.
* **docker-server-startup**: Logs confirming the environment is up and bets were seeded correctly.
* **playwright-e2e-passed / playwright-test-report**: Proof that all automated E2E tests are passing perfectly.
