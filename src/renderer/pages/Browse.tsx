import React, { useEffect, useState } from 'react';
import { Typography, Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import type { ItemType } from 'antd/es/menu/hooks/useItems';
import path from 'path-browserify';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ReadDirArgs, ReadDirResult } from 'common/ipc-types';
import handleError from 'renderer/errorhandling';
import Image from 'renderer/components/Image';
import { supportedExtensions } from 'common/consts';
import Styles from './Browse.module.scss';
import indexStyles from './index.module.scss';

const Browse = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [dir, setDir] = useState<string>(location.state || '');

  const [entries, setEntries] = useState<ReadDirResult['entries']>([]);

  const [crumbSegments, setCrumbItems] = useState<string[]>(
    dir.split(path.sep).slice(0, -1)
  );

  const [segmentMenuItems, setSegmentMenuItems] = useState<ItemType[][]>([]);

  useEffect(() => {
    let currLocationState;
    if (typeof location.state !== 'string') {
      currLocationState = ['%HOME%'].join(path.sep) + path.sep;
      navigate(location.pathname, {
        state: currLocationState,
      });
    } else {
      currLocationState = location.state;
    }

    const { ipcRenderer } = window.electron;
    const args: ReadDirArgs = {
      path: currLocationState,
    };
    setEntries([]);
    ipcRenderer
      .invoke('read-dir', args)
      .then((result) => {
        const newEntries = result.entries;
        setEntries(() => newEntries);
        return null;
      })
      .catch(handleError);

    setDir(currLocationState);
    setCrumbItems(currLocationState.split(path.sep).slice(0, -1));
  }, [location, navigate]);

  useEffect(() => {
    const fetchMenuItems = async (segmentIndex: number) => {
      const { ipcRenderer } = window.electron;
      const args: ReadDirArgs = {
        path:
          dir
            .split(path.sep)
            .slice(0, segmentIndex + 1)
            .join(path.sep) + path.sep,
        excludeFiles: true,
      };
      const result = await ipcRenderer.invoke('read-dir', args);
      const newMenuItems = result.entries.map((file) => ({
        key: file.name,
        label: file.name,
      }));
      setSegmentMenuItems((prev) => {
        const newSegmentMenuItems = [...prev];
        newSegmentMenuItems[segmentIndex] = newMenuItems;
        return newSegmentMenuItems;
      });
    };

    crumbSegments.forEach((_, i) => fetchMenuItems(i));
  }, [crumbSegments, dir]);

  return (
    <div className={indexStyles.wrapper}>
      <Typography.Title>Browse</Typography.Title>
      <Breadcrumb>
        {crumbSegments.map((seg, i) => (
          <Breadcrumb.Item
            menu={
              segmentMenuItems[i]?.length > 0
                ? {
                    items: segmentMenuItems[i] || [
                      { key: '', label: 'Loading...' },
                    ],
                    onClick: ({ key }) => {
                      navigate(location.pathname, {
                        state:
                          dir
                            .split(path.sep)
                            .slice(0, i + 1)
                            .join(path.sep) +
                          path.sep +
                          key +
                          path.sep,
                      });
                    },
                  }
                : undefined
            }
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            onClick={() =>
              navigate(location.pathname, {
                state:
                  dir
                    .split(path.sep)
                    .slice(0, i + 1)
                    .join(path.sep) + path.sep,
              })
            }
          >
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a className={Styles.breadcrumbItem}>
              {seg !== '%HOME%' ? seg : <HomeOutlined />}
            </a>
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>

      <div className={Styles.gridContainer}>
        {entries
          .filter(
            (file) =>
              file.isFile &&
              supportedExtensions.includes(path.parse(file.name).ext)
          )
          .map((file) => (
            <div className={Styles.gridItem} key={file.name}>
              {file.isFile &&
              supportedExtensions.includes(path.parse(file.name).ext) ? (
                <Image
                  className={Styles.image}
                  imgPath={path.join(dir, file.name)}
                  thumbnail
                  key={file.name}
                />
              ) : null}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Browse;
