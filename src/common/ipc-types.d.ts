// Types for IPC communication between main and renderer processes

type Only<T, U> = {
  [P in keyof T]: T[P];
} & {
  [P in keyof U]?: never;
};

type Either<T, U> = Only<T, U> | Only<U, T>;

// interface ResultError {
//   error: string;
// }

export interface ReadDirArgs {
  path: string;
  excludeFiles?: boolean;
}

export interface ReadDirResult {
  entries: {
    name: string;
    isDirectory: boolean;
    isFile: boolean;
    isSymbolicLink: boolean;
  }[];
}

export interface ReadImgArgs {
  path: string;
  thumbnail: boolean;
}

export interface ReadImgResult {
  imgBuffer: Buffer;
}

export type ChannelArgs = {
  'ipc-example': string;
  'read-dir': ReadDirArgs;
  'read-img': ReadImgArgs;
};
export type ChannelResults = {
  'ipc-example': string;
  'read-dir': ReadDirResult;
  'read-img': ReadImgResult;
};
export type Channel = keyof ChannelArgs | keyof ChannelResults;
