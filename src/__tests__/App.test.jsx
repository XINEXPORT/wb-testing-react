import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App.jsx';
import { screen, render} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const server = setupServer(
  rest.get('/api/movies', (req, res, ctx) => {
    return res(ctx.json([{
      movieId: 1,
      title: 'Test Movie' }]));
  }),
  rest.get('/api/ratings',(req,res,ctx)=>{
    return res(ctx.json([{
      ratingId: 2,
      score: 3,
      movie: {title: 'test'},
      movieId: 2,
    }])),
    rest.get('/api/movies/:movieId', (req, res, ctx)=>{
      return res(ctx.json([{
      movieId: 2,
      title: 'Gone',
      posterPath: 'test.png',
      overview: 'Gone overview',
      movieId: 3
      }])),
    })
  } )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test ('renders homepage at /', async () => {
  render ( <App />);
  expect(screen.getByRole('heading', {name:/movie ratings app/i})).toBeInTheDocument();
});

describe ('page navigation', () => {

//ALL MOVIES//
  test ('can navigate to all movies page', async () => {
    render ( <App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('link', {name: /all movies/i}));
    expect(screen.getByRole('heading', {name:/all movies/i})).toBeInTheDocument();

  });

//LOG IN//
  test.todo('can navigate to the login page', async () => {
    render ( <App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('link', {name: /log in/i}));
    expect(screen.getByRole('heading', {name:/log in/i})).toBeInTheDocument();


  });

  //YOUR RATINGS//
  test ('can navigate to the user ratings page', async () => {
    server.use();
    render ( <App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('link', {name: /your ratings/i}));
    expect(screen.getByRole('heading', {name:/your ratings/i})).toBeInTheDocument();
  });

//RATE THIS MOVIE//
  test ('can navigate to a movie detail page', async () => {
    render ( <App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('link', {name: /all movies/i}))
    await user.click(screen.getByRole('link', {name: /Gone/i}))
    expect(screen.getByRole('heading', {name:/Gone/i})).toBeInTheDocument();

  });
});

test('logging in redirects to user ratings page', async () => {
  //ENABLE LOGIN FOR TEST
  server.use(
    rest.post('/api/auth', (req, res, ctx) =>{
      return res(ctx.json({success:true}));
    }),
  );

  render ( <App />);
  const user = userEvent.setup();

  await user.click(screen.getByRole('link', {name: /log in/i}));
  await user.type(screen.getByLabelText(/email/i), 'test@gmail.com');
  await user.type(screen.getByLabelText(/password/i), 'test');
  await user.click(screen.getByRole('button', {name: /log in/i}));

  expect(screen.getByRole('heading', {name:/log in/i})).toBeInTheDocument();

});

  //API RATINGS
  test('creating a rating redirects to user ratings page', async () => {
  server.use(
    rest.post('/api/ratings', (req, res, ctx) =>{
      return res(ctx.json({ratingId:1, score:2}));
    }),
  );

  render ( <App />);
  const user = userEvent.setup();

  await user.click(screen.getByRole('combobox', {name: /score/i}));

});
