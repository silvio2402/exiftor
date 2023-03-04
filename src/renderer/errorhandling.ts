import { message } from 'antd';

export default function handleError(err?: unknown) {
  message.error(
    `An error has occured${err instanceof Error ? `: ${String(err)}` : '.'}`
  );
  if (err instanceof Error) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}
