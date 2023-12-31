
https://github.com/SharjeelAbbas014/remix-crypto/assets/53342674/39ad3fad-3ff1-4f52-a3d7-e5098905148b
*[Remix Crypto](https://remixcrypto-2846.fly.dev/)*, an app built to view current prices of crypto and allow users to save the current prices of the cryptos.

### Technology Used:
- [Remix](https://remix.run/)
- [Tailwind](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Prisma with SQLite](https://www.prisma.io/docs/concepts/database-connectors/sqlite)
- [Cypress](https://www.cypress.io/)
- [Fly.io](https://fly.io/)
- [FuseJS](https://fusejs.io/) (For searching)


### How to run:
- Clone with repo with
```
git clone https://github.com/SharjeelAbbas014/remix-crypto.git
cd remix-crypto
```
- Install dependencies and prisma DB setup with
```
npm i
npm run setup
```
- Start dev env with
```
npm run dev
```

- The app will start running on http://localhost:3000 by default if the port is unavailable it will find next available port and should log out the port the app is running on

<img width="1652" alt="image" src="https://github.com/SharjeelAbbas014/remix-crypto/assets/53342674/d8760167-4df2-4934-8553-8fb13b687aa1">


### About the user flow:
Here's the flow the user will go through
- User will be presented with the table of top 100 crypto
- The user can search for the crypto he likes and click to see more details
- The user can login and save the current details of the crypto
- Another field should appear named `savedStatus` <img width="1368" alt="image" src="https://github.com/SharjeelAbbas014/remix-crypto/assets/53342674/938cdc0f-c4c4-4eb0-b2e8-d9bb69ee8299">
- User can click on the ⭐️ icon to see saved details
- User can also unsave saved crypto

### Some engineering discussions
- The App on / route have a `loader` which loads data from API and user saved details (which we can also fetch in parallel).
- We used Daisy UI table and dialog to show crypto and it's details
- We used *fuseJS* to search on `["id", "symbol", "name"]` for easier and fuzzy search
- We also have *Cypress End to End* test to test the major flow of the app
- We have `SavedCrypto` model in schema.prisma file to store saved crypto detail for each user
- To post data we are using power of remix form and action to save data with prisma
- Your mind should get blown (as mine did) by the fact that we don't re request the saved API or store them locally but loader just loades the data automagically. If that's not magic to you I don't know what is :P.

### Demo:
https://github.com/SharjeelAbbas014/remix-crypto/assets/53342674/fd1a1dd6-1668-4260-8f44-ad8833c02e4e

