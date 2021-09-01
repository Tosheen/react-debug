import { QueryClient, QueryClientProvider } from 'react-query'
import { MessagingConsumer } from './consumers/messaging-consumer';

import "./App.css"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container">
      <MessagingConsumer />
      </div>
    </QueryClientProvider>
  );
}

export default App;
