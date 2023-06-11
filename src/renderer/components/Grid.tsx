import React, { Children, useState } from 'react';
import Styles from './Grid.module.scss';

interface GridProps {
  children: (React.ReactElement | null)[] | null;
  allowMultipleSelection: boolean;
  selectedKeys: Set<string>;
  setSelectedKeys: (keys: Set<string>) => void;
}

const SelectableGrid = (props: GridProps) => {
  const { children, allowMultipleSelection, selectedKeys, setSelectedKeys } =
    props;

  const [lastSelected, setLastSelected] = useState<string | null>(null);

  // TODO: Deselect all when clicking on empty space

  const clickHandler = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    rkey: React.Key
  ) => {
    const key = rkey.toString();
    if (e.ctrlKey) {
      // Ctrl + click: toggle selection
      const newSelectedKeys = new Set<string>(selectedKeys);
      if (selectedKeys.has(key)) {
        newSelectedKeys.delete(key);
      } else {
        if (!allowMultipleSelection) newSelectedKeys.clear();
        newSelectedKeys.add(key);
      }
      setSelectedKeys(new Set(newSelectedKeys));
    } else if (e.shiftKey && lastSelected) {
      // Shift + click: select all between last selected and current selected
      if (children === null) return;
      const lastSelectedIndex = children.findIndex(
        (child) => child && child.key === lastSelected
      );
      const currentSelectedIndex = children.findIndex(
        (child) => child && child.key === key
      );
      const minIndex = Math.min(lastSelectedIndex, currentSelectedIndex);
      const maxIndex = Math.max(lastSelectedIndex, currentSelectedIndex);
      const newSelectedKeys = new Set<string>(selectedKeys);
      for (let i = minIndex; i <= maxIndex; i += 1) {
        const child = children[i];
        if (child && child.key) newSelectedKeys.add(child.key.toString());
      }
      setSelectedKeys(newSelectedKeys);
    } else {
      // Click: select only this
      setSelectedKeys(new Set([key]));
    }
    setLastSelected(key);
    e.stopPropagation();
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
    <div
      className={Styles.gridContainer}
      onClick={() => setSelectedKeys(new Set())}
    >
      {Children.map(
        children,
        (child) =>
          React.isValidElement(child) && (
            // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
            <div
              className={Styles.gridItem}
              onClick={(e) => child.key && clickHandler(e, child.key)}
            >
              {child}
            </div>
          )
      )}
    </div>
  );
};

export default SelectableGrid;
