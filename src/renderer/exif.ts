import { RawTags } from 'exiftool-vendored';
import { trpc } from './trpc';

export function useExif(query: Parameters<typeof trpc.readExif.useQuery>['0']) {
  const { path: filePath } = query;
  const { data } = trpc.readExif.useQuery(query);
  const tags = data?.tags;

  const utils = trpc.useContext();
  const exifMutation = trpc.writeExif.useMutation({
    onSuccess: (_, input) => {
      utils.readExif.invalidate({ path: input.path });
      utils.readImg.invalidate({ path: input.path });
    },
  });
  const setTags = (newTags: RawTags) =>
    exifMutation.mutate({ path: filePath, tags: newTags });

  return [tags, setTags] as const;
}

export function useExifs(
  queries: Parameters<typeof trpc.readExif.useQuery>['0'][]
): [(RawTags | undefined)[], (index: number, newTags: RawTags) => void] {
  const queryResults = trpc.useQueries((t) =>
    queries.map((query) => t.readExif(query))
  );

  const utils = trpc.useContext();
  const exifMutation = trpc.writeExif.useMutation({
    onSuccess: (_, input) => {
      utils.readExif.invalidate({ path: input.path });
      utils.readImg.invalidate({ path: input.path });
    },
  });
  const setTags = (index: number, newTags: RawTags) =>
    exifMutation.mutate({ path: queries[index].path, tags: newTags });

  const tagsArr = queryResults.map((qr) => qr.data?.tags);
  return [tagsArr, setTags];
}
