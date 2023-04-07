import { createConsumer } from '@rails/actioncable';

const searchParams = new URLSearchParams(window.location.href);
const cableHost = searchParams.get('cable_host');

// const URL = cableHost || 'ws://localhost:3030/cable';
const URL = 'wss://cambrian.gg/cable'
const consumer = createConsumer(URL);

export default consumer;