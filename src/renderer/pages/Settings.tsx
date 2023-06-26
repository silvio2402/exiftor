/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useMemo, useEffect } from 'react';
import { z } from 'zod';
import { Typography, AutoComplete, Button, Spin, Checkbox, Input } from 'antd';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import path from 'path-browserify';
import { trpc } from 'renderer/trpc';
import StringSimilarity from 'string-similarity';
import { SettingsObject } from 'common/settings-types';
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
    const splitText = text
      .split(path.sep)
      .flatMap((part) => part.split('/'))
      .flatMap((part) => part.split('\\\\'))
      .flatMap((part) => part.split('\\'));
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

const formValuesSchema = z.object({
  defaultDir: z.string(),
  disablePreviewCompression: z.boolean(),
});
type FormValues = z.infer<typeof formValuesSchema>;

function zodEnumFromObjKeys<K extends string>(
  obj: Record<K, any>
): z.ZodEnum<[K, ...K[]]> {
  const [firstKey, ...otherKeys] = Object.keys(obj) as K[];
  return z.enum([firstKey, ...otherKeys]);
}

type FormWrapperProps = {
  defaultValues: SettingsObject;
} & React.DetailedHTMLProps<
  React.FormHTMLAttributes<HTMLFormElement>,
  HTMLFormElement
>;

const FormWrapper = (props: FormWrapperProps) => {
  const { defaultValues: settings, ...restProps } = props;

  const defaultValues: FormValues = useMemo(() => {
    return {
      defaultDir: settings.app.defaultDir,
      disablePreviewCompression:
        settings.image.preview.webpOptions.lossless || false,
    };
  }, [settings]);

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(formValuesSchema),
  });

  const mutation = trpc.setSettings.useMutation();

  const onSubmit = (data: unknown) => {
    const parsed = formValuesSchema.safeParse(data);
    if (!parsed.success) {
      parsed.error.issues.forEach((issue) => {
        const name = issue.path[0] as keyof FormValues;
        setError(name, {
          message: issue.message,
        });
      });
      return;
    }
    const { defaultDir, disablePreviewCompression } = data as FormValues;
    const newSettings: SettingsObject = settings;
    newSettings.app.defaultDir = defaultDir;
    newSettings.image.preview.webpOptions.lossless = disablePreviewCompression;
    mutation.mutate({ settings: newSettings });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} {...restProps}>
      <Typography>Default directory</Typography>
      <Controller
        name="defaultDir"
        control={control}
        rules={{ required: true }}
        render={({ field, fieldState: { error } }) => (
          <Input
            {...field}
            style={{ width: '100%', marginBottom: 16 }}
            placeholder="Default directory"
            status={error && 'error'}
          />
        )}
      />

      <Typography>Disable Preview Compression</Typography>
      <Controller
        name="disablePreviewCompression"
        control={control}
        render={({ ...field }) => (
          <Checkbox {...field} style={{ width: '100%', marginBottom: 16 }} />
        )}
      />

      <Button type="primary" htmlType="submit">
        Save
      </Button>
    </form>
  );
};

const Settings = () => {
  const settingsResult = trpc.getSettings.useQuery();

  return (
    <div className={indexStyles.wrapper}>
      <Typography.Title>Settings</Typography.Title>

      {settingsResult.status === 'success' ? (
        <FormWrapper
          style={{ maxWidth: 600 }}
          defaultValues={settingsResult.data}
        />
      ) : (
        <Spin />
      )}
    </div>
  );
};

export default Settings;
