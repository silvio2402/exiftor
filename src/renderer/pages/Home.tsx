import { Typography } from 'antd';
import indexStyles from './index.module.scss';
// import Image from '../components/Image';

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
