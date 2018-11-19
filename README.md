CRDT Repo = https://github.com/coast-team/replication-benchmarker 

CRDT Paper = https://pages.lip6.fr/Marc.Shapiro/papers/rgasplit-group2016-11.pdf, 
https://www.sciencedirect.com/science/article/pii/S0743731510002716


how to start the central server that brokers connections between servers. The server currently runs on localhost port 2718.

```
npm install
npm run-script run
```

How to run tests on our rga split tree crdt and the data structures it uses:

```
npm install # you don't need to do this if you've already npm installed
npm run-script test
```

