import '@testing-library/jest-dom';
import { render, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Menu from 'renderer/components/Menu';

describe('Menu', () => {
  let container: HTMLDivElement;
  let renderResult: ReturnType<typeof render>;

  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement('div');
    document.body.appendChild(container);
  });
  afterEach(() => {
    renderResult.unmount();
    container.remove();
  });

  it('should render', async () => {
    await act(async () => {
      renderResult = render(
        <MemoryRouter initialEntries={['/']}>
          <Menu />
        </MemoryRouter>,
        { container }
      );
    });

    expect(container).toBeTruthy();
  });
});
