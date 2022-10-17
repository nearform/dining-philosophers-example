[![Continuous Integration](https://github.com/nearform/dining-philosophers-example/actions/workflows/ci.yml/badge.svg)](https://github.com/nearform/dining-philosophers-example/actions/workflows/ci.yml)

# Dining philosophers example

This repository contains a Node.js example implementation of the [Dining philosophers problem](https://en.wikipedia.org/wiki/Dining_philosophers_problem).

The problem is a classic of concurrent programming, with several actors (philosophers) competing for access to shared resources (forks).

## Requirements

- Node.js LTS

## Setup

- `npm i`
- `npm run web` for the Web version, then access `http://localhost:3000`
- `npm run cli` for the CLI version

## How it works

It uses Node.js [worker threads](https://nodejs.org/api/worker_threads.html) and JavaScript [Atomics](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics) for concurrent processing and thread synchronization.

The Web UI uses D3 for rendering the dining table, the philosophers and the forks.
