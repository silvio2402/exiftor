import React, { useEffect, useMemo } from 'react';
import { Typography, Breadcrumb, Spin, Result, Empty } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import type { ItemType } from 'antd/es/menu/hooks/useItems';
import path from 'path-browserify';
import { useNavigate, useLocation } from 'react-router-dom';
import Image from 'renderer/components/Image';
import { supportedExtensions } from 'common/consts';
import Styles from './Browse.module.scss';
import indexStyles from './index.module.scss';
import { trpc } from '../trpc';

const Browse = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (typeof location.state !== 'string') {
      navigate(location.pathname, {
        state: ['%HOME%'].join(path.sep) + path.sep,
      });
    }
  }, [location, navigate]);

  // TODO: Use a better way to store the current location (e.g. Redux)
  const currLocationState = location.state || `%HOME%${path.sep}`;

  const entriesResult = trpc.readDir.useQuery({
    path: currLocationState,
  });
  let entries = entriesResult.data?.entries;
  entries = entries?.filter(
    (file) =>
      file.isFile && supportedExtensions.includes(path.parse(file.name).ext)
  );

  const crumbSegments: string[] = useMemo(
    () => currLocationState.split(path.sep).slice(0, -1),
    [currLocationState]
  );

  const segmentMenuItems: ItemType[][] = trpc
    .useQueries((t) =>
      crumbSegments.map((seg, i) =>
        t.readDir({
          path:
            currLocationState
              .split(path.sep)
              .slice(0, i + 1)
              .join(path.sep) + path.sep,
          excludeFiles: true,
        })
      )
    )
    .map((data) => {
      if (data.data?.entries) {
        return data.data.entries.map((file) => ({
          key: file.name,
          label: file.name,
        }));
      }
      return [{ key: '%status', label: data.status }];
    });

  return (
    <div className={indexStyles.wrapper}>
      <Typography.Title>Browse</Typography.Title>
      <Breadcrumb>
        {/* TODO: Use Cascader component for better navigation */}
        {crumbSegments.map((seg, i) => (
          <Breadcrumb.Item
            menu={
              segmentMenuItems[i]?.length > 0
                ? {
                    items: segmentMenuItems[i],
                    disabled: segmentMenuItems[i][0]?.key === '%status',
                    onClick:
                      segmentMenuItems[i][0]?.key === '%status'
                        ? undefined
                        : ({ key }) => {
                            navigate(location.pathname, {
                              state:
                                currLocationState
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
                  currLocationState
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

      {entries && entries.length > 0 ? (
        <div className={Styles.gridContainer}>
          {entries.map((file) => (
            <div className={Styles.gridItem} key={file.name}>
              {file.isFile &&
              supportedExtensions.includes(path.parse(file.name).ext) ? (
                <Image
                  className={Styles.image}
                  imgPath={path.join(currLocationState, file.name)}
                  thumbnail
                  key={file.name}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <div className={Styles.statusContainer}>
          {entriesResult.status === 'loading' ?? (
            <Spin tip="Loading..." size="large" />
          )}
          {entriesResult.status === 'error' ?? (
            <Result
              status="error"
              title={`Whoops! An error occurred: ${entriesResult.error?.message}`}
            />
          )}
          {entriesResult.status === 'success' && entries?.length === 0 && (
            <Empty description="No images found" />
          )}
        </div>
      )}
    </div>
  );
};

export default Browse;
