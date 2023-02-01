import { createConsumer } from '@rails/actioncable';
// const URL = 'ws://localhost:3030/cable';
const URL = 'wss://app.cambrian.gg/cable'
const consumer = createConsumer(URL);

export default consumer;