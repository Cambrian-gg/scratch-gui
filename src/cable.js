import { createConsumer } from '@rails/actioncable';
// const URL = 'ws://localhost:3030/cable';
const URL = 'ws://cambrian-gg.herokuapp.com/cable'
const consumer = createConsumer(URL);

export default consumer;