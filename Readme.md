# Player Development Tracking Application
        
i would like to build a windows app that tracks player development, should be 5 metrics Technical, tactical, physical, psychological, social r, scoring should be 1-5, 5 being the highest names should be: 1 - Not Yet Demonstrated 2 - Inconsistent 3 - Functional 4 - Effective 5 - Advanced

it should include players name, team, position, which foot, left right both, date of assessment, it should store the scores, it needs to be updated live or close as possible.
on team, can you do make it easier so we can pick from the below teams, 13M 13P 14M 14P 15M 15P 16M 16P Youths

Also on foot it needs to be a pick between Left Right and Dual

the positions as wel, they should be: GK RB LB WB CB MID CDM/6 CAM/10 LW RW WF ST
also can you add before the criterias a dropdown where you pick assessor: Ken Tougher, Graham Keane, Tadgh Murphy, Stefan Persson, Maurice Ward, Darren Cranston


# Instructions

For security reasons, the `env.json` file is not pre-populated — you will need to generate or retrieve the values yourself.  

For **JWT secrets**, generate a value with:  

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then paste the generated value into the appropriate field.  

For the **Floot Database**, download your database content as a pg_dump from the cog icon in the database view (right pane -> data -> floot data base -> cog icon on the left of the name), upload it to your own PostgreSQL database, and then fill in the connection string value.  

**Note:** Floot OAuth will not work in self-hosted environments.  

For other external services, retrieve your API keys and fill in the corresponding values.  

Once everything is configured, you can build and start the service with:  

```
npm install -g pnpm
pnpm install
pnpm vite build
pnpm tsx server.ts
```
