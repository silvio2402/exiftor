import '@testing-library/jest-dom';
import { render, act } from '@testing-library/react';
import App from '../renderer/App';

describe('App', () => {
  it('should render', async () => {
    let component;
    await act(async () => {
      component = render(<App />);
    });
    expect(component).toBeTruthy();
  });
});
