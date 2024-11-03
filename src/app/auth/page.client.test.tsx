import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import  rest  from 'msw';
import { setupServer } from 'msw/node';
import SignInPage from './page.client';

// Mock the API server
const server = setupServer(
  rest.post(`${process.env.NEXT_PUBLIC_API_URL}/login/efetuarLogin`, (req, res, ctx) => {
    const { username, password } = req.body;
    if (username === 'testuser' && password === 'testpassword') {
      return res(
        ctx.status(200),
        ctx.json({ token: 'testtoken' })
      );
    } else {
      return res(
        ctx.status(400),
        ctx.json({ message: 'Invalid username or password' })
      );
    }
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('renders login page', () => {
  render(<SignInPage />);
  const loginHeading = screen.getByText('Login');
  expect(loginHeading).toBeInTheDocument();
});

test('submits login form with valid credentials', async () => {
  render(<SignInPage />);
  const usernameInput = screen.getByLabelText('Nome de Usuário');
  const passwordInput = screen.getByLabelText('Sua senha');
  const submitButton = screen.getByRole('button', { name: 'Entrar' });

  userEvent.type(usernameInput, 'testuser');
  userEvent.type(passwordInput, 'testpassword');
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText('Login bem-sucedido!')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to /feed')).toBeInTheDocument();
  });
});

test('submits login form with invalid credentials', async () => {
  render(<SignInPage />);
  const usernameInput = screen.getByLabelText('Nome de Usuário');
  const passwordInput = screen.getByLabelText('Sua senha');
  const submitButton = screen.getByRole('button', { name: 'Entrar' });

  userEvent.type(usernameInput, 'invaliduser');
  userEvent.type(passwordInput, 'invalidpassword');
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText('Erro ao fazer login.')).toBeInTheDocument();
    expect(screen.getByText('Invalid username or password')).toBeInTheDocument();
  });
});