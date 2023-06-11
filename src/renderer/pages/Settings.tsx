import React, { useState, useMemo } from 'react';
import { z } from 'zod';
import { Form, Typography, AutoComplete, Button, Spin } from 'antd';
import path from 'path-browserify';
import { trpc } from 'renderer/trpc';
import StringSimilarity from 'string-similarity';
import indexStyles from './index.module.scss';

const useDirectoryAutoComplete = (): [
  {
    value: string;
    label: string;
  }[],
  (text: string) => Promise<void>
] => {
  const utils = trpc.useContext();
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );

  const onSearch = async (text: string) => {
    const splitText = text.split(path.sep);
    const pathToSearch = splitText.slice(0, -1).join(path.sep);
    const beganText = splitText[splitText.length - 1];

    try {
      // Fetch directories
      const { entries } = await utils.readDir.fetch({
        path: pathToSearch,
        excludeFiles: true,
      });

      const unsortedOptions = entries?.map((entry) => ({
        value: path.join(pathToSearch, entry.name),
        label: entry.name,
      }));

      // Sort by similarity
      const sortedOptions =
        unsortedOptions
          .map((option) => {
            return {
              option,
              score: StringSimilarity.compareTwoStrings(
                option.label,
                beganText
              ),
            };
          })
          .sort((a, b) => b.score - a.score)
          .map(({ option }) => option) || [];

      setOptions(sortedOptions);
    } catch (e) {
      setOptions([]);
    }
  };

  return [options, onSearch];
};

const DirectoryAutoComplete = (
  props: React.ComponentProps<typeof AutoComplete>
) => {
  const [options, onSearch] = useDirectoryAutoComplete();

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <AutoComplete {...props} options={options} onSearch={onSearch} />;
};

const validateDirectory = async (
  value: string,
  utils: ReturnType<typeof trpc.useContext>
) => {
  await utils.readDir.fetch({
    path: value,
    excludeFiles: true,
  });
};

type FormFieldTypes = {
  string: string;
  number: number;
  directory: string;
  boolean: boolean;
};

type FormFieldValueType = {
  default_dir: 'directory';
  disable_preview_compression: 'boolean';
};

type FormField<Key extends keyof FormFieldValueType> = {
  key: Key;
  label: string;
  type: FormFieldValueType[Key];
  placeholder?: string;
  ref: string[];
};

type FormSchema = Array<FormField<keyof FormFieldValueType>>;

type FormValueSchema = {
  [Key in keyof FormFieldValueType]: FormFieldTypes[FormFieldValueType[Key]];
};

// const formSchemaSchema: z.ZodSchema<FormSchema> = z.array(
//   z.object({
//     key: z.string(),
//     label: z.string(),
//     type: z.union([
//       z.literal('string'),
//       z.literal('number'),
//       z.literal('directory'),
//       z.literal('boolean'),
//     ]),
//     placeholder: z.string().optional(),
//     ref: z.array(z.string()),
//   })
// );

const settingsFormSchema: FormSchema = [
  {
    key: 'default_dir',
    label: 'Default directory',
    placeholder: '~/',
    type: 'directory',
    ref: ['app', 'defaultDir'],
  },
];

type FormWrapperProps = {
  formSchema: FormSchema;
} & React.ComponentProps<typeof Form>;

const FormWrapper = ({ formSchema, ...restProps }: FormWrapperProps) => {
  const utils = trpc.useContext();

  const [form] = Form.useForm();

  // form.validateFields();

  // const valuesSchema = useMemo(
  //   () =>
  //     z.object(
  //       Object.fromEntries(
  //         formSchema.map(
  //           <T extends FormField<keyof FormFieldValueType>>(
  //             field: T
  //           ): [string, z.ZodType<FormFieldTypes[T['key']]>] => {
  //             if (field.type === 'directory') return [field.key, z.string()];
  //             if (field.type === 'string') return [field.key, z.string()];
  //             if (field.type === 'number') return [field.key, z.number()];
  //             throw new Error('Invalid field type');
  //           }
  //         )
  //       )
  //     ),
  //   [formSchema]
  // );

  const onFinish = (values: any) => {
    console.log(values);
  };

  return (
    <Form
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
      form={form}
      onFinish={onFinish}
    >
      {formSchema.map((field) => {
        switch (field.type) {
          case 'directory':
            return (
              <Form.Item
                key={field.key}
                name={field.key}
                label={field.label}
                rules={[
                  {
                    required: true,
                    message: 'Please input a directory path',
                  },
                  {
                    validator: async (_, value) =>
                      validateDirectory(value, utils),
                    message: 'Please input a valid directory path',
                  },
                ]}
              >
                <DirectoryAutoComplete placeholder={field.placeholder} />
              </Form.Item>
            );
          default:
            return null;
        }
      })}
      <Form.Item wrapperCol={{ span: 16 }}>
        <Button type="primary" htmlType="submit">
          Save
        </Button>
      </Form.Item>
    </Form>
  );
};

const Settings = () => {
  const settingsResult = trpc.getSettings.useQuery();

  const formComponent = (
    <FormWrapper style={{ maxWidth: 600 }} formSchema={settingsFormSchema} />
  );

  return (
    <div className={indexStyles.wrapper}>
      <Typography.Title>Settings</Typography.Title>

      {settingsResult.status === 'success' ? (
        formComponent
      ) : (
        <Spin>{formComponent}</Spin>
      )}
    </div>
  );
};

export default Settings;
