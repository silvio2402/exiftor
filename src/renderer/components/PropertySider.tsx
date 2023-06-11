import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import React, { useMemo } from 'react';
import { RawTags } from 'exiftool-vendored';
import { useExif } from 'renderer/exif';
import Styles from './PropertySider.module.scss';

type ExifPropertyType = {
  id: React.Key;
  key: string;
  value: RawTags[keyof RawTags];
};

interface PropertySiderProps {
  selection: string[]; // Array of file paths
}

const PropertySider = (props: PropertySiderProps) => {
  const { selection } = props;

  // TODO: Support multiple files
  const [exif] = useExif({ path: selection[0] });

  // eslint-disable-next-line no-console
  console.log({ exif });

  const fileProps = useMemo(
    () =>
      exif !== undefined
        ? Object.entries(exif).map(
            // TODO: When adding translations, the key should be translated while the id should not
            ([key, value]): ExifPropertyType => ({
              id: key,
              key,
              value: JSON.stringify(value),
            })
          )
        : [],
    [exif]
  );

  const editableIds = useMemo(
    () => fileProps.map((fileProp) => fileProp.id),
    [fileProps]
  );

  const columns: ProColumns<ExifPropertyType>[] = [
    {
      title: 'Key',
      dataIndex: 'key',
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'Key is required',
          },
        ],
      },
    },
    {
      title: 'Value',
      dataIndex: 'value',
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'Value is required',
          },
        ],
      },
    },
  ];

  return (
    <EditableProTable
      style={{ height: '100%' }}
      className={Styles.table}
      size="small"
      headerTitle="Properties"
      columns={columns}
      rowKey="id"
      value={fileProps}
      recordCreatorProps={false}
      // onChange={setFileProps}
      //   recordCreatorProps={{
      //     newRecordType: 'dataSource',
      //     record: () => ({
      //       key: '',
      //       value: '',
      //       id: `${Date.now()}`,
      //     }),
      //   }}
      //   editable={{
      //     type: 'multiple',
      //     editableKeys: editableIds,
      //     actionRender: (row, config, defaultDoms) => [defaultDoms.delete],
      //     // onValuesChange: (record, recordList) => setFileProps(recordList),
      //     // onChange: setEditableIds,
      //   }}
    />
  );
};

export default PropertySider;
