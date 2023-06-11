import React, { useEffect, useMemo, useState } from 'react';
import {
  Typography,
  Breadcrumb,
  Spin,
  Result,
  Empty,
  Layout,
  theme,
} from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import type { ItemType } from 'antd/es/menu/hooks/useItems';
import path from 'path-browserify';
import { useNavigate, useLocation } from 'react-router-dom';
import Image from 'renderer/components/Image';
import SelectableGrid from 'renderer/components/Grid';
import { supportedExtensions } from 'common/consts';
import PropertySider from 'renderer/components/PropertySider';
import Styles from './Browse.module.scss';
import indexStyles from './index.module.scss';
import { trpc } from '../trpc';

const Browse = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    if (typeof location.state !== 'string') {
      navigate(location.pathname, {
        state: ['~'].join(path.sep) + path.sep,
      });
    }
  }, [location, navigate]);

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const [visiblePreview, setVisiblePreview] = useState<string | undefined>();

  // TODO: Use a better way to store the current location (e.g. Redux)
  const currLocationState = location.state || `~${path.sep}`;

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
    <Layout
      className={indexStyles.wrapper}
      style={{ backgroundColor: colorBgContainer }}
    >
      <Layout.Content className={Styles.content} style={{ overflow: 'auto' }}>
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
                {seg !== '~' ? seg : <HomeOutlined />}
              </a>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>

        {entries && entries.length > 0 ? (
          <SelectableGrid
            allowMultipleSelection={false}
            selectedKeys={selectedKeys}
            setSelectedKeys={setSelectedKeys}
          >
            {entries.map((file) => {
              const key = file.name;
              // eslint-disable-next-line no-nested-ternary
              return file.isFile ? (
                supportedExtensions.includes(path.parse(key).ext) ? (
                  <Image
                    key={key}
                    onDoubleClick={() => setVisiblePreview(key)}
                    selected={selectedKeys.has(key)}
                    className={Styles.image}
                    imgPath={path.join(currLocationState, key)}
                    thumbnail
                    preview={
                      visiblePreview === key
                        ? {
                            visible: true,
                            onVisibleChange: (isVisible) =>
                              !isVisible && setVisiblePreview(undefined),
                          }
                        : false
                    }
                  />
                ) : null
              ) : null;
            })}
          </SelectableGrid>
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
      </Layout.Content>
      <Layout.Sider
        width={400}
        style={{ overflow: 'auto', backgroundColor: colorBgContainer }}
      >
        <PropertySider
          selection={Array.from(selectedKeys).map(
            (selectedKey) => currLocationState + path.sep + selectedKey
          )}
        />
      </Layout.Sider>
    </Layout>
  );
};

export default Browse;
