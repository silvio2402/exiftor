import { Typography } from 'antd';
import indexStyles from './index.module.scss';

const Home = () => {
  return (
    <div className={indexStyles.wrapper}>
      <Typography.Title>Welcome to ExifTor!</Typography.Title>
      <Typography.Paragraph>By Silvio</Typography.Paragraph>
    </div>
  );
};

export default Home;
