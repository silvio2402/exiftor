import { Typography } from 'antd';
import indexStyles from './index.module.scss';

const Home = () => {
  return (
    <div className={indexStyles.wrapper}>
      <Typography.Title>Home</Typography.Title>
      <Typography.Paragraph>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </Typography.Paragraph>
    </div>
  );
};

export default Home;
