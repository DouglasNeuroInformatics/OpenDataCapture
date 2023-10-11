# E2E Testing

###  Install E2E test runner

Install cypress in Bun

```
bun install cypress
```

Then run this command if you do not already have the cypress boiler player folder and files already in the apps/web directory.

```
cd /apps/web
bunx cypress install
```

###  Edit E2E Test Suite
```
cd /apps/web
bunx cypress open
```
This command will open the cypress UI which allows for live demonstration of the e2e test suit

###  Run E2E Test Suite
```
cd /apps/web
bunx cypress run
```
This command will run the cypress test suite 
