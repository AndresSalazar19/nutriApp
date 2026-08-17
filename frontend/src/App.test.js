import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./routes/AppRouter', () => ({
  AppRouter: () => <main>NutrIA application</main>,
}));

test('renders the NutrIA application shell', () => {
  render(<App />);
  expect(screen.getByText('NutrIA application')).toBeInTheDocument();
});
