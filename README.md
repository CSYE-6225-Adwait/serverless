# Email Verification Function

This repository contains code for a Node.js cloud function that handles email verification. It listens to Pub/Sub events triggered by a message queue and sends verification emails using Mailgun. It also updates user verification details in a MySQL database.

## Installation

1. Clone this repository to your local machine
2. Zip package.json and index.js
3. Add this zip file to your bucket
4. Use terraform to create cloud function